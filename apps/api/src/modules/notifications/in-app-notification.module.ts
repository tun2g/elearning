import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationEntity } from './entities/notification.entity';
import { InAppNotificationService } from './in-app-notification.service';
import { NotificationsInboxController } from './notifications-inbox.controller';

/**
 * The persisted in-app notification inbox. Kept separate from the push/cron
 * NotificationsModule so feature modules (gamification, the cron) can depend on
 * the writer service without creating a circular module dependency.
 */
@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  controllers: [NotificationsInboxController],
  providers: [InAppNotificationService],
  exports: [InAppNotificationService],
})
export class InAppNotificationModule {}
