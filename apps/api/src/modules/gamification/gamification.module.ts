import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttemptEntity } from 'src/modules/practice/entities/attempt.entity';
import { InAppNotificationModule } from 'src/modules/notifications/in-app-notification.module';
import { UserEntity } from 'src/modules/user/entities/user.entity';

import { XpEventEntity } from './entities/xp-event.entity';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

@Module({
  imports: [TypeOrmModule.forFeature([XpEventEntity, UserEntity, AttemptEntity]), InAppNotificationModule],
  controllers: [GamificationController],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
