import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isStreakAlive, recordActivity } from '@elearning/core';
import { Repository } from 'typeorm';

import { UserStreakEntity } from './entities/user-streak.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(UserStreakEntity)
    private readonly streakRepo: Repository<UserStreakEntity>
  ) {}

  async getStreak(userId: string): Promise<UserStreakEntity> {
    let streak = await this.streakRepo.findOne({ where: { user: { id: userId } } });
    if (!streak) {
      streak = this.streakRepo.create({
        user: { id: userId },
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDay: null,
        graceUsedToday: false,
      });
      await this.streakRepo.save(streak);
    }
    return streak;
  }

  async recordPracticeActivity(userId: string): Promise<UserStreakEntity> {
    const streak = await this.getStreak(userId);
    const now = new Date();

    const currentState = {
      current: streak.currentStreak,
      longest: streak.longestStreak,
      lastActiveDay: streak.lastActiveDay,
    };

    const next = recordActivity(currentState, now);

    streak.currentStreak = next.current;
    streak.longestStreak = next.longest;
    streak.lastActiveDay = next.lastActiveDay;
    streak.graceUsedToday = false;

    return this.streakRepo.save(streak);
  }

  isAlive(streak: UserStreakEntity): boolean {
    return isStreakAlive(
      {
        current: streak.currentStreak,
        longest: streak.longestStreak,
        lastActiveDay: streak.lastActiveDay,
      },
      new Date()
    );
  }
}
