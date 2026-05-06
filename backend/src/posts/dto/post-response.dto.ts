import { ApiProperty } from '@nestjs/swagger';

class PostAuthorResponseDto {
  @ApiProperty({ example: 'cmab12cd30000xyz123456789' })
  id: string;

  @ApiProperty({ example: 'Yunus' })
  firstName: string;

  @ApiProperty({ example: 'Caynak' })
  lastName: string;

  @ApiProperty({ example: 'yunus@example.com' })
  email: string;
}

export class PostResponseDto {
  @ApiProperty({ example: 'cmab12cd30000xyz123456789' })
  id: string;

  @ApiProperty({ example: 'NestJS modullerini ogreniyorum' })
  title: string;

  @ApiProperty({
    example: 'Bu yazi service-controller-module katmanlarini acikliyor.',
  })
  content: string;

  @ApiProperty({ example: false })
  published: boolean;

  @ApiProperty({ type: PostAuthorResponseDto })
  author: PostAuthorResponseDto;

  @ApiProperty({
    example: '2026-05-03T10:00:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-05-03T10:30:00.000Z',
    format: 'date-time',
  })
  updatedAt: Date;
}
