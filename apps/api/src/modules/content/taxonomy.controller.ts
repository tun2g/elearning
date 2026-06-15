import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Category, Topic } from '@elearning/contracts';

import { Public } from 'src/shared/decorators/public.decorator';

import { TaxonomyService } from './taxonomy.service';

@ApiTags('taxonomy')
@Public()
@Controller()
export class TaxonomyController {
  constructor(private readonly taxonomyService: TaxonomyService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List all categories with topic counts' })
  listCategories(): Promise<Category[]> {
    return this.taxonomyService.listCategories();
  }

  @Get('topics')
  @ApiOperation({ summary: 'List topics with counts, optionally filtered by category/level' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'level', required: false })
  @ApiQuery({ name: 'hasVocab', required: false, type: Boolean })
  listTopics(
    @Query('category') category?: string,
    @Query('level') level?: string,
    @Query('hasVocab') hasVocab?: string
  ): Promise<Topic[]> {
    return this.taxonomyService.listTopics({ category, level, hasVocab: hasVocab === 'true' });
  }
}
