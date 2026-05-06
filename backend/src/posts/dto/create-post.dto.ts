import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'NestJS modulleri',
    description: 'Yazinin basligi.',
    minLength: 3,
    maxLength: 160,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(160)
  title: string;

  @ApiProperty({
    example: 'Bu yazi service-controller-module katmanlarini acikliyor.',
    description: 'Yazinin govdesi.',
    minLength: 10,
    maxLength: 5000,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  content: string;

  @ApiProperty({
    example: false,
    description: 'Yazinin yayinlanmis olup olmadigi.',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({
    example: 'cmab12cd30000xyz123456789',
    description: 'Yazinin yazari olacak kullanicinin ID degeri.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  authorId: string;
}
