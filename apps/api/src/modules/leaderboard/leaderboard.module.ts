import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { XpEventEntity } from 'src/modules/gamification/entities/xp-event.entity';

import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([XpEventEntity])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
