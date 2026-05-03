import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Yunus', description: 'Kullanicinin adi.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  firstName: string;

  @ApiProperty({ example: 'Caynak', description: 'Kullanicinin soyadi.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(80)
  lastName: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'Kullanicinin e-posta adresi.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: 'Admin123!',
    description: 'Kullanicinin sifresi.',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({
    example: true,
    description:
      'Secilirse uzun omurlu refresh token uretilir ve oturum kalici saklanir.',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
