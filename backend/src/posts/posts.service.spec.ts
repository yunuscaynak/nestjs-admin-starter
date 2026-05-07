import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PostSortOption } from './dto/list-posts-query.dto';
import { POST_PUBLIC_SELECT, PostsService } from './posts.service';

describe('PostsService', () => {
  let service: PostsService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    post: {
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
        PostsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get(PostsService);

    jest.clearAllMocks();
    prismaMock.$transaction.mockImplementation((operations: unknown[]) =>
      Promise.all(operations),
    );
  });

  it('create author bulunamadiginda NotFoundException firlatir', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        title: 'Test baslik',
        content: 'Yeterince uzun bir test icerigi.',
        authorId: 'missing-user',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.post.create).not.toHaveBeenCalled();
  });

  it('create default published=false ile post olusturur', async () => {
    const createdPost = {
      id: 'post-1',
      title: 'Test baslik',
      content: 'Yeterince uzun bir test icerigi.',
      published: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      author: {
        id: 'user-1',
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
      },
    };

    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' });
    prismaMock.post.create.mockResolvedValue(createdPost);

    await expect(
      service.create({
        title: 'Test baslik',
        content: 'Yeterince uzun bir test icerigi.',
        authorId: 'user-1',
      }),
    ).resolves.toEqual(createdPost);

    expect(prismaMock.post.create).toHaveBeenCalledWith({
      data: {
        title: 'Test baslik',
        content: 'Yeterince uzun bir test icerigi.',
        published: false,
        authorId: 'user-1',
      },
      select: POST_PUBLIC_SELECT,
    });
  });

  it('findAll filtreleme, sayfalama ve meta bilgilerini dondurur', async () => {
    const items = [
      {
        id: 'post-1',
        title: 'NestJS',
      },
    ];

    prismaMock.post.findMany.mockResolvedValue(items);
    prismaMock.post.count.mockResolvedValue(5);

    await expect(
      service.findAll({
        page: 2,
        limit: 2,
        sort: PostSortOption.TitleAsc,
        q: 'nestjs',
        authorId: 'user-1',
        published: true,
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

    expect(prismaMock.post.findMany).toHaveBeenCalledWith({
      where: {
        authorId: 'user-1',
        published: true,
        OR: [
          {
            title: {
              contains: 'nestjs',
            },
          },
          {
            content: {
              contains: 'nestjs',
            },
          },
        ],
      },
      orderBy: { title: 'asc' },
      skip: 2,
      take: 2,
      select: POST_PUBLIC_SELECT,
    });

    expect(prismaMock.post.count).toHaveBeenCalledWith({
      where: {
        authorId: 'user-1',
        published: true,
        OR: [
          {
            title: {
              contains: 'nestjs',
            },
          },
          {
            content: {
              contains: 'nestjs',
            },
          },
        ],
      },
    });
  });

  it('findOne kayit varsa postu dondurur', async () => {
    const post = { id: 'post-1', title: 'Test baslik' };

    prismaMock.post.findUnique.mockResolvedValue(post);

    await expect(service.findOne('post-1')).resolves.toEqual(post);
    expect(prismaMock.post.findUnique).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      select: POST_PUBLIC_SELECT,
    });
  });

  it('findOne kayit yoksa NotFoundException firlatir', async () => {
    prismaMock.post.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-post')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update authorId geldiyse once author kontrolu yapar ve postu gunceller', async () => {
    const existingPost = {
      id: 'post-1',
      title: 'Eski baslik',
    };
    const updatedPost = {
      id: 'post-1',
      title: 'Yeni baslik',
    };

    prismaMock.post.findUnique.mockResolvedValue(existingPost);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' });
    prismaMock.post.update.mockResolvedValue(updatedPost);

    await expect(
      service.update('post-1', {
        title: 'Yeni baslik',
        authorId: 'user-2',
      }),
    ).resolves.toEqual(updatedPost);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-2' },
      select: { id: true },
    });
    expect(prismaMock.post.update).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      data: {
        title: 'Yeni baslik',
        authorId: 'user-2',
      },
      select: POST_PUBLIC_SELECT,
    });
  });

  it('remove mevcut kaydi siler', async () => {
    const existingPost = {
      id: 'post-1',
      title: 'Silinecek post',
    };
    const deletedPost = {
      id: 'post-1',
      title: 'Silinecek post',
    };

    prismaMock.post.findUnique.mockResolvedValue(existingPost);
    prismaMock.post.delete.mockResolvedValue(deletedPost);

    await expect(service.remove('post-1')).resolves.toEqual(deletedPost);

    expect(prismaMock.post.delete).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      select: POST_PUBLIC_SELECT,
    });
  });
});
