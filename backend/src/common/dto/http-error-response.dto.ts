import { ApiProperty } from '@nestjs/swagger';

export class HttpErrorResponseDto {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'NOT_FOUND' })
  code: string;

  @ApiProperty({ example: 'Resource not found' })
  message: string;

  @ApiProperty({
    example: ['Kayit bulunamadi.'],
    type: [String],
    required: false,
  })
  errors?: string[];

  @ApiProperty({ example: '2026-05-06T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/users/123' })
  path: string;

  @ApiProperty({ example: 'GET' })
  method: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code: string;

  @ApiProperty({ example: 'Gonderilen veri dogrulanamadi.' })
  message: string;

  @ApiProperty({
    example: [
      'email must be an email',
      'name must be longer than 1 characters',
    ],
    type: [String],
  })
  errors: string[];

  @ApiProperty({ example: '2026-05-06T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/users' })
  path: string;

  @ApiProperty({ example: 'POST' })
  method: string;
}
