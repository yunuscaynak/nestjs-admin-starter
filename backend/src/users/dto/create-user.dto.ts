import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Yunus',
    description: 'Kullanıcının görünen adı.',
  })
  // Kullanıcı adı boş string olmamalı ve metin olmalı.
  @IsString()
  name: string;

  @ApiProperty({
    example: 'yunus@example.com',
    description: 'Kullanıcıya ait benzersiz e-posta adresi.',
  })
  // E-posta formatını class-validator otomatik doğrular.
  @IsEmail()
  email: string;
}
