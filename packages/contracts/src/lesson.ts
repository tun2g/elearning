import { z } from 'zod';

import { TopicRefSchema } from './topic';

export const LessonLevel = z.enum(['beginner', 'intermediate', 'advanced']);
export type LessonLevel = z.infer<typeof LessonLevel>;

/** How a lesson's audio is delivered. `youtube` lessons embed the source video. */
export const MediaKind = z.enum(['audio', 'youtube']);
export type MediaKind = z.infer<typeof MediaKind>;

/** A single practiceable sentence — the atom of "practice by sound". */
export const SentenceSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  text: z.string(),
  ipa: z.string().nullable(),
  translation: z.string().nullable(),
  audioUrl: z.string().nullable(),
});
export type Sentence = z.infer<typeof SentenceSchema>;

/** Lesson without its sentences — used in list views. */
export const LessonSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  level: LessonLevel,
  topic: TopicRefSchema.nullable(),
  source: z.string().nullable(),
  /** For embedded sources (e.g. a YouTube watch URL); null for native-audio lessons. */
  externalUrl: z.string().nullable(),
  mediaKind: MediaKind.nullable(),
  sentenceCount: z.number().int(),
});
export type LessonSummary = z.infer<typeof LessonSummarySchema>;

/** Lesson with its full sentence list — used in the practice view. */
export const LessonDetailSchema = LessonSummarySchema.extend({
  sentences: z.array(SentenceSchema),
});
export type LessonDetail = z.infer<typeof LessonDetailSchema>;
