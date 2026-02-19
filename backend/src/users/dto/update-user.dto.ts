import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// PATCH isteğinde her alan opsiyonel olmalı; gelen alanlar doğrulanır.
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Yunus Can',
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
  name?: string;

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
}
