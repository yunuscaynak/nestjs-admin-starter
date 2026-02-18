import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

// PATCH isteğinde her alan opsiyonel olmalı; gelen alanlar doğrulanır.
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Yunus Can',
    description: 'Kullanıcının güncellenecek adı.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'yunuscan@example.com',
    description: 'Kullanıcının güncellenecek e-posta adresi.',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
