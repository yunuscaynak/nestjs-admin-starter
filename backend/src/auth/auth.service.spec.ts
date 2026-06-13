import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('./auth.utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-secret'),
  verifyPassword: jest.fn(),
}));

import { verifyPassword } from './auth.utils';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get(AuthService);

    jest.clearAllMocks();
    jwtServiceMock.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
  });

  it('login response does not expose passwordHash', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: Role.USER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      passwordHash: 'stored-hash',
    });
    prismaMock.user.update.mockResolvedValue(undefined);
    (verifyPassword as jest.Mock).mockResolvedValue(true);

    const response = await service.login({
      email: 'ada@example.com',
      password: 'StrongPass123!',
      rememberMe: true,
    });

    expect(response.user).toEqual({
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: Role.USER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(response.user).not.toHaveProperty('passwordHash');
  });

  it('bootstrapAdmin promotes the authenticated user when no admin exists', async () => {
    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: Role.USER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      passwordHash: 'stored-hash',
    });
    prismaMock.user.update
      .mockResolvedValueOnce({
        id: 'user-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        role: Role.ADMIN,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      })
      .mockResolvedValueOnce(undefined);
    (verifyPassword as jest.Mock).mockResolvedValue(true);

    const response = await service.bootstrapAdmin(
      {
        id: 'user-1',
        email: 'ada@example.com',
        role: Role.USER,
        rememberMe: true,
      },
      { password: 'StrongPass123!' },
    );

    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: { role: Role.ADMIN },
    });
    expect(prismaMock.user.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'user-1' },
      data: { role: Role.ADMIN },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(response.role).toBe(Role.ADMIN);
    expect(response.user.role).toBe(Role.ADMIN);
  });

  it('bootstrapAdmin rejects when an admin already exists', async () => {
    prismaMock.user.count.mockResolvedValue(1);

    await expect(
      service.bootstrapAdmin(
        {
          id: 'user-1',
          email: 'ada@example.com',
          role: Role.USER,
          rememberMe: false,
        },
        { password: 'StrongPass123!' },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('register rejects duplicate emails', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-user' });

    await expect(
      service.register({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'StrongPass123!',
        rememberMe: false,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('bootstrapAdmin rejects invalid password', async () => {
    prismaMock.user.count.mockResolvedValue(0);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: Role.USER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      passwordHash: 'stored-hash',
    });
    (verifyPassword as jest.Mock).mockResolvedValue(false);

    await expect(
      service.bootstrapAdmin(
        {
          id: 'user-1',
          email: 'ada@example.com',
          role: Role.USER,
          rememberMe: false,
        },
        { password: 'WrongPass123!' },
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
