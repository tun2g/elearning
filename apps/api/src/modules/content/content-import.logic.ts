import type { ImportBatch, ImportLesson, ImportResult, ImportVocab } from '@elearning/contracts';
import { EntityManager, IsNull } from 'typeorm';

import { VocabularyEntity } from 'src/modules/vocabulary/entities/vocabulary.entity';

import { LessonEntity } from './entities/lesson.entity';
import { SentenceEntity } from './entities/sentence.entity';

/**
 * Upserts a reviewed import batch. Idempotent: lessons key on `slug`, vocab on
 * `word` + `topic`. Caller is responsible for wrapping this in a transaction.
 */
export async function applyImportBatch(manager: EntityManager, batch: ImportBatch): Promise<ImportResult> {
  const lessonRepo = manager.getRepository(LessonEntity);
  const sentenceRepo = manager.getRepository(SentenceEntity);
  const vocabRepo = manager.getRepository(VocabularyEntity);

  const result: ImportResult = {
    lessonsCreated: 0,
    lessonsUpdated: 0,
    vocabCreated: 0,
    vocabUpdated: 0,
  };

  for (const draft of batch.lessons) {
    const existing = await lessonRepo.findOne({
      where: { slug: draft.slug },
      relations: { sentences: true },
    });

    if (existing) {
      if (existing.sentences?.length) {
        await sentenceRepo.remove(existing.sentences);
      }
      assignLesson(existing, draft);
      existing.sentences = buildSentences(draft);
      await lessonRepo.save(existing);
      result.lessonsUpdated += 1;
    } else {
      const lesson = lessonRepo.create();
      assignLesson(lesson, draft);
      lesson.sentences = buildSentences(draft);
      await lessonRepo.save(lesson);
      result.lessonsCreated += 1;
    }
  }

  for (const draft of batch.vocab) {
    const existing = await vocabRepo.findOne({
      where: { word: draft.word, topic: draft.topic ?? IsNull() },
    });

    const sourceLesson = draft.sourceLessonSlug
      ? await lessonRepo.findOne({ where: { slug: draft.sourceLessonSlug } })
      : null;

    if (existing) {
      assignVocab(existing, draft, sourceLesson);
      await vocabRepo.save(existing);
      result.vocabUpdated += 1;
    } else {
      const vocab = vocabRepo.create();
      assignVocab(vocab, draft, sourceLesson);
      await vocabRepo.save(vocab);
      result.vocabCreated += 1;
    }
  }

  return result;
}

function assignLesson(lesson: LessonEntity, draft: ImportLesson): void {
  lesson.slug = draft.slug;
  lesson.title = draft.title;
  lesson.description = draft.description ?? null;
  lesson.level = draft.level;
  lesson.topic = draft.topic ?? null;
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

function assignVocab(vocab: VocabularyEntity, draft: ImportVocab, sourceLesson: LessonEntity | null): void {
  vocab.word = draft.word;
  vocab.meaningVn = draft.meaningVn;
  vocab.meaningEn = draft.meaningEn ?? null;
  vocab.ipa = draft.ipa ?? null;
  vocab.synonyms = draft.synonyms;
  vocab.exampleSentences = draft.exampleSentences;
  vocab.topic = draft.topic ?? null;
  vocab.level = draft.level;
  vocab.audioUrl = draft.audioUrl ?? null;
  vocab.sourceLesson = sourceLesson;
}
