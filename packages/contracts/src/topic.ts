import { z } from 'zod';

/** CEFR banding mirrors the lesson level scale (A1/A2 → beginner, etc.). */
export const CefrLevel = z.enum(['beginner', 'intermediate', 'advanced']);
export type CefrLevel = z.infer<typeof CefrLevel>;

/** Minimal category reference embedded inside a topic. */
export const CategoryRefSchema = z.object({
  slug: z.string(),
  title: z.string(),
});
export type CategoryRef = z.infer<typeof CategoryRefSchema>;

/** Compact topic reference embedded on lessons and vocab. */
export const TopicRefSchema = z.object({
  slug: z.string(),
  title: z.string(),
  cefrLevel: CefrLevel,
  category: CategoryRefSchema,
});
export type TopicRef = z.infer<typeof TopicRefSchema>;

/** A topic in the taxonomy, with counts for browse views. */
export const TopicSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  cefrLevel: CefrLevel,
  order: z.number().int(),
  category: CategoryRefSchema,
  lessonCount: z.number().int(),
  vocabCount: z.number().int(),
});
export type Topic = z.infer<typeof TopicSchema>;

/** A category with its topic count, for the top-level browse view. */
export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  order: z.number().int(),
  topicCount: z.number().int(),
});
export type Category = z.infer<typeof CategorySchema>;
