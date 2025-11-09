import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Health status',
    example: 'ok',
  })
  status!: string;

  @ApiProperty({
    description: 'Timestamp of the health check',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp!: string;
}
