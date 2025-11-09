import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../security/admin.guard';
import { TrackService } from '../modules/track.service';
import { UpdateTrackDto } from '../dto/update-track.dto';
import { TrackParamsDto } from '../dto/track-params.dto';
import { AdminPingResponseDto, ErrorResponseDto } from '../common/dto/responses';
import { TrackDto } from '../common/dto/responses/artist-response.dto';

type LinkWithSource = {
  id: bigint;
  externalId: string;
  url: string;
  previewUrl: string | null;
  source: { id: bigint; name: string };
};

@ApiTags('admin')
@ApiBearerAuth()
@Controller({ path: 'admin', version: '1' })
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly trackService: TrackService) {}

  @Get('ping')
  @ApiOperation({ summary: 'Ping admin endpoint to verify admin access' })
  @ApiResponse({
    status: 200,
    description: 'Admin access verified',
    type: AdminPingResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  ping(): AdminPingResponseDto {
    return { ok: true };
  }

  @Patch('tracks/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update track BPM and/or key' })
  @ApiParam({ name: 'id', description: 'Track ID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Track updated successfully',
    type: TrackDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Track not found',
    type: ErrorResponseDto,
  })
  async updateTrack(
    @Param() params: TrackParamsDto,
    @Body() updateDto: UpdateTrackDto
  ): Promise<TrackDto> {
    const track = await this.trackService.updateTrack(BigInt(params.id), updateDto);

    return {
      id: track.id.toString(),
      title: track.title,
      durationSeconds: track.durationSeconds ?? undefined,
      bpm: track.bpm ?? undefined,
      keyText: track.keyText ?? undefined,
      isrc: track.isrc ?? undefined,
      links: (track.links as LinkWithSource[]).map(link => ({
        id: link.id.toString(),
        externalId: link.externalId,
        url: link.url,
        previewUrl: link.previewUrl ?? undefined,
        source: {
          id: link.source.id.toString(),
          name: link.source.name,
        },
      })),
    };
  }
}
