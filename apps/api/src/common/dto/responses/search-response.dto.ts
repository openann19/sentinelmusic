import { ApiProperty } from '@nestjs/swagger';
import { SourceLinkDto } from './artist-response.dto';

export class SearchTrackDto {
  @ApiProperty({
    description: 'Track ID',
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Track title',
    example: 'Track Title',
  })
  title!: string;

  @ApiProperty({
    description: 'Duration in seconds',
    required: false,
  })
  durationSeconds?: number;

  @ApiProperty({
    description: 'BPM',
    required: false,
  })
  bpm?: number;

  @ApiProperty({
    description: 'Key text',
    required: false,
  })
  keyText?: string;

  @ApiProperty({
    description: 'ISRC',
    required: false,
  })
  isrc?: string;

  @ApiProperty({
    description: 'Release information',
    required: false,
  })
  release?: {
    id: string;
    title: string;
    releaseDate?: string;
    releaseType: string;
    coverUrl?: string;
    artist: {
      id: string;
      name: string;
      sortName?: string;
      country?: string;
    };
  };

  @ApiProperty({
    description: 'Source links',
    type: [SourceLinkDto],
    required: false,
  })
  links?: SourceLinkDto[];
}

export class SearchArtistDto {
  @ApiProperty({
    description: 'Artist ID',
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Artist name',
    example: 'Artist Name',
  })
  name!: string;

  @ApiProperty({
    description: 'Artist sort name',
    required: false,
  })
  sortName?: string;

  @ApiProperty({
    description: 'Artist country',
    required: false,
  })
  country?: string;
}

export class SearchResponseDto {
  @ApiProperty({
    description: 'Artists matching the search query',
    type: [SearchArtistDto],
  })
  artists!: SearchArtistDto[];

  @ApiProperty({
    description: 'Tracks matching the search query',
    type: [SearchTrackDto],
  })
  tracks!: SearchTrackDto[];
}

