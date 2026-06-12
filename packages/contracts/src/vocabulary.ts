import { z } from 'zod';

export const VocabularySchema = z.object({
  id: z.string(),
  word: z.string(),
  meaningVn: z.string(),
  meaningEn: z.string().nullable(),
  ipa: z.string().nullable(),
  synonyms: z.array(z.string()),
  exampleSentences: z.array(z.string()),
  topic: z.string().nullable(),
  level: z.string(),
  audioUrl: z.string().nullable(),
});
export type Vocabulary = z.infer<typeof VocabularySchema>;

export const VocabAttemptDtoSchema = z.object({
  vocabId: z.string(),
  correct: z.boolean(),
  assessment: z.enum(['again', 'hard', 'easy']),
});
export type VocabAttemptDto = z.infer<typeof VocabAttemptDtoSchema>;

export const VocabProgressSchema = z.object({
  vocabId: z.string(),
  srsIntervalDays: z.number().int(),
  srsDueAt: z.string().datetime(),
  totalReviews: z.number().int(),
  correctReviews: z.number().int(),
});
export type VocabProgress = z.infer<typeof VocabProgressSchema>;
