import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsQueryDto, PostSortOption } from './dto/list-posts-query.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export const POST_AUTHOR_SELECT = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  firstName: true,
  lastName: true,
  email: true,
});

export const POST_PUBLIC_SELECT = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  title: true,
  content: true,
  published: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: POST_AUTHOR_SELECT,
  },
});

export type PostRecord = Prisma.PostGetPayload<{
  select: typeof POST_PUBLIC_SELECT;
}>;

export type PostsListResponse = {
  items: PostRecord[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto): Promise<PostRecord> {
    await this.ensureUserExists(createPostDto.authorId);

    try {
      return await this.prisma.post.create({
        data: {
          title: createPostDto.title,
          content: createPostDto.content,
          published: createPostDto.published ?? false,
          authorId: createPostDto.authorId,
        },
        select: POST_PUBLIC_SELECT,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(query: ListPostsQueryDto): Promise<PostsListResponse> {
    return this.findMany(query);
  }

  async publicFindAll(query: ListPostsQueryDto): Promise<PostsListResponse> {
    return this.findMany(query, { publishedOnly: true });
  }

  async publicFindOne(id: string): Promise<PostRecord> {
    return this.findOneById(id, { publishedOnly: true });
  }

  async findOne(id: string): Promise<PostRecord> {
    return this.findOneById(id);
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<PostRecord> {
    await this.findOne(id);

    if (updatePostDto.authorId) {
      await this.ensureUserExists(updatePostDto.authorId);
    }

    try {
      return await this.prisma.post.update({
        where: { id },
        data: updatePostDto,
        select: POST_PUBLIC_SELECT,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string): Promise<PostRecord> {
    await this.findOne(id);

    try {
      return await this.prisma.post.delete({
        where: { id },
        select: POST_PUBLIC_SELECT,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async findMany(
    query: ListPostsQueryDto,
    options?: {
      publishedOnly?: boolean;
    },
  ): Promise<PostsListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = query.sort ?? PostSortOption.CreatedAtDesc;
    const searchQuery = query.q;
    const skip = (page - 1) * limit;
    const publishedOnly = options?.publishedOnly ?? false;

    const where: Prisma.PostWhereInput = {
      ...(query.authorId ? { authorId: query.authorId } : {}),
      ...(publishedOnly
        ? { published: true }
        : typeof query.published === 'boolean'
          ? { published: query.published }
          : {}),
      ...(searchQuery
        ? {
            OR: [
              {
                title: {
                  contains: searchQuery,
                },
              },
              {
                content: {
                  contains: searchQuery,
                },
              },
            ],
          }
        : {}),
    };

    try {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.post.findMany({
          where,
          orderBy: this.mapSortToOrderBy(sort),
          skip,
          take: limit,
          select: POST_PUBLIC_SELECT,
        }),
        this.prisma.post.count({ where }),
      ]);

      return {
        items,
        meta: {
          page,
          pageSize: limit,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async findOneById(
    id: string,
    options?: {
      publishedOnly?: boolean;
    },
  ): Promise<PostRecord> {
    try {
      const post = await this.prisma.post.findFirst({
        where: {
          id,
          ...(options?.publishedOnly ? { published: true } : {}),
        },
        select: POST_PUBLIC_SELECT,
      });

      if (!post) {
        throw new NotFoundException(`Post bulunamadi. id=${id}`);
      }

      return post;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async ensureUserExists(authorId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException(`Yazar kullanici bulunamadi. id=${authorId}`);
    }
  }

  private mapSortToOrderBy(
    sort: PostSortOption,
  ): Prisma.PostOrderByWithRelationInput {
    switch (sort) {
      case PostSortOption.TitleAsc:
        return { title: 'asc' };
      case PostSortOption.TitleDesc:
        return { title: 'desc' };
      case PostSortOption.CreatedAtAsc:
        return { createdAt: 'asc' };
      case PostSortOption.CreatedAtDesc:
        return { createdAt: 'desc' };
      case PostSortOption.UpdatedAtAsc:
        return { updatedAt: 'asc' };
      case PostSortOption.UpdatedAtDesc:
        return { updatedAt: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2021' || error.code === 'P2022')
    ) {
      throw new ServiceUnavailableException(
        'Veritabani semasi hazir degil. `pnpm db:push` veya migration komutlarini calistir.',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Kayit bulunamadi.');
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new ServiceUnavailableException(
        'Veritabani baslatilamadi. DATABASE_URL ayarini kontrol et.',
      );
    }

    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      throw new ServiceUnavailableException(
        'Veritabanina baglanilamadi. Prisma baglanti ayarlarini kontrol et.',
      );
    }

    throw error;
  }
}
