import { ApiProperty } from '@nestjs/swagger';
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

export class CreateUserDto {
  @ApiProperty({
    example: 'Yunus',
    description: 'Kullanıcının adı.',
    minLength: 2,
    maxLength: 80,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  firstName!: string;

  @ApiProperty({
    example: 'Çaynak',
    description: 'Kullanıcının soyadı.',
    minLength: 2,
    maxLength: 80,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  lastName!: string;

  @ApiProperty({
    example: 'yunus@example.com',
    description: 'Kullanıcıya ait benzersiz e-posta adresi.',
    maxLength: 254,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsNotEmpty()
  @MaxLength(254)
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Admin123!',
    description: 'Kullanicinin ilk giris sifresi.',
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Kullanicinin sistem rolu.',
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
