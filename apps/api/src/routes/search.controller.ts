import { Controller, Get, Query, HttpStatus, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { SearchService } from '../modules/search.service';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResponseDto, ErrorResponseDto } from '../common/dto/responses';

@ApiTags('search')
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search artists and tracks' })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: SearchResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid query parameters',
    type: ErrorResponseDto,
  })
  async search(@Query() queryDto: SearchQueryDto): Promise<SearchResponseDto> {
    return this.searchService.search(queryDto.q) as unknown as SearchResponseDto;
  }
}
