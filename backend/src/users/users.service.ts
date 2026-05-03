import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { hashPassword } from '../auth/auth.utils';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto, UserSortOption } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export const PUBLIC_USER_SELECT = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
});

export type PublicUserRecord = Prisma.UserGetPayload<{
  select: typeof PUBLIC_USER_SELECT;
}>;

export type UsersListResponse = {
  items: PublicUserRecord[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE: Gelen DTO'dan yeni kullanıcı kaydı açar.
  async create(createUserDto: CreateUserDto): Promise<PublicUserRecord> {
    try {
      return await this.prisma.user.create({
        data: {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          passwordHash: await hashPassword(createUserDto.password),
          role: createUserDto.role ?? Role.USER,
        },
        select: PUBLIC_USER_SELECT,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // READ (list): Tüm kullanıcıları yeni kayıt en üstte olacak şekilde döndürür.
  async findAll(query: ListUsersQueryDto): Promise<UsersListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = query.sort ?? UserSortOption.CreatedAtDesc;
    const searchQuery = query.q;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput | undefined = searchQuery
      ? {
          OR: [
            {
              firstName: {
                contains: searchQuery,
              },
            },
            {
              lastName: {
                contains: searchQuery,
              },
            },
            {
              email: {
                contains: searchQuery,
              },
            },
          ],
        }
      : undefined;

    try {
      const [items, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          where,
          orderBy: this.mapSortToOrderBy(sort),
          skip,
          take: limit,
          select: PUBLIC_USER_SELECT,
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        items,
        meta: {
          page,
          pageSize: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // READ (single): ID ile tek kullanıcı bulur, yoksa 404 verir.
  async findOne(id: string): Promise<PublicUserRecord> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: PUBLIC_USER_SELECT,
      });

      if (!user) {
        throw new NotFoundException(`Kullanıcı bulunamadı. id=${id}`);
      }

      return user;
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // UPDATE: Önce kaydın varlığını doğrular, sonra sadece gelen alanları günceller.
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<PublicUserRecord> {
    await this.findOne(id);

    try {
      const { password, ...rest } = updateUserDto;

      return await this.prisma.user.update({
        where: { id },
        data: {
          ...rest,
          ...(password ? { passwordHash: await hashPassword(password) } : {}),
        },
        select: PUBLIC_USER_SELECT,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // DELETE: Silmeden önce kaydı kontrol eder; böylece anlamlı 404 dönebiliriz.
  async remove(id: string): Promise<PublicUserRecord> {
    await this.findOne(id);

    try {
      return await this.prisma.user.delete({
        where: { id },
        select: PUBLIC_USER_SELECT,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private mapSortToOrderBy(
    sort: UserSortOption,
  ): Prisma.UserOrderByWithRelationInput {
    switch (sort) {
      case UserSortOption.IdAsc:
        return { id: 'asc' };
      case UserSortOption.IdDesc:
        return { id: 'desc' };
      case UserSortOption.NameAsc:
        return { firstName: 'asc' };
      case UserSortOption.NameDesc:
        return { firstName: 'desc' };
      case UserSortOption.EmailAsc:
        return { email: 'asc' };
      case UserSortOption.EmailDesc:
        return { email: 'desc' };
      case UserSortOption.CreatedAtAsc:
        return { createdAt: 'asc' };
      case UserSortOption.CreatedAtDesc:
        return { createdAt: 'desc' };
      case UserSortOption.UpdatedAtAsc:
        return { updatedAt: 'asc' };
      case UserSortOption.UpdatedAtDesc:
        return { updatedAt: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  // Prisma hatalarını HTTP seviyesinde anlaşılır Nest exception'larına çevirir.
  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === 'P2021' || error.code === 'P2022')
    ) {
      throw new ServiceUnavailableException(
        'Veritabanı şeması hazır değil. `pnpm db:push` veya migration komutlarını çalıştır.',
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new ServiceUnavailableException(
        'Veritabanı başlatılamadı. DATABASE_URL ayarını kontrol et.',
      );
    }

    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      throw new ServiceUnavailableException(
        'Veritabanına bağlanılamadı. Prisma bağlantı ayarlarını kontrol et.',
      );
    }

    throw error;
  }
}
