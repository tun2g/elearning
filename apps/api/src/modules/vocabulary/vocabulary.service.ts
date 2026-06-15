import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { srsDueDate, SRS_DEFAULTS, srsNextInterval } from '@elearning/core';
import { LessThanOrEqual, Repository } from 'typeorm';

import { GamificationService } from 'src/modules/gamification/gamification.service';

import { UserVocabProgressEntity } from './entities/user-vocab-progress.entity';
import { VocabularyEntity } from './entities/vocabulary.entity';
import { VocabAttemptDto } from './dtos/vocab.dto';
import { NEW_CARDS_PER_SESSION, REVIEW_SESSION_LIMIT } from './constants/vocabulary.constants';
import { VocabSessionCard } from './interfaces/vocab-session.interface';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(VocabularyEntity)
    private readonly vocabRepo: Repository<VocabularyEntity>,
    @InjectRepository(UserVocabProgressEntity)
    private readonly progressRepo: Repository<UserVocabProgressEntity>,
    private readonly gamificationService: GamificationService
  ) {}

  async getTodayWord(userId: string): Promise<VocabularyEntity | null> {
    // Use UTC day as a seed for "word of the day"
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    const total = await this.vocabRepo.count();
    if (total === 0) return null;
    const offset = dayIndex % total;
    const words = await this.vocabRepo.find({ skip: offset, take: 1, order: { createdAt: 'ASC', id: 'ASC' } });
    return words[0] ?? null;
  }

  /**
   * Build a study session: due review cards first (time-sensitive), then a batch
   * of brand-new cards to learn. New cards have no progress row yet — assessing one
   * via {@link recordAttempt} creates that row and pulls the word into the SRS.
   */
  async getStudySession(userId: string): Promise<VocabSessionCard[]> {
    const today = new Date();
    today.setUTCHours(23, 59, 59, 999);

    const due = await this.progressRepo.find({
      where: { user: { id: userId }, srsDueAt: LessThanOrEqual(today) },
      order: { srsDueAt: 'ASC' },
      take: REVIEW_SESSION_LIMIT,
      relations: { vocab: true },
    });

    const reviewCards: VocabSessionCard[] = due.map((p) => ({ ...p.vocab, status: 'review' }));
    const newCards = await this.getNewCards(userId, NEW_CARDS_PER_SESSION);

    return [...reviewCards, ...newCards.map((v): VocabSessionCard => ({ ...v, status: 'new' }))];
  }

  /** Catalog words the user has never started (no progress row), oldest first. */
  private async getNewCards(userId: string, limit: number): Promise<VocabularyEntity[]> {
    if (limit <= 0) return [];

    return this.vocabRepo
      .createQueryBuilder('v')
      .leftJoin(UserVocabProgressEntity, 'p', 'p.vocab_id = v.id AND p.user_id = :userId AND p.deleted_at IS NULL', {
        userId,
      })
      .where('p.id IS NULL')
      .orderBy('v.createdAt', 'ASC')
      .addOrderBy('v.id', 'ASC')
      .take(limit)
      .getMany();
  }

  async getById(id: string): Promise<VocabularyEntity> {
    const vocab = await this.vocabRepo.findOne({ where: { id } });
    if (!vocab) throw new NotFoundException('Vocabulary not found');
    return vocab;
  }

  async recordAttempt(userId: string, dto: VocabAttemptDto): Promise<UserVocabProgressEntity> {
    const vocab = await this.vocabRepo.findOne({ where: { id: dto.vocabId } });
    if (!vocab) throw new NotFoundException('Vocabulary not found');

    const existing = await this.progressRepo.findOne({
      where: { user: { id: userId }, vocab: { id: dto.vocabId } },
    });

    const current = existing ? { interval: existing.srsInterval, ease: existing.srsEase } : SRS_DEFAULTS;

    const next = srsNextInterval(current, dto.assessment);
    const dueAt = srsDueDate(new Date(), next.interval);

    if (existing) {
      existing.srsInterval = next.interval;
      existing.srsEase = next.ease;
      existing.srsDueAt = dueAt;
      existing.totalReviews += 1;
      if (dto.correct) existing.correctReviews += 1;
      await this.progressRepo.save(existing);
      await this.gamificationService.awardXp(userId, 'vocab_review', existing.id);
      return existing;
    }

    const progress = this.progressRepo.create({
      user: { id: userId },
      vocab: { id: dto.vocabId },
      srsInterval: next.interval,
      srsEase: next.ease,
      srsDueAt: dueAt,
      totalReviews: 1,
      correctReviews: dto.correct ? 1 : 0,
    });
    const saved = await this.progressRepo.save(progress);
    await this.gamificationService.awardXp(userId, 'vocab_review', saved.id);
    return saved;
  }
}
