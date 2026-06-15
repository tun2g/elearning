import type { LessonDetail, LessonSummary, Sentence } from '@elearning/contracts';

import { LessonEntity } from '../entities/lesson.entity';
import { SentenceEntity } from '../entities/sentence.entity';
import { toTopicRef } from './topic.mapper';

export function toSentence(entity: SentenceEntity): Sentence {
  return {
    id: entity.id,
    order: entity.order,
    text: entity.text,
    ipa: entity.ipa,
    translation: entity.translation,
    audioUrl: entity.audioUrl,
  };
}

export function toLessonSummary(entity: LessonEntity, sentenceCount: number): LessonSummary {
  return {
    id: entity.id,
    slug: entity.slug,
    title: entity.title,
    description: entity.description,
    level: entity.level,
    topic: toTopicRef(entity.topic),
    source: entity.source,
    externalUrl: entity.externalUrl,
    mediaKind: entity.mediaKind,
    sentenceCount,
  };
}

export function toLessonDetail(entity: LessonEntity): LessonDetail {
  const sentences = [...(entity.sentences ?? [])].sort((a, b) => a.order - b.order).map(toSentence);

  return {
    ...toLessonSummary(entity, sentences.length),
    sentences,
  };
}
