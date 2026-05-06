import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum PostSortOption {
  TitleAsc = 'title:asc',
  TitleDesc = 'title:desc',
  CreatedAtAsc = 'createdAt:asc',
  CreatedAtDesc = 'createdAt:desc',
  UpdatedAtAsc = 'updatedAt:asc',
  UpdatedAtDesc = 'updatedAt:desc',
}

export class ListPostsQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Sayfa numarasi.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    description: 'Sayfa basina kayit sayisi.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: 'nestjs',
    description: 'Baslik veya icerik icinde metin aramasi.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') {
      return value;
    }
    const normalizedValue = value.trim();
    return normalizedValue.length === 0 ? undefined : normalizedValue;
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({
    example: 'cmab12cd30000xyz123456789',
    description: 'Belirli bir yazarin postlarini filtreler.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsOptional()
  @MinLength(1)
  authorId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Yayin durumuna gore filtreleme yapar.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'boolean') {
      return value;
    }

    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return value;
  })
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({
    enum: PostSortOption,
    default: PostSortOption.CreatedAtDesc,
    description: 'Siralama bicimi.',
  })
  @IsOptional()
  @IsEnum(PostSortOption)
  sort?: PostSortOption;
}
