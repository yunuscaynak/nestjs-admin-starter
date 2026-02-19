import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserSortOption {
  IdAsc = 'id:asc',
  IdDesc = 'id:desc',
  NameAsc = 'name:asc',
  NameDesc = 'name:desc',
  EmailAsc = 'email:asc',
  EmailDesc = 'email:desc',
  CreatedAtAsc = 'createdAt:asc',
  CreatedAtDesc = 'createdAt:desc',
  UpdatedAtAsc = 'updatedAt:asc',
  UpdatedAtDesc = 'updatedAt:desc',
}

export class ListUsersQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
    minimum: 1,
    description: 'Sayfa numarası.',
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
    description: 'Sayfa başına kayıt sayısı.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: 'yunus',
    minLength: 1,
    maxLength: 100,
    description: 'Ad veya e-posta üzerinde metin araması.',
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
    enum: UserSortOption,
    default: UserSortOption.CreatedAtDesc,
    description: 'Sıralama biçimi.',
  })
  @IsOptional()
  @IsEnum(UserSortOption)
  sort?: UserSortOption;
}
