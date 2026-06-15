import type { Category, Topic, TopicRef } from '@elearning/contracts';

import { CategoryEntity } from '../entities/category.entity';
import { TopicEntity } from '../entities/topic.entity';

/** Compact topic reference embedded on lessons/vocab. Requires `topic.category` loaded. */
export function toTopicRef(topic: TopicEntity | null | undefined): TopicRef | null {
  if (!topic) return null;
  return {
    slug: topic.slug,
    title: topic.title,
    cefrLevel: topic.cefrLevel,
    category: { slug: topic.category.slug, title: topic.category.title },
  };
}

export function toTopic(topic: TopicEntity, lessonCount: number, vocabCount: number): Topic {
  return {
    id: topic.id,
    slug: topic.slug,
    title: topic.title,
    description: topic.description,
    cefrLevel: topic.cefrLevel,
    order: topic.order,
    category: { slug: topic.category.slug, title: topic.category.title },
    lessonCount,
    vocabCount,
  };
}

export function toCategory(category: CategoryEntity, topicCount: number): Category {
  return {
    id: category.id,
    slug: category.slug,
    title: category.title,
    description: category.description,
    order: category.order,
    topicCount,
  };
}
