import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type UserRecord = Prisma.UserGetPayload<Prisma.UserDefaultArgs>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // CREATE: Gelen DTO'dan yeni kullanıcı kaydı açar.
  async create(createUserDto: CreateUserDto): Promise<UserRecord> {
    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // READ (list): Tüm kullanıcıları yeni kayıt en üstte olacak şekilde döndürür.
  async findAll(): Promise<UserRecord[]> {
    try {
      return await this.prisma.user.findMany({
        orderBy: { id: 'desc' },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // READ (single): ID ile tek kullanıcı bulur, yoksa 404 verir.
  async findOne(id: number): Promise<UserRecord> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
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
  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserRecord> {
    await this.findOne(id);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // DELETE: Silmeden önce kaydı kontrol eder; böylece anlamlı 404 dönebiliriz.
  async remove(id: number): Promise<UserRecord> {
    await this.findOne(id);

    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  // Prisma hatalarını HTTP seviyesinde anlaşılır Nest exception'larına çevirir.
  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'ECONNREFUSED'
    ) {
      throw new ServiceUnavailableException(
        'Veritabanına bağlanılamadı. PostgreSQL servisinin çalıştığını kontrol et.',
      );
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Bu e-posta adresi zaten kullanımda.');
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new ServiceUnavailableException(
        'Veritabanı başlatılamadı. DATABASE_URL ve PostgreSQL durumunu kontrol et.',
      );
    }

    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      throw new ServiceUnavailableException(
        'Veritabanına bağlanılamadı. PostgreSQL servisinin çalıştığını kontrol et.',
      );
    }

    throw error;
  }
}
