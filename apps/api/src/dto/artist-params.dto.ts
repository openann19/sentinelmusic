import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ArtistParamsDto {
  @ApiProperty({
    description: 'Artist ID',
    example: '1',
  })
  @IsString()
  @Matches(/^\d+$/, { message: 'Artist ID must be a valid number' })
  id!: string;
}
