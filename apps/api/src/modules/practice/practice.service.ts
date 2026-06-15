import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { alignWords, PASS_SCORE, scoreToGrade, srsDueDate, SRS_DEFAULTS, srsNextInterval } from '@elearning/core';
import type {
  LessonProgress,
  PronunciationAssessment,
  VoiceAttemptResult,
  VoiceTranscriptionResult,
} from '@elearning/contracts';
import { Not, Repository } from 'typeorm';

import { SentenceEntity } from 'src/modules/content/entities/sentence.entity';
import { LessonEntity } from 'src/modules/content/entities/lesson.entity';
import { GamificationService } from 'src/modules/gamification/gamification.service';
import { ProgressService } from 'src/modules/progress/progress.service';
import { EvaluationService } from 'src/modules/evaluation/evaluation.service';

import type { SelfAssessment } from './entities/attempt.entity';
import { AttemptEntity } from './entities/attempt.entity';
import { UserLessonProgressEntity } from './entities/user-lesson-progress.entity';
import { CreateAttemptDto, VoiceAttemptDto, VoiceEvaluateDto } from './dtos/practice.dto';
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
   * Transcribe a spoken sentence and persist the attempt. The audio is analyzed
   * transiently (sent to the recognizer, then discarded). Scoring is deferred —
   * the learner sees only the transcription and may request a full evaluation
   * later via {@link evaluateVoiceAttempt}. Since there is no score yet (and the
   * user doesn't self-rate voice), the attempt is scheduled with a neutral
   * 'hard' grade; it counts toward XP and lesson progress immediately.
   */
  async transcribeVoiceAttempt(userId: string, dto: VoiceAttemptDto): Promise<VoiceTranscriptionResult> {
    const sentence = await this.sentenceRepo.findOne({
      where: { id: dto.sentenceId },
      relations: { lesson: true },
    });
    if (!sentence) throw new NotFoundException('Sentence not found');

    const { transcription } = await this.evaluationService.transcribe({
      audioBase64: dto.audioBase64,
      mimeType: dto.mimeType,
    });

    const grade: SelfAssessment = 'hard';
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
      attemptedAt: today,
    });
    const saved = await this.attemptRepo.save(attempt);

    await this.recordSideEffects(userId, sentence.lesson.id, saved.id);

    return { attemptId: saved.id, transcription };
  }

  /**
   * Score a previously-transcribed attempt on demand. The audio is re-sent and
   * analyzed transiently; the existing attempt is updated in place with the
   * assessment, and its SRS schedule is re-derived from the real score. XP is not
   * re-awarded (that happened at transcribe), but lesson progress IS recomputed —
   * a sentence only counts as passed once it has a real score.
   */
  async evaluateVoiceAttempt(userId: string, dto: VoiceEvaluateDto): Promise<VoiceAttemptResult> {
    const attempt = await this.attemptRepo.findOne({
      where: { id: dto.attemptId, user: { id: userId } },
      relations: { sentence: { lesson: true } },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');

    const evaluation = await this.evaluationService.evaluatePronunciation({
      audioBase64: dto.audioBase64,
      mimeType: dto.mimeType,
      referenceText: attempt.sentence.text,
    });

    const assessment: PronunciationAssessment = {
      transcription: evaluation.transcription,
      overall: evaluation.overall,
      fluency: evaluation.fluency,
      completeness: evaluation.completeness,
      words: alignWords(attempt.sentence.text, evaluation.transcription),
      coachingNote: evaluation.coachingNote,
      provider: this.evaluationService.provider,
    };

    // Re-grade from the score, recomputing SRS from the state *before* this
    // attempt (it was already scheduled with the fallback grade, so exclude it).
    const grade = scoreToGrade(assessment.overall);
    const next = await this.nextSrs(userId, attempt.sentence.id, grade, attempt.id);
    const dueAt = srsDueDate(attempt.attemptedAt, next.interval);

    attempt.selfAssessment = grade;
    attempt.srsInterval = next.interval;
    attempt.srsEase = next.ease;
    attempt.srsDueAt = dueAt;
    attempt.aiScore = assessment;
    await this.attemptRepo.save(attempt);

    // Now that the sentence has a real score, recompute whether it counts as passed.
    await this.updateLessonProgress(userId, attempt.sentence.lesson.id);

    return {
      assessment,
      grade,
      srsIntervalDays: next.interval,
      srsDueAt: dueAt.toISOString(),
      attemptedAt: attempt.attemptedAt.toISOString(),
    };
  }

  /**
   * Compute the next SRS interval/ease from the user's latest attempt on this
   * sentence. `excludeAttemptId` skips a specific attempt (used when re-grading
   * an attempt in place, so it doesn't read its own provisional state as the base).
   */
  private async nextSrs(
    userId: string,
    sentenceId: string,
    grade: SelfAssessment,
    excludeAttemptId?: string
  ): Promise<{ interval: number; ease: number }> {
    const latest = await this.attemptRepo.findOne({
      where: {
        user: { id: userId },
        sentence: { id: sentenceId },
        ...(excludeAttemptId ? { id: Not(excludeAttemptId) } : {}),
      },
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

  /** Progress across every lesson the user has started — for the lessons list. */
  async getAllLessonProgress(userId: string): Promise<LessonProgress[]> {
    const rows = await this.progressRepo.find({
      where: { user: { id: userId } },
      relations: { lesson: true },
    });
    return rows.map((p) => ({
      lessonId: p.lesson.id,
      status: p.status,
      completionPct: p.completionPct,
      lastPracticedAt: p.lastPracticedAt?.toISOString() ?? null,
      xpEarned: p.xpEarned,
    }));
  }

  private async updateLessonProgress(userId: string, lessonId: string): Promise<void> {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: { sentences: true },
    });
    if (!lesson) return;

    const totalSentences = lesson.sentences.length;
    if (totalSentences === 0) return;

    // Count unique sentences the user has *passed* — a voice attempt scoring at or
    // above the pass bar, or a manual attempt self-rated 'easy' (mobile). Merely
    // attempting (listening, or a low score) no longer marks a sentence complete.
    const passed = await this.attemptRepo
      .createQueryBuilder('a')
      .innerJoin('a.sentence', 's')
      .where('a.user_id = :userId', { userId })
      .andWhere('s.lesson_id = :lessonId', { lessonId })
      .andWhere("((a.ai_score->>'overall')::numeric >= :pass OR a.self_assessment = 'easy')", { pass: PASS_SCORE })
      .select('COUNT(DISTINCT a.sentence_id)', 'count')
      .getRawOne<{ count: string }>();

    const passedCount = parseInt(passed?.count ?? '0', 10);
    const pct = Math.round((passedCount / totalSentences) * 100);
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
