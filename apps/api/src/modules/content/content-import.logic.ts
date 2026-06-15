import type { ImportBatch, ImportLesson, ImportResult, ImportVocab } from '@elearning/contracts';
import { EntityManager } from 'typeorm';

import { VocabularyEntity } from 'src/modules/vocabulary/entities/vocabulary.entity';

import { LessonEntity } from './entities/lesson.entity';
import { SentenceEntity } from './entities/sentence.entity';
import { TopicEntity } from './entities/topic.entity';

/**
 * Upserts a reviewed import batch. Idempotent: lessons key on `slug`, vocab on
 * `word` + resolved topic. `topicSlug` is resolved to a Topic FK (unknown slugs
 * are reported in `unmatchedTopics` and the row imports with a null topic).
 * Caller is responsible for wrapping this in a transaction.
 */
export async function applyImportBatch(manager: EntityManager, batch: ImportBatch): Promise<ImportResult> {
  const lessonRepo = manager.getRepository(LessonEntity);
  const sentenceRepo = manager.getRepository(SentenceEntity);
  const vocabRepo = manager.getRepository(VocabularyEntity);
  const topicRepo = manager.getRepository(TopicEntity);

  const result: ImportResult = {
    lessonsCreated: 0,
    lessonsUpdated: 0,
    vocabCreated: 0,
    vocabUpdated: 0,
    unmatchedTopics: [],
  };

  const unmatched = new Set<string>();
  const topicCache = new Map<string, TopicEntity | null>();

  const resolveTopic = async (slug?: string | null): Promise<TopicEntity | null> => {
    if (!slug) return null;
    if (!topicCache.has(slug)) {
      const topic = await topicRepo.findOne({ where: { slug } });
      if (!topic) unmatched.add(slug);
      topicCache.set(slug, topic);
    }
    return topicCache.get(slug) ?? null;
  };

  for (const draft of batch.lessons) {
    const topic = await resolveTopic(draft.topicSlug);
    const existing = await lessonRepo.findOne({
      where: { slug: draft.slug },
      relations: { sentences: true },
    });

    if (existing) {
      if (existing.sentences?.length) {
        await sentenceRepo.remove(existing.sentences);
      }
      assignLesson(existing, draft, topic);
      existing.sentences = buildSentences(draft);
      await lessonRepo.save(existing);
      result.lessonsUpdated += 1;
    } else {
      const lesson = lessonRepo.create();
      assignLesson(lesson, draft, topic);
      lesson.sentences = buildSentences(draft);
      await lessonRepo.save(lesson);
      result.lessonsCreated += 1;
    }
  }

  for (const draft of batch.vocab) {
    const topic = await resolveTopic(draft.topicSlug);

    const lookup = vocabRepo.createQueryBuilder('v').where('v.word = :word', { word: draft.word });
    if (topic) lookup.andWhere('v.topic_id = :topicId', { topicId: topic.id });
    else lookup.andWhere('v.topic_id IS NULL');
    const existing = await lookup.getOne();

    const sourceLesson = draft.sourceLessonSlug
      ? await lessonRepo.findOne({ where: { slug: draft.sourceLessonSlug } })
      : null;

    if (existing) {
      assignVocab(existing, draft, topic, sourceLesson);
      await vocabRepo.save(existing);
      result.vocabUpdated += 1;
    } else {
      const vocab = vocabRepo.create();
      assignVocab(vocab, draft, topic, sourceLesson);
      await vocabRepo.save(vocab);
      result.vocabCreated += 1;
    }
  }

  result.unmatchedTopics = [...unmatched];
  return result;
}

function assignLesson(lesson: LessonEntity, draft: ImportLesson, topic: TopicEntity | null): void {
  lesson.slug = draft.slug;
  lesson.title = draft.title;
  lesson.description = draft.description ?? null;
  lesson.level = draft.level;
  lesson.topic = topic;
  lesson.source = draft.source ?? null;
  lesson.externalUrl = draft.externalUrl ?? null;
  lesson.mediaKind = draft.mediaKind ?? null;
}

function buildSentences(draft: ImportLesson): SentenceEntity[] {
  return draft.sentences.map((s) => {
    const sentence = new SentenceEntity();
    sentence.order = s.order;
    sentence.text = s.text;
    sentence.ipa = s.ipa ?? null;
    sentence.translation = s.translation ?? null;
    sentence.audioUrl = s.audioUrl ?? null;
    return sentence;
  });
}

function assignVocab(
  vocab: VocabularyEntity,
  draft: ImportVocab,
  topic: TopicEntity | null,
  sourceLesson: LessonEntity | null
): void {
  vocab.word = draft.word;
  vocab.meaningVn = draft.meaningVn;
  vocab.meaningEn = draft.meaningEn ?? null;
  vocab.ipa = draft.ipa ?? null;
  vocab.synonyms = draft.synonyms;
  vocab.exampleSentences = draft.exampleSentences;
  vocab.topic = topic;
  vocab.level = draft.level;
  vocab.audioUrl = draft.audioUrl ?? null;
  vocab.sourceLesson = sourceLesson;
}
