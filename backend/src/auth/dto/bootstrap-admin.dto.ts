import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class BootstrapAdminDto {
  @ApiProperty({
    example: 'Admin123!',
    description:
      'Giris yapmis kullanicinin mevcut sifresi. Admin yukselmesi oncesi tekrar dogrulanir.',
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
