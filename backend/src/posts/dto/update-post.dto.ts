import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdatePostDto {
  @ApiPropertyOptional({
    example: 'NestJS modul',
    description: 'Guncellenecek baslik.',
    minLength: 3,
    maxLength: 160,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(160)
  title?: string;

  @ApiPropertyOptional({
    example: 'Bu guncellemede DTO, service ve Prisma secimini anlatiyorum.',
    description: 'Guncellenecek icerik.',
    minLength: 10,
    maxLength: 5000,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  content?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Yazinin yayin durumu.',
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({
    example: 'cmab12cd30000xyz123456789',
    description: 'Yazinin yeni yazar kullanici ID degeri.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  authorId?: string;
}
