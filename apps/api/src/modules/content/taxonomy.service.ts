import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Category, Topic } from '@elearning/contracts';
import { ObjectLiteral, Repository } from 'typeorm';

import { VocabularyEntity } from 'src/modules/vocabulary/entities/vocabulary.entity';

import { CategoryEntity } from './entities/category.entity';
import { LessonEntity } from './entities/lesson.entity';
import { TopicEntity } from './entities/topic.entity';
import { toCategory, toTopic } from './dtos/topic.mapper';

export interface TopicFilter {
  category?: string;
  level?: string;
}

@Injectable()
export class TaxonomyService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
    @InjectRepository(TopicEntity)
    private readonly topicRepo: Repository<TopicEntity>,
    @InjectRepository(LessonEntity)
    private readonly lessonRepo: Repository<LessonEntity>,
    @InjectRepository(VocabularyEntity)
    private readonly vocabRepo: Repository<VocabularyEntity>
  ) {}

  async listCategories(): Promise<Category[]> {
    const categories = await this.categoryRepo.find({ order: { order: 'ASC' } });
    const counts = await this.countByColumn(this.topicRepo, 'category_id');
    return categories.map((c) => toCategory(c, counts.get(c.id) ?? 0));
  }

  async listTopics(filter: TopicFilter = {}): Promise<Topic[]> {
    const qb = this.topicRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'c')
      .orderBy('c.sort_order', 'ASC')
      .addOrderBy('t.sort_order', 'ASC');
    if (filter.category) qb.andWhere('c.slug = :category', { category: filter.category });
    if (filter.level) qb.andWhere('t.cefr_level = :level', { level: filter.level });

    const topics = await qb.getMany();
    const lessonCounts = await this.countByColumn(this.lessonRepo, 'topic_id');
    const vocabCounts = await this.countByColumn(this.vocabRepo, 'topic_id');

    return topics.map((t) => toTopic(t, lessonCounts.get(t.id) ?? 0, vocabCounts.get(t.id) ?? 0));
  }

  /** Returns a map of fkColumn value → row count, ignoring null FKs. */
  private async countByColumn<T extends ObjectLiteral>(
    repo: Repository<T>,
    column: string
  ): Promise<Map<string, number>> {
    const rows = await repo
      .createQueryBuilder('e')
      .select(`e.${column}`, 'fk')
      .addSelect('COUNT(*)', 'cnt')
      .where(`e.${column} IS NOT NULL`)
      .groupBy(`e.${column}`)
      .getRawMany<{ fk: string; cnt: string }>();
    return new Map(rows.map((r) => [r.fk, Number(r.cnt)]));
  }
}
