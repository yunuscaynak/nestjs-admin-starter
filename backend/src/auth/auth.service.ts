import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN_SECONDS,
} from './auth.constants';
import { PrismaService } from '../prisma/prisma.service';
import {
  PUBLIC_USER_SELECT,
  type PublicUserRecord,
} from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from './jwt.service';
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

  async refresh({ refreshToken }: RefreshTokenDto): Promise<AuthResponse> {
    const payload = this.jwtService.verify(refreshToken, 'refresh');

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
    const payload = this.jwtService.verify(refreshToken, 'refresh');

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
    const accessTokenExpiresInSeconds = 60 * 15;
    const refreshTokenExpiresInSeconds = rememberMe
      ? REFRESH_TOKEN_REMEMBER_ME_EXPIRES_IN_SECONDS
      : REFRESH_TOKEN_EXPIRES_IN_SECONDS;
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tokenType: 'access',
        rememberMe,
      },
      { expiresInSeconds: accessTokenExpiresInSeconds },
    );
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tokenType: 'refresh',
        rememberMe,
      },
      { expiresInSeconds: refreshTokenExpiresInSeconds },
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

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
      rememberMe,
      role: user.role,
      user,
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
}
