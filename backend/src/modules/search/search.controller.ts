import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService, GlobalSearchResponse } from './search.service';
import { GlobalSearchQueryDto } from './dto/global-search.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('global')
  async globalSearch(
    @Query() query: GlobalSearchQueryDto,
    @CurrentUser() user: any,
  ): Promise<GlobalSearchResponse> {
    const limit = query.limit || 20;
    return this.searchService.globalSearch(
      query.q,
      user,
      limit,
      query.types,
      query.panel,
    );
  }
}
