import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { LeaderboardEntry } from '@elearning/contracts';

import { LeaderboardService } from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('weekly')
  @ApiOperation({ summary: 'Top users by XP earned this ISO week' })
  getWeekly(): Promise<LeaderboardEntry[]> {
    return this.leaderboardService.getWeekly();
  }
}
