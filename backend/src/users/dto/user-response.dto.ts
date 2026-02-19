import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Yunus' })
  name: string;

  @ApiProperty({ example: 'yunus@example.com' })
  email: string;

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
