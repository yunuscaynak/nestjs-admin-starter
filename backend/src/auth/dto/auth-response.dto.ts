import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2lkIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcxMDAwMDAwMCwiZXhwIjoxNzEwMDg2NDAwfQ.signature',
    description: 'Kisa omurlu bearer access token.',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.token.signature',
    description: 'Oturum yenileme ve logout icin kullanilacak refresh token.',
  })
  refreshToken!: string;

  @ApiProperty({
    example: '2026-05-03T13:45:00.000Z',
    description: 'Access token bitis zamani.',
    format: 'date-time',
  })
  accessTokenExpiresAt!: string;

  @ApiProperty({
    example: '2026-06-02T13:30:00.000Z',
    description: 'Refresh token bitis zamani.',
    format: 'date-time',
  })
  refreshTokenExpiresAt!: string;

  @ApiProperty({
    example: true,
    description: 'Kullanici remember me secenegini acik tuttu mu.',
  })
  rememberMe!: boolean;

  @ApiProperty({
    enum: Role,
    example: Role.ADMIN,
    description: 'Kullanicinin rolu.',
  })
  role!: Role;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Kullanicinin acik profili.',
  })
  user!: UserResponseDto;
}
