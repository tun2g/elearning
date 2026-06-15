import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { LeaderboardEntry } from '@elearning/contracts';
import { isoWeekStart } from '@elearning/core';
import { Repository } from 'typeorm';

import { XpEventEntity } from 'src/modules/gamification/entities/xp-event.entity';

import { LEADERBOARD_TOP_N } from './constants/leaderboard.constants';

interface LeaderboardRow {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  xpThisWeek: string;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(XpEventEntity)
    private readonly xpRepo: Repository<XpEventEntity>
  ) {}

  /** Top users by XP earned in the current ISO week (Mon–Sun, UTC). */
  async getWeekly(limit = LEADERBOARD_TOP_N): Promise<LeaderboardEntry[]> {
    const weekStart = isoWeekStart(new Date());

    // Raw queries bypass TypeORM's soft-delete guard, so exclude deleted rows
    // explicitly. Grouping by the PK lets Postgres select u.display_name /
    // u.avatar_url without listing them (functional dependency on the PK).
    const rows = await this.xpRepo
      .createQueryBuilder('e')
      .innerJoin('e.user', 'u')
      .select('u.id', 'userId')
      .addSelect('u.displayName', 'displayName')
      .addSelect('u.avatarUrl', 'avatarUrl')
      .addSelect('SUM(e.amount)', 'xpThisWeek')
      .where('e.createdAt >= :weekStart', { weekStart })
      .andWhere('e.deletedAt IS NULL')
      .andWhere('u.deletedAt IS NULL')
      .groupBy('u.id')
      .orderBy('SUM(e.amount)', 'DESC')
      .limit(limit)
      .getRawMany<LeaderboardRow>();

    // Competition ranking: equal weekly XP shares a rank (1, 2, 2, 4, …).
    let prevXp: number | null = null;
    let prevRank = 0;
    return rows.map((row, index) => {
      const xpThisWeek = Number(row.xpThisWeek);
      const rank = xpThisWeek === prevXp ? prevRank : index + 1;
      prevXp = xpThisWeek;
      prevRank = rank;
      return {
        userId: row.userId,
        displayName: row.displayName,
        avatarUrl: row.avatarUrl,
        xpThisWeek,
        rank,
      };
    });
  }
}
