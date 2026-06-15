import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { LessonDetail, LessonSummary } from '@elearning/contracts';
import { FindOptionsWhere, Repository } from 'typeorm';

import { LessonEntity } from './entities/lesson.entity';
import { toLessonDetail, toLessonSummary } from './dtos/lesson.mapper';

export interface LessonFilter {
  topic?: string;
  category?: string;
  level?: string;
}

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(LessonEntity)
    private readonly lessonRepo: Repository<LessonEntity>
  ) {}

  async listLessons(filter: LessonFilter = {}): Promise<LessonSummary[]> {
    const where: FindOptionsWhere<LessonEntity> = {};
    if (filter.level) where.level = filter.level as LessonEntity['level'];
    if (filter.topic || filter.category) {
      where.topic = {
        ...(filter.topic ? { slug: filter.topic } : {}),
        ...(filter.category ? { category: { slug: filter.category } } : {}),
      };
    }

    const lessons = await this.lessonRepo.find({
      where,
      relations: { sentences: true, topic: { category: true } },
      order: { createdAt: 'ASC' },
    });

    return lessons.map((lesson) => toLessonSummary(lesson, lesson.sentences?.length ?? 0));
  }

  async getLessonBySlug(slug: string): Promise<LessonDetail> {
    const lesson = await this.lessonRepo.findOne({
      where: { slug },
      relations: { sentences: true, topic: { category: true } },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson "${slug}" not found`);
    }

    return toLessonDetail(lesson);
  }
}
