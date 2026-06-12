import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequestUser } from 'src/shared/modules/http-request-context/http-request-context.service';

import { CreateAttemptDto } from './dtos/practice.dto';
import { PracticeService } from './practice.service';

@ApiTags('practice')
@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('attempt')
  @ApiOperation({ summary: 'Save a practice attempt for a sentence' })
  saveAttempt(@CurrentUser() user: RequestUser, @Body() dto: CreateAttemptDto) {
    return this.practiceService.saveAttempt(user.id, dto);
  }

  @Get('due')
  @ApiOperation({ summary: 'Get sentences due for SRS review today' })
  getDue(@CurrentUser() user: RequestUser) {
    return this.practiceService.getDueSentences(user.id);
  }

  @Get('lesson/:lessonId')
  @ApiOperation({
    summary: "Get the user's saved state for a lesson (progress + assessments)",
  })
  getLessonState(@CurrentUser() user: RequestUser, @Param('lessonId') lessonId: string) {
    return this.practiceService.getLessonState(user.id, lessonId);
  }
}
