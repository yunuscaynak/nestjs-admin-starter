import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token.signature',
    description: 'Oturum yenilemek veya sonlandirmak icin refresh token.',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
