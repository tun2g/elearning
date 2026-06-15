import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { NotificationType } from '@elearning/contracts';
import { IsNull, Repository } from 'typeorm';

import { NotificationEntity } from './entities/notification.entity';

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
}

const DEFAULT_LIST_LIMIT = 30;

@Injectable()
export class InAppNotificationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>
  ) {}

  async create(userId: string, input: CreateNotificationInput): Promise<NotificationEntity> {
    const notification = this.repo.create({
      user: { id: userId },
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data ?? null,
    });
    return this.repo.save(notification);
  }

  async list(
    userId: string,
    limit = DEFAULT_LIST_LIMIT
  ): Promise<{ notifications: NotificationEntity[]; unreadCount: number }> {
    const [notifications, unreadCount] = await Promise.all([
      this.repo.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' }, take: limit }),
      this.repo.count({ where: { user: { id: userId }, readAt: IsNull() } }),
    ]);
    return { notifications, unreadCount };
  }

  async markRead(userId: string, id: string): Promise<void> {
    const result = await this.repo
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ readAt: new Date() })
      .where('id = :id AND user_id = :userId AND deleted_at IS NULL', { id, userId })
      .execute();
    if (!result.affected) {
      throw new NotFoundException('Notification not found');
    }
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ readAt: new Date() })
      .where('user_id = :userId AND read_at IS NULL AND deleted_at IS NULL', { userId })
      .execute();
  }
}
