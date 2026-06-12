import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isStreakAlive } from '@elearning/core';
import { In, Not, Repository } from 'typeorm';

import { LessonEntity } from 'src/modules/content/entities/lesson.entity';
import { UserLessonProgressEntity } from 'src/modules/practice/entities/user-lesson-progress.entity';
import { UserSettingsEntity } from 'src/modules/user/entities/user-settings.entity';
import { GamificationService } from 'src/modules/gamification/gamification.service';
import { ProgressService } from 'src/modules/progress/progress.service';

@Injectable()
export class HomeService {
  constructor(
    private readonly progressService: ProgressService,
    private readonly gamificationService: GamificationService,
    @InjectRepository(UserLessonProgressEntity)
    private readonly lessonProgressRepo: Repository<UserLessonProgressEntity>,
    @InjectRepository(LessonEntity)
    private readonly lessonRepo: Repository<LessonEntity>,
    @InjectRepository(UserSettingsEntity)
    private readonly settingsRepo: Repository<UserSettingsEntity>
  ) {}

  async getHomeData(userId: string) {
    const [streak, xpSummary, settings] = await Promise.all([
      this.progressService.getStreak(userId),
      this.gamificationService.getXpSummary(userId),
      this.settingsRepo.findOne({ where: { user: { id: userId } } }),
    ]);

    const dailyGoal = await this.gamificationService.getDailyGoal(userId, settings?.dailyGoalSentences ?? 10);
    const recentXp = await this.gamificationService.getRecentXp(userId, 5);
    const recommendedLesson = await this.getRecommendedLesson(userId);

    return {
      streak: {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActiveDay: streak.lastActiveDay,
        isAlive: isStreakAlive(
          {
            current: streak.currentStreak,
            longest: streak.longestStreak,
            lastActiveDay: streak.lastActiveDay,
          },
          new Date()
        ),
      },
      dailyGoal,
      recommendedLesson,
      recentXp: recentXp.map((e) => ({
        amount: e.amount,
        sourceType: e.sourceType,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }

  private async getRecommendedLesson(userId: string) {
    // First: in-progress lessons with lowest completion
    const inProgress = await this.lessonProgressRepo.findOne({
      where: { user: { id: userId }, status: 'in_progress' },
      order: { completionPct: 'ASC' },
      relations: { lesson: true },
    });

    if (inProgress) {
      return {
        id: inProgress.lesson.id,
        slug: inProgress.lesson.slug,
        title: inProgress.lesson.title,
        level: inProgress.lesson.level,
        completionPct: inProgress.completionPct,
      };
    }

    // Fallback: first lesson not yet started
    const completed = await this.lessonProgressRepo
      .createQueryBuilder('p')
      .select('p.lesson_id')
      .where('p.user_id = :userId', { userId })
      .getRawMany<{ lesson_id: string }>();

    const completedIds = completed.map((r) => r.lesson_id);

    const next = await this.lessonRepo.findOne({
      where: completedIds.length > 0 ? { id: Not(In(completedIds)) } : {},
      order: { createdAt: 'ASC' },
    });

    if (!next) return null;

    return {
      id: next.id,
      slug: next.slug,
      title: next.title,
      level: next.level,
      completionPct: 0,
    };
  }
}
