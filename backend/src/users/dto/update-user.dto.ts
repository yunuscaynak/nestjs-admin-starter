import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// PATCH isteğinde her alan opsiyonel olmalı; gelen alanlar doğrulanır.
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Yunus',
    description: 'Kullanıcının güncellenecek adı.',
    minLength: 2,
    maxLength: 80,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Çaynak',
    description: 'Kullanıcının güncellenecek soyadı.',
    minLength: 2,
    maxLength: 80,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  lastName?: string;

  @ApiPropertyOptional({
    example: 'yunuscan@example.com',
    description: 'Kullanıcının güncellenecek e-posta adresi.',
    maxLength: 254,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty()
  @MaxLength(254)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'Admin123!',
    description: 'Kullanicinin yeni sifresi.',
    minLength: 8,
    maxLength: 128,
  })
  @IsOptional()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.ADMIN,
    description: 'Kullanicinin yeni rolu.',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
