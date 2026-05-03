import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX2lkIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcxMDAwMDAwMCwiZXhwIjoxNzEwMDg2NDAwfQ.signature',
    description: 'Bearer token olarak kullanilacak JWT.',
  })
  accessToken: string;

  @ApiProperty({
    enum: Role,
    example: Role.ADMIN,
    description: 'Kullanicinin rolu.',
  })
  role: Role;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Kullanicinin acik profili.',
  })
  user: UserResponseDto;
}
