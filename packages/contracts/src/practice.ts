import { z } from 'zod';

export const SelfAssessment = z.enum(['again', 'hard', 'easy']);
export type SelfAssessment = z.infer<typeof SelfAssessment>;

export const PracticeMode = z.enum(['listen', 'shadow', 'voice']);
export type PracticeMode = z.infer<typeof PracticeMode>;

export const AttemptCreateDtoSchema = z.object({
  sentenceId: z.string(),
  mode: PracticeMode,
  selfAssessment: SelfAssessment,
  recordingUrl: z.string().nullable().optional(),
});
export type AttemptCreateDto = z.infer<typeof AttemptCreateDtoSchema>;

export const AttemptResponseSchema = z.object({
  id: z.string(),
  sentenceId: z.string(),
  mode: PracticeMode,
  selfAssessment: SelfAssessment,
  srsIntervalDays: z.number(),
  srsDueAt: z.string().datetime(),
  attemptedAt: z.string().datetime(),
});
export type AttemptResponse = z.infer<typeof AttemptResponseSchema>;

export const LessonProgressSchema = z.object({
  lessonId: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  completionPct: z.number().int().min(0).max(100),
  lastPracticedAt: z.string().datetime().nullable(),
  xpEarned: z.number().int(),
});
export type LessonProgress = z.infer<typeof LessonProgressSchema>;
