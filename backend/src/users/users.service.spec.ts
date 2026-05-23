import {
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserSortOption } from './dto/list-users-query.dto';
import { PUBLIC_USER_SELECT, UsersService } from './users.service';

jest.mock('../auth/auth.utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get(UsersService);

    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation((operations: unknown[]) =>
      Promise.all(operations),
    );
  });

  it('create default role ve hashlenmis password ile kullanici olusturur', async () => {
    const createdUser = {
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: Role.USER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    prismaMock.user.create.mockResolvedValue(createdUser);

    await expect(
      service.create({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'StrongPass123!',
      }),
    ).resolves.toEqual(createdUser);

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        passwordHash: 'hashed-password',
        role: Role.USER,
      },
      select: PUBLIC_USER_SELECT,
    });
  });

  it('findAll filtreleme, siralama ve meta bilgilerini dondurur', async () => {
    const items = [
      {
        id: 'user-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      },
    ];

    prismaMock.user.findMany.mockResolvedValue(items);
    prismaMock.user.count.mockResolvedValue(5);

    await expect(
      service.findAll({
        page: 2,
        limit: 2,
        sort: UserSortOption.EmailAsc,
        q: 'ada',
      }),
    ).resolves.toEqual({
      items,
      meta: {
        page: 2,
        pageSize: 2,
        total: 5,
        totalPages: 3,
      },
    });

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            firstName: {
              contains: 'ada',
            },
          },
          {
            lastName: {
              contains: 'ada',
            },
          },
          {
            email: {
              contains: 'ada',
            },
          },
        ],
      },
      orderBy: { email: 'asc' },
      skip: 2,
      take: 2,
      select: PUBLIC_USER_SELECT,
    });

    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            firstName: {
              contains: 'ada',
            },
          },
          {
            lastName: {
              contains: 'ada',
            },
          },
          {
            email: {
              contains: 'ada',
            },
          },
        ],
      },
    });
  });

  it('findOne kayit yoksa NotFoundException firlatir', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-user')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('remove mevcut kaydi siler', async () => {
    const existingUser = {
      id: 'user-1',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      role: Role.USER,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    prismaMock.user.findUnique.mockResolvedValue(existingUser);
    prismaMock.user.delete.mockResolvedValue(existingUser);

    await expect(service.remove('user-1')).resolves.toEqual(existingUser);

    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      select: PUBLIC_USER_SELECT,
    });
  });

  it('create duplicate email oldugunda ConflictException firlatir', async () => {
    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed.', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        password: 'StrongPass123!',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('findAll schema hazir degilse ServiceUnavailableException firlatir', async () => {
    prismaMock.user.findMany.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Table does not exist.', {
        code: 'P2021',
        clientVersion: 'test',
      }),
    );

    await expect(service.findAll({})).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
