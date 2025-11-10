import { ApiProperty } from '@nestjs/swagger';

export class AdminResponseDto {
  @ApiProperty({
    description: 'Admin operation status',
    example: 'Admin access granted',
  })
  message!: string;
}

export class AdminPingResponseDto {
  @ApiProperty({
    description: 'Ping status',
    example: true,
  })
  ok!: boolean;
}
