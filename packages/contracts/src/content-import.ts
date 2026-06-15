import { z } from 'zod';

import { LessonLevel, MediaKind } from './lesson';

/** One sentence in a crawled/normalized lesson awaiting import. */
export const ImportSentenceSchema = z.object({
  order: z.number().int().nonnegative(),
  text: z.string().min(1),
  ipa: z.string().nullish(),
  translation: z.string().nullish(),
  audioUrl: z.string().url().nullish(),
});
export type ImportSentence = z.infer<typeof ImportSentenceSchema>;

/** A normalized lesson ready to upsert. Keyed by `slug` (idempotent re-import). */
export const ImportLessonSchema = z.object({
  slug: z.string().min(1).max(160),
  title: z.string().min(1).max(240),
  description: z.string().nullish(),
  level: LessonLevel.default('beginner'),
  /** Taxonomy topic slug; resolved to a Topic FK on import (unknown → null + reported). */
  topicSlug: z.string().max(120).nullish(),
  /** Attribution — the source site/dataset (e.g. "VOA Learning English"). */
  source: z.string().max(120).nullish(),
  /** For embedded sources (e.g. the YouTube watch URL). */
  externalUrl: z.string().url().nullish(),
  mediaKind: MediaKind.nullish(),
  sentences: z.array(ImportSentenceSchema).min(1),
});
export type ImportLesson = z.infer<typeof ImportLessonSchema>;

/** A normalized vocabulary card ready to upsert. Deduped by `word` + `topic`. */
export const ImportVocabSchema = z.object({
  word: z.string().min(1).max(120),
  meaningVn: z.string().min(1),
  meaningEn: z.string().nullish(),
  ipa: z.string().max(200).nullish(),
  synonyms: z.array(z.string()).default([]),
  exampleSentences: z.array(z.string()).default([]),
  /** Taxonomy topic slug; resolved to a Topic FK on import (unknown → null + reported). */
  topicSlug: z.string().max(120).nullish(),
  level: z.string().max(20).default('beginner'),
  audioUrl: z.string().url().nullish(),
  /** Optional link back to the lesson it was derived from. */
  sourceLessonSlug: z.string().max(160).nullish(),
});
export type ImportVocab = z.infer<typeof ImportVocabSchema>;

/** A reviewed batch produced by the crawler and fed to the import endpoint/runner. */
export const ImportBatchSchema = z.object({
  lessons: z.array(ImportLessonSchema).default([]),
  vocab: z.array(ImportVocabSchema).default([]),
});
export type ImportBatch = z.infer<typeof ImportBatchSchema>;

/** Summary returned after an import runs. */
export const ImportResultSchema = z.object({
  lessonsCreated: z.number().int(),
  lessonsUpdated: z.number().int(),
  vocabCreated: z.number().int(),
  vocabUpdated: z.number().int(),
  /** Distinct topicSlugs referenced by the batch that had no matching Topic row. */
  unmatchedTopics: z.array(z.string()).default([]),
});
export type ImportResult = z.infer<typeof ImportResultSchema>;
