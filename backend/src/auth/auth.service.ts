import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PUBLIC_USER_SELECT,
  type PublicUserRecord,
} from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from './jwt.service';
import { hashPassword, verifyPassword } from './auth.utils';

export type AuthResponse = {
  accessToken: string;
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

    return this.buildAuthResponse(user);
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

    return this.buildAuthResponse(user);
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

  private buildAuthResponse(
    user: PublicUserRecord & { role: Role },
  ): AuthResponse {
    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      role: user.role,
      user,
    };
  }
}
