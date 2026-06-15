import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Notification, NotificationList } from '@elearning/contracts';

import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { RequestUser } from 'src/shared/modules/http-request-context/interfaces/request-user.interface';

import { NotificationEntity } from './entities/notification.entity';
import { InAppNotificationService } from './in-app-notification.service';

function toDto(n: NotificationEntity): Notification {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    data: n.data,
    readAt: n.readAt ? n.readAt.toISOString() : null,
    createdAt: n.createdAt.toISOString(),
  };
}

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsInboxController {
  constructor(private readonly service: InAppNotificationService) {}

  @Get()
  @ApiOperation({ summary: 'List in-app notifications with unread count' })
  list(@CurrentUser() user: RequestUser): Promise<NotificationList> {
    return this.toList(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read; returns the refreshed list' })
  async markRead(@CurrentUser() user: RequestUser, @Param('id') id: string): Promise<NotificationList> {
    await this.service.markRead(user.id, id);
    return this.toList(user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read; returns the refreshed list' })
  async markAllRead(@CurrentUser() user: RequestUser): Promise<NotificationList> {
    await this.service.markAllRead(user.id);
    return this.toList(user.id);
  }

  private async toList(userId: string): Promise<NotificationList> {
    const { notifications, unreadCount } = await this.service.list(userId);
    return { notifications: notifications.map(toDto), unreadCount };
  }
}
