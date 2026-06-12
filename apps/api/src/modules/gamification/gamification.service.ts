import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { levelFromXp, xpForAction, type XpAction } from '@elearning/core';
import { Between, Repository } from 'typeorm';

import { UserEntity } from 'src/modules/user/entities/user.entity';
import { AttemptEntity } from 'src/modules/practice/entities/attempt.entity';

import { XpEventEntity } from './entities/xp-event.entity';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(XpEventEntity)
    private readonly xpRepo: Repository<XpEventEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AttemptEntity)
    private readonly attemptRepo: Repository<AttemptEntity>
  ) {}

  async awardXp(userId: string, action: XpAction, sourceId?: string): Promise<number> {
    const amount = xpForAction(action);
    const event = this.xpRepo.create({
      user: { id: userId },
      amount,
      sourceType: action,
      sourceId: sourceId ?? null,
    });
    await this.xpRepo.save(event);
    await this.userRepo.update({ id: userId }, { xpTotal: () => `xp_total + ${amount}` });
    return amount;
  }

  async getXpSummary(userId: string) {
    const user = await this.userRepo.findOneOrFail({ where: { id: userId } });
    const total = user.xpTotal;

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayEvents = await this.xpRepo.find({
      where: { user: { id: userId }, createdAt: Between(todayStart, new Date()) },
    });
    const today = todayEvents.reduce((s, e) => s + e.amount, 0);

    const weekStart = this.getWeekStart();
    const weekEvents = await this.xpRepo.find({
      where: { user: { id: userId }, createdAt: Between(weekStart, new Date()) },
    });
    const thisWeek = weekEvents.reduce((s, e) => s + e.amount, 0);

    const level = levelFromXp(total);
    if (user.levelRank !== level.rank) {
      user.levelRank = level.rank;
      await this.userRepo.save(user);
    }

    return { total, today, thisWeek, ...level };
  }

  async getDailyGoal(userId: string, targetSentences = 10) {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // Count distinct sentences practiced today — multiple attempts on the same
    // sentence count as one, so "Again" doesn't inflate the goal counter.
    const row = await this.attemptRepo
      .createQueryBuilder('a')
      .select('COUNT(DISTINCT a.sentence_id)', 'count')
      .where('a.user_id = :userId', { userId })
      .andWhere('a.attempted_at >= :todayStart', { todayStart })
      .getRawOne<{ count: string }>();

    const completed = parseInt(row?.count ?? '0', 10);

    return {
      targetSentences,
      completedSentences: completed,
      completed: completed >= targetSentences,
      percentage: Math.min(100, Math.round((completed / targetSentences) * 100)),
    };
  }

  async getRecentXp(userId: string, limit = 5) {
    return this.xpRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private getWeekStart(): Date {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday
    const start = new Date(now);
    start.setUTCDate(now.getUTCDate() + diff);
    start.setUTCHours(0, 0, 0, 0);
    return start;
  }
}
