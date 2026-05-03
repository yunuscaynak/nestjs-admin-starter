import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Giris yapacak kullanicinin e-posta adresi.',
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
    description: 'Kullanici sifresi.',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
