import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchQueryDto {
  @ApiProperty({
    description: 'Search query',
    minLength: 2,
    example: 'tiesto',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  q!: string;
}
