import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequestUser } from 'src/shared/modules/http-request-context/interfaces/request-user.interface';

import { ProgressService } from './progress.service';

@ApiTags('progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('streak')
  @ApiOperation({ summary: 'Get current user streak' })
  async getStreak(@CurrentUser() user: RequestUser) {
    const streak = await this.progressService.getStreak(user.id);
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDay: streak.lastActiveDay,
      isAlive: this.progressService.isAlive(streak),
    };
  }
}
