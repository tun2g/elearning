import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { alignWords, scoreToGrade, srsDueDate, SRS_DEFAULTS, srsNextInterval } from '@elearning/core';
import type { PronunciationAssessment, VoiceAttemptResult } from '@elearning/contracts';
import { Repository } from 'typeorm';

import { SentenceEntity } from 'src/modules/content/entities/sentence.entity';
import { LessonEntity } from 'src/modules/content/entities/lesson.entity';
import { GamificationService } from 'src/modules/gamification/gamification.service';
import { ProgressService } from 'src/modules/progress/progress.service';
import { EvaluationService } from 'src/modules/evaluation/evaluation.service';

import type { SelfAssessment } from './entities/attempt.entity';
import { AttemptEntity } from './entities/attempt.entity';
import { UserLessonProgressEntity } from './entities/user-lesson-progress.entity';
import { CreateAttemptDto, VoiceAttemptDto } from './dtos/practice.dto';
import type { LessonState } from './interfaces/lesson-state.interface';

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
    private readonly progressService: ProgressService,
    private readonly evaluationService: EvaluationService
  ) {}

  async saveAttempt(userId: string, dto: CreateAttemptDto): Promise<AttemptEntity> {
    const sentence = await this.sentenceRepo.findOne({
      where: { id: dto.sentenceId },
      relations: { lesson: true },
    });
    if (!sentence) throw new NotFoundException('Sentence not found');

    const next = await this.nextSrs(userId, dto.sentenceId, dto.selfAssessment);
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

    await this.recordSideEffects(userId, sentence.lesson.id, saved.id);

    return saved;
  }

  /**
   * Evaluate a spoken sentence and persist the attempt. The audio is analyzed
   * transiently (sent to the evaluator, then discarded) — only the resulting
   * assessment is stored. The user does not self-rate: the SRS grade is derived
   * from the score and feeds the same SM-2 scheduler as listen/shadow attempts.
   */
  async saveVoiceAttempt(userId: string, dto: VoiceAttemptDto): Promise<VoiceAttemptResult> {
    const sentence = await this.sentenceRepo.findOne({
      where: { id: dto.sentenceId },
      relations: { lesson: true },
    });
    if (!sentence) throw new NotFoundException('Sentence not found');

    const evaluation = await this.evaluationService.evaluatePronunciation({
      audioBase64: dto.audioBase64,
      mimeType: dto.mimeType,
      referenceText: sentence.text,
    });

    const assessment: PronunciationAssessment = {
      transcription: evaluation.transcription,
      overall: evaluation.overall,
      fluency: evaluation.fluency,
      completeness: evaluation.completeness,
      words: alignWords(sentence.text, evaluation.transcription),
      coachingNote: evaluation.coachingNote,
      provider: this.evaluationService.provider,
    };

    const grade = scoreToGrade(assessment.overall);
    const next = await this.nextSrs(userId, dto.sentenceId, grade);
    const today = new Date();
    const dueAt = srsDueDate(today, next.interval);

    const attempt = this.attemptRepo.create({
      user: { id: userId },
      sentence: { id: dto.sentenceId },
      mode: 'voice',
      selfAssessment: grade,
      srsInterval: next.interval,
      srsEase: next.ease,
      srsDueAt: dueAt,
      aiScore: assessment,
      attemptedAt: today,
    });
    const saved = await this.attemptRepo.save(attempt);

    await this.recordSideEffects(userId, sentence.lesson.id, saved.id);

    return {
      assessment,
      grade,
      srsIntervalDays: next.interval,
      srsDueAt: dueAt.toISOString(),
      attemptedAt: today.toISOString(),
    };
  }

  /** Compute the next SRS interval/ease from the user's latest attempt on this sentence. */
  private async nextSrs(
    userId: string,
    sentenceId: string,
    grade: SelfAssessment
  ): Promise<{ interval: number; ease: number }> {
    const latest = await this.attemptRepo.findOne({
      where: { user: { id: userId }, sentence: { id: sentenceId } },
      order: { createdAt: 'DESC' },
    });
    const current = latest ? { interval: latest.srsInterval, ease: latest.srsEase } : SRS_DEFAULTS;
    return srsNextInterval(current, grade);
  }

  private async recordSideEffects(userId: string, lessonId: string, attemptId: string): Promise<void> {
    await Promise.all([
      this.updateLessonProgress(userId, lessonId),
      this.gamificationService.awardXp(userId, 'sentence_attempt', attemptId),
      this.progressService.recordPracticeActivity(userId),
    ]);
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
