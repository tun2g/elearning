import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { LessonDetail, LessonSummary } from '@elearning/contracts';

import { Public } from 'src/shared/decorators/public.decorator';

import { ContentService } from './content.service';

@ApiTags('content')
@Public()
@Controller('lessons')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: 'List all lessons (practice-by-sound units)' })
  listLessons(): Promise<LessonSummary[]> {
    return this.contentService.listLessons();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get one lesson with its sentences' })
  getLesson(@Param('slug') slug: string): Promise<LessonDetail> {
    return this.contentService.getLessonBySlug(slug);
  }
}
