import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/responses';

interface AnalyticsEventDto {
  type: string;
  data: Record<string, unknown>;
}

@ApiTags('analytics')
@Controller({ path: 'events', version: '1' })
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track analytics event' })
  @ApiResponse({
    status: 200,
    description: 'Event tracked successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid event data',
    type: ErrorResponseDto,
  })
  async trackEvent(@Body() event: AnalyticsEventDto): Promise<{ ok: boolean }> {
    this.logger.debug(`Analytics event: ${event.type}`, event.data);
    // TODO: Store in database or external service
    return { ok: true };
  }
}
