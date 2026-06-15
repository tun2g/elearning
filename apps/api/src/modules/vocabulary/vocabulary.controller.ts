import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequestUser } from 'src/shared/modules/http-request-context/interfaces/request-user.interface';

import { SeedReviewDto, VocabAttemptDto } from './dtos/vocab.dto';
import { VocabularyService } from './vocabulary.service';

@ApiTags('vocabulary')
@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get('today')
  @ApiOperation({ summary: 'Word of the day' })
  getToday(@CurrentUser() user: RequestUser) {
    return this.vocabularyService.getTodayWord(user.id);
  }

  @Get('review')
  @ApiOperation({ summary: 'Get a study session: due review cards plus new cards to learn' })
  getReview(@CurrentUser() user: RequestUser) {
    return this.vocabularyService.getStudySession(user.id);
  }

  @Get('topic/:slug/study')
  @ApiOperation({ summary: 'Study session scoped to one topic (all of its words)' })
  getTopicStudy(@CurrentUser() user: RequestUser, @Param('slug') slug: string) {
    return this.vocabularyService.getTopicSession(user.id, slug);
  }

  @Post('attempt')
  @ApiOperation({ summary: 'Record a vocabulary review attempt' })
  recordAttempt(@CurrentUser() user: RequestUser, @Body() dto: VocabAttemptDto) {
    return this.vocabularyService.recordAttempt(user.id, dto);
  }

  @Post('review/seed')
  @ApiOperation({ summary: 'Queue mispronounced words for review (lesson → vocab loop)' })
  seedReview(@CurrentUser() user: RequestUser, @Body() dto: SeedReviewDto) {
    return this.vocabularyService.seedReviewWords(user.id, dto.words);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vocabulary word detail' })
  getById(@Param('id') id: string) {
    return this.vocabularyService.getById(id);
  }
}
