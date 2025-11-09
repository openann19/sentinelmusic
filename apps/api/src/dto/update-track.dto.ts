import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class UpdateTrackDto {
  @ApiProperty({
    description: 'BPM (beats per minute)',
    required: false,
    minimum: 1,
    maximum: 300,
    example: 128,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(300)
  bpm?: number | null;

  @ApiProperty({
    description: 'Musical key text (e.g., "8A", "9B")',
    required: false,
    example: '8A',
  })
  @IsOptional()
  @IsString()
  keyText?: string | null;
}

