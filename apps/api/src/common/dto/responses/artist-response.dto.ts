import { ApiProperty } from '@nestjs/swagger';

export class SourceDto {
  @ApiProperty({
    description: 'Source ID',
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Source name',
    example: 'beatport',
  })
  name!: string;

  @ApiProperty({
    description: 'Terms of service URL',
    required: false,
  })
  tosUrl?: string;
}

export class SourceLinkDto {
  @ApiProperty({
    description: 'Source link ID',
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'External ID',
    example: '12345',
  })
  externalId!: string;

  @ApiProperty({
    description: 'URL',
    example: 'https://example.com/track/12345',
  })
  url!: string;

  @ApiProperty({
    description: 'Preview URL',
    required: false,
  })
  previewUrl?: string;

  @ApiProperty({
    description: 'Source information',
    type: SourceDto,
  })
  source!: SourceDto;
}

export class TrackDto {
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
    description: 'Source links',
    type: [SourceLinkDto],
    required: false,
  })
  links?: SourceLinkDto[];
}

export class ReleaseDto {
  @ApiProperty({
    description: 'Release ID',
    example: '1',
  })
  id!: string;

  @ApiProperty({
    description: 'Release title',
    example: 'Release Title',
  })
  title!: string;

  @ApiProperty({
    description: 'Release date',
    required: false,
  })
  releaseDate?: string;

  @ApiProperty({
    description: 'Release type',
    example: 'album',
    enum: ['single', 'ep', 'album', 'compilation'],
  })
  releaseType!: string;

  @ApiProperty({
    description: 'Cover URL',
    required: false,
  })
  coverUrl?: string;

  @ApiProperty({
    description: 'Tracks',
    type: [TrackDto],
    required: false,
  })
  tracks?: TrackDto[];

  @ApiProperty({
    description: 'Source links',
    type: [SourceLinkDto],
    required: false,
  })
  links?: SourceLinkDto[];
}

export class ArtistResponseDto {
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

  @ApiProperty({
    description: 'MusicBrainz ID',
    required: false,
  })
  mbid?: string;

  @ApiProperty({
    description: 'Discogs ID',
    required: false,
  })
  discogsId?: string;

  @ApiProperty({
    description: 'Release date',
    required: false,
  })
  createdAt?: string;

  @ApiProperty({
    description: 'Releases',
    type: [ReleaseDto],
    required: false,
  })
  releases?: ReleaseDto[];
}
