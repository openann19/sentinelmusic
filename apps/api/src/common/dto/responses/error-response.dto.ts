import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error messages',
    example: ['Validation failed'],
    type: [String],
  })
  message!: string[];

  @ApiProperty({
    description: 'Error type',
    example: 'validation_error',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'Timestamp of the error',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/v1/artists/1',
  })
  path!: string;

  @ApiProperty({
    description: 'Field-level validation errors',
    required: false,
  })
  errors?: Record<string, string[]>;
}

