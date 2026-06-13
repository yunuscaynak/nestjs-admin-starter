import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import {
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN_SECONDS,
} from './auth.constants';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser, JwtPayload } from './auth.types';
import {
  PUBLIC_USER_SELECT,
  type PublicUserRecord,
} from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { BootstrapAdminDto } from './dto/bootstrap-admin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { hashPassword, verifyPassword } from './auth.utils';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  rememberMe: boolean;
  role: Role;
  user: PublicUserRecord;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Bu e-posta adresi zaten kullanimda.');
    }

    const authUsers = await this.prisma.user.findMany({
      select: {
        passwordHash: true,
      },
    });
    const hasExistingAuthUser = authUsers.some((user) =>
      Boolean(user.passwordHash),
    );
    const role = hasExistingAuthUser ? Role.USER : Role.ADMIN;
    const passwordHash = await hashPassword(registerDto.password);

    const user = await this.prisma.user.create({
      data: {
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        passwordHash,
        role,
      },
      select: PUBLIC_USER_SELECT,
    });

    return this.createSession(user, registerDto.rememberMe ?? false);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      select: {
        ...PUBLIC_USER_SELECT,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('E-posta veya sifre hatali.');
    }

    const isPasswordValid = await verifyPassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya sifre hatali.');
    }

    return this.createSession(user, loginDto.rememberMe ?? false);
  }

  async bootstrapAdmin(
    currentUser: AuthenticatedUser,
    { password }: BootstrapAdminDto,
  ): Promise<AuthResponse> {
    const adminCount = await this.prisma.user.count({
      where: { role: Role.ADMIN },
    });

    if (adminCount > 0) {
      throw new ForbiddenException('Sistemde zaten bir admin kullanicisi var.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        ...PUBLIC_USER_SELECT,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Kullanici bulunamadi.');
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-posta veya sifre hatali.');
    }

    const promotedUser = await this.prisma.user.update({
      where: { id: currentUser.id },
      data: { role: Role.ADMIN },
      select: PUBLIC_USER_SELECT,
    });

    return this.createSession(promotedUser, currentUser.rememberMe);
  }

  async refresh({ refreshToken }: RefreshTokenDto): Promise<AuthResponse> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        ...PUBLIC_USER_SELECT,
        refreshTokenHash: true,
        refreshTokenExpiresAt: true,
      },
    });

    if (!user || !user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Refresh token gecersiz.');
    }

    if (user.refreshTokenExpiresAt.getTime() <= Date.now()) {
      await this.clearStoredRefreshToken(payload.sub);
      throw new UnauthorizedException('Refresh token suresi dolmus.');
    }

    const isTokenValid = await verifyPassword(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isTokenValid) {
      throw new UnauthorizedException('Refresh token gecersiz.');
    }

    return this.createSession(user, payload.rememberMe);
  }

  async logout({ refreshToken }: RefreshTokenDto): Promise<{ success: true }> {
    const payload = await this.verifyRefreshToken(refreshToken);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        refreshTokenHash: true,
      },
    });

    if (user?.refreshTokenHash) {
      const isTokenValid = await verifyPassword(
        refreshToken,
        user.refreshTokenHash,
      );

      if (isTokenValid) {
        await this.clearStoredRefreshToken(payload.sub);
      }
    }

    return { success: true };
  }

  async me(userId: string): Promise<PublicUserRecord> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });

    if (!user) {
      throw new UnauthorizedException('Kullanici bulunamadi.');
    }

    return user;
  }

  private async createSession(
    user: PublicUserRecord & { role: Role },
    rememberMe: boolean,
  ): Promise<AuthResponse> {
    const accessTokenExpiresInSeconds = ACCESS_TOKEN_EXPIRES_IN_SECONDS;
    const refreshTokenExpiresInSeconds = rememberMe
      ? REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN_SECONDS
      : REFRESH_TOKEN_EXPIRES_IN_SECONDS;
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tokenType: 'access',
        rememberMe,
      },
      {
        secret: JWT_SECRET,
        expiresIn: accessTokenExpiresInSeconds,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tokenType: 'refresh',
        rememberMe,
      },
      {
        secret: JWT_REFRESH_SECRET,
        expiresIn: refreshTokenExpiresInSeconds,
      },
    );
    const accessTokenExpiresAt = new Date(
      Date.now() + accessTokenExpiresInSeconds * 1000,
    );
    const refreshTokenExpiresAt = new Date(
      Date.now() + refreshTokenExpiresInSeconds * 1000,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: await hashPassword(refreshToken),
        refreshTokenExpiresAt,
      },
    });

    const publicUser: PublicUserRecord = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
      rememberMe,
      role: publicUser.role,
      user: publicUser,
    };
  }

  private async clearStoredRefreshToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });
  }

  private async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: JWT_REFRESH_SECRET,
        },
      );

      if (payload.tokenType !== 'refresh') {
        throw new UnauthorizedException('Refresh token gecersiz.');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Refresh token gecersiz.');
    }
  }
}
