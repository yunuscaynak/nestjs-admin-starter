import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 'cmab12cd30000xyz123456789' })
  id: string;

  @ApiProperty({ example: 'Yunus' })
  firstName: string;

  @ApiProperty({ example: 'Caynak' })
  lastName: string;

  @ApiProperty({ example: 'yunus@example.com' })
  email: string;

  @ApiProperty({
    enum: Role,
    example: Role.ADMIN,
  })
  role: Role;

  @ApiProperty({
    example: '2026-02-19T12:00:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-02-19T13:00:00.000Z',
    format: 'date-time',
  })
  updatedAt: Date;
}
