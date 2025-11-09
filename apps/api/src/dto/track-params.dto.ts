import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class TrackParamsDto {
  @ApiProperty({
    description: 'Track ID',
    example: '1',
  })
  @IsString()
  @Matches(/^\d+$/, { message: 'id must be a numeric string' })
  id!: string;
}

