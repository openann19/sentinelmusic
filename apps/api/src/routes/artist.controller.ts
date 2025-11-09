import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpCode,
  Version,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ArtistService } from '../modules/artist.service';
import { ArtistParamsDto } from '../dto/artist-params.dto';
import {
  ArtistResponseDto,
  ErrorResponseDto,
} from '../common/dto/responses';

@ApiTags('artists')
@Controller({ path: 'artists', version: '1' })
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get(':id')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get artist by ID' })
  @ApiParam({ name: 'id', description: 'Artist ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Artist found',
    type: ArtistResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID format',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Artist not found',
    type: ErrorResponseDto,
  })
  async getById(@Param() params: ArtistParamsDto): Promise<ArtistResponseDto> {
    return this.artistService.findById(BigInt(params.id)) as unknown as ArtistResponseDto;
  }
}
