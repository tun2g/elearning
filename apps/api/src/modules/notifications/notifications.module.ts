import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamificationModule } from 'src/modules/gamification/gamification.module';
import { LeaderboardModule } from 'src/modules/leaderboard/leaderboard.module';
import { ProgressModule } from 'src/modules/progress/progress.module';
import { UserSettingsEntity } from 'src/modules/user/entities/user-settings.entity';

import { ExpoPushService } from './expo-push.service';
import { InAppNotificationModule } from './in-app-notification.module';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSettingsEntity]),
    InAppNotificationModule,
    GamificationModule,
    ProgressModule,
    LeaderboardModule,
  ],
  providers: [ExpoPushService, NotificationsService],
  exports: [ExpoPushService],
})
export class NotificationsModule {}
