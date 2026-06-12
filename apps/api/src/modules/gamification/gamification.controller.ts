import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequestUser } from 'src/shared/modules/http-request-context/http-request-context.service';

import { GamificationService } from './gamification.service';

@ApiTags('gamification')
@Controller()
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('xp/summary')
  @ApiOperation({ summary: 'Get XP summary and level info' })
  getXpSummary(@CurrentUser() user: RequestUser) {
    return this.gamificationService.getXpSummary(user.id);
  }

  @Get('daily-goal')
  @ApiOperation({ summary: 'Get daily practice goal progress' })
  getDailyGoal(@CurrentUser() user: RequestUser) {
    return this.gamificationService.getDailyGoal(user.id);
  }
}
