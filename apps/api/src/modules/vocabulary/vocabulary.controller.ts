import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequestUser } from 'src/shared/modules/http-request-context/interfaces/request-user.interface';

import { VocabAttemptDto } from './dtos/vocab.dto';
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
  @ApiOperation({ summary: 'Get SRS vocabulary cards due for review (max 20)' })
  getReview(@CurrentUser() user: RequestUser) {
    return this.vocabularyService.getReviewQueue(user.id);
  }

  @Post('attempt')
  @ApiOperation({ summary: 'Record a vocabulary review attempt' })
  recordAttempt(@CurrentUser() user: RequestUser, @Body() dto: VocabAttemptDto) {
    return this.vocabularyService.recordAttempt(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vocabulary word detail' })
  getById(@Param('id') id: string) {
    return this.vocabularyService.getById(id);
  }
}
