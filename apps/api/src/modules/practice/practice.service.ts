import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { srsDueDate, SRS_DEFAULTS, srsNextInterval } from '@elearning/core';
import { Repository } from 'typeorm';

import { SentenceEntity } from 'src/modules/content/entities/sentence.entity';
import { LessonEntity } from 'src/modules/content/entities/lesson.entity';
import { GamificationService } from 'src/modules/gamification/gamification.service';
import { ProgressService } from 'src/modules/progress/progress.service';

import type { SelfAssessment } from './entities/attempt.entity';
import { AttemptEntity } from './entities/attempt.entity';
import { UserLessonProgressEntity } from './entities/user-lesson-progress.entity';
import { CreateAttemptDto } from './dtos/practice.dto';

export interface LessonState {
  completionPct: number;
  status: string;
  /** Latest self-assessment per sentence the user has attempted in this lesson. */
  attempts: { sentenceId: string; selfAssessment: SelfAssessment }[];
}

@Injectable()
export class PracticeService {
  constructor(
    @InjectRepository(AttemptEntity)
    private readonly attemptRepo: Repository<AttemptEntity>,
    @InjectRepository(UserLessonProgressEntity)
    private readonly progressRepo: Repository<UserLessonProgressEntity>,
    @InjectRepository(SentenceEntity)
    private readonly sentenceRepo: Repository<SentenceEntity>,
    @InjectRepository(LessonEntity)
    private readonly lessonRepo: Repository<LessonEntity>,
    private readonly gamificationService: GamificationService,
    private readonly progressService: ProgressService
  ) {}

  async saveAttempt(userId: string, dto: CreateAttemptDto): Promise<AttemptEntity> {
    const sentence = await this.sentenceRepo.findOne({
      where: { id: dto.sentenceId },
      relations: { lesson: true },
    });
    if (!sentence) throw new NotFoundException('Sentence not found');

    // Find latest attempt for SRS state
    const latest = await this.attemptRepo.findOne({
      where: { user: { id: userId }, sentence: { id: dto.sentenceId } },
      order: { createdAt: 'DESC' },
    });

    const current = latest ? { interval: latest.srsInterval, ease: latest.srsEase } : SRS_DEFAULTS;

    const next = srsNextInterval(current, dto.selfAssessment);
    const today = new Date();
    const dueAt = srsDueDate(today, next.interval);

    const attempt = this.attemptRepo.create({
      user: { id: userId },
      sentence: { id: dto.sentenceId },
      mode: dto.mode,
      selfAssessment: dto.selfAssessment,
      srsInterval: next.interval,
      srsEase: next.ease,
      srsDueAt: dueAt,
      recordingUrl: dto.recordingUrl ?? null,
      attemptedAt: today,
    });
    const saved = await this.attemptRepo.save(attempt);

    await Promise.all([
      this.updateLessonProgress(userId, sentence.lesson.id),
      this.gamificationService.awardXp(userId, 'sentence_attempt', saved.id),
      this.progressService.recordPracticeActivity(userId),
    ]);

    return saved;
  }

  async getDueSentences(userId: string): Promise<SentenceEntity[]> {
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);

    // Single subquery: for each sentence, take the latest attempt's srs_due_at.
    // Filter to those due today, limit 20. Replaces the prior N+1 loop.
    const dueRows = await this.attemptRepo
      .createQueryBuilder('a')
      .select('a.sentence_id', 'sentenceId')
      .addSelect('MAX(a.srs_due_at)', 'dueTo')
      .where('a.user_id = :userId', { userId })
      .groupBy('a.sentence_id')
      .having('MAX(a.srs_due_at) <= :today', { today })
      .limit(20)
      .getRawMany<{ sentenceId: string; dueTo: string }>();

    const dueIds = dueRows.map((r) => r.sentenceId);
    if (dueIds.length === 0) return [];

    return this.sentenceRepo.createQueryBuilder('s').where('s.id IN (:...ids)', { ids: dueIds }).getMany();
  }

  /** Saved progress + latest assessment per sentence — used to restore the practice screen. */
  async getLessonState(userId: string, lessonId: string): Promise<LessonState> {
    const progress = await this.progressRepo.findOne({
      where: { user: { id: userId }, lesson: { id: lessonId } },
    });

    const attempts = await this.attemptRepo
      .createQueryBuilder('a')
      .innerJoin('a.sentence', 's')
      .select('DISTINCT ON (a.sentence_id) a.sentence_id', 'sentenceId')
      .addSelect('a.self_assessment', 'selfAssessment')
      .where('a.user_id = :userId', { userId })
      .andWhere('s.lesson_id = :lessonId', { lessonId })
      .orderBy('a.sentence_id')
      .addOrderBy('a.attempted_at', 'DESC')
      .getRawMany<{ sentenceId: string; selfAssessment: SelfAssessment }>();

    return {
      completionPct: progress?.completionPct ?? 0,
      status: progress?.status ?? 'not_started',
      attempts,
    };
  }

  private async updateLessonProgress(userId: string, lessonId: string): Promise<void> {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: { sentences: true },
    });
    if (!lesson) return;

    const totalSentences = lesson.sentences.length;
    if (totalSentences === 0) return;

    // Count unique sentences attempted by this user in this lesson
    const attempted = await this.attemptRepo
      .createQueryBuilder('a')
      .innerJoin('a.sentence', 's')
      .where('a.user_id = :userId', { userId })
      .andWhere('s.lesson_id = :lessonId', { lessonId })
      .select('COUNT(DISTINCT a.sentence_id)', 'count')
      .getRawOne<{ count: string }>();

    const attemptedCount = parseInt(attempted?.count ?? '0', 10);
    const pct = Math.round((attemptedCount / totalSentences) * 100);
    const status = pct >= 100 ? 'completed' : 'in_progress';

    const existing = await this.progressRepo.findOne({
      where: { user: { id: userId }, lesson: { id: lessonId } },
    });

    if (existing) {
      existing.completionPct = pct;
      existing.status = status;
      existing.lastPracticedAt = new Date();
      await this.progressRepo.save(existing);
    } else {
      const progress = this.progressRepo.create({
        user: { id: userId },
        lesson: { id: lessonId },
        completionPct: pct,
        status,
        lastPracticedAt: new Date(),
      });
      await this.progressRepo.save(progress);
    }
  }
}
