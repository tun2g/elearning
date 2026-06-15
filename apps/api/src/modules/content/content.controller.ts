import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { LessonDetail, LessonSummary } from '@elearning/contracts';

import { Public } from 'src/shared/decorators/public.decorator';

import { ContentService } from './content.service';

@ApiTags('content')
@Public()
@Controller('lessons')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: 'List lessons, optionally filtered by topic/category/level' })
  @ApiQuery({ name: 'topic', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'level', required: false })
  listLessons(
    @Query('topic') topic?: string,
    @Query('category') category?: string,
    @Query('level') level?: string
  ): Promise<LessonSummary[]> {
    return this.contentService.listLessons({ topic, category, level });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get one lesson with its sentences' })
  getLesson(@Param('slug') slug: string): Promise<LessonDetail> {
    return this.contentService.getLessonBySlug(slug);
  }
}
