import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { LessonDetail, LessonSummary } from '@elearning/contracts';
import { Repository } from 'typeorm';

import { LessonEntity } from './entities/lesson.entity';
import { toLessonDetail, toLessonSummary } from './dtos/lesson.mapper';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(LessonEntity)
    private readonly lessonRepo: Repository<LessonEntity>
  ) {}

  async listLessons(): Promise<LessonSummary[]> {
    const lessons = await this.lessonRepo.find({
      relations: { sentences: true },
      order: { createdAt: 'ASC' },
    });

    return lessons.map((lesson) => toLessonSummary(lesson, lesson.sentences?.length ?? 0));
  }

  async getLessonBySlug(slug: string): Promise<LessonDetail> {
    const lesson = await this.lessonRepo.findOne({
      where: { slug },
      relations: { sentences: true },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson "${slug}" not found`);
    }

    return toLessonDetail(lesson);
  }
}
