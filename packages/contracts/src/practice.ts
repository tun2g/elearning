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

// --- Speaking evaluation (voice mode) ---

/** Per-word outcome after aligning the transcription against the reference sentence. */
export const WordStatus = z.enum(['ok', 'substituted', 'omitted', 'inserted']);
export type WordStatus = z.infer<typeof WordStatus>;

export const WordResultSchema = z.object({
  /** The reference word (or, for `inserted`, the extra word the speaker added). */
  text: z.string(),
  status: WordStatus,
  /** What the recognizer heard in this slot, when it differs from `text`. */
  heardAs: z.string().nullable().optional(),
});
export type WordResult = z.infer<typeof WordResultSchema>;

/**
 * Vendor-neutral pronunciation assessment. Scores come from the evaluator
 * (LLM today, swappable later); `words` is computed by aligning `transcription`
 * against the known sentence — never trusted to the model directly.
 */
export const PronunciationAssessmentSchema = z.object({
  /** What the recognizer heard the user say. */
  transcription: z.string(),
  overall: z.number().int().min(0).max(100),
  fluency: z.number().int().min(0).max(100),
  completeness: z.number().int().min(0).max(100),
  words: z.array(WordResultSchema),
  /** Short, human-readable coaching tip (from the evaluator). */
  coachingNote: z.string().nullable().optional(),
  /** Which engine produced the scores, e.g. "gemini". */
  provider: z.string(),
});
export type PronunciationAssessment = z.infer<typeof PronunciationAssessmentSchema>;

/** Request body for a spoken attempt. Audio is base64-encoded and never persisted. */
export const VoiceAttemptCreateDtoSchema = z.object({
  sentenceId: z.string(),
  audioBase64: z.string(),
  /** MIME type of the recording, e.g. "audio/webm" or "audio/m4a". */
  mimeType: z.string(),
});
export type VoiceAttemptCreateDto = z.infer<typeof VoiceAttemptCreateDtoSchema>;

/**
 * Response for the transcribe step: what the recognizer heard, plus the id of
 * the saved attempt. Scoring is deferred — call the evaluate endpoint with this
 * `attemptId` (and the audio re-sent) to get a full {@link VoiceAttemptResult}.
 */
export const VoiceTranscriptionResultSchema = z.object({
  attemptId: z.string(),
  /** What the recognizer heard the user say, verbatim. */
  transcription: z.string(),
});
export type VoiceTranscriptionResult = z.infer<typeof VoiceTranscriptionResultSchema>;

/**
 * Request to score a previously-transcribed attempt. The audio is re-sent
 * (it is never stored server-side) and the saved attempt is updated in place.
 */
export const VoiceEvaluateDtoSchema = z.object({
  attemptId: z.string(),
  sentenceId: z.string(),
  audioBase64: z.string(),
  mimeType: z.string(),
});
export type VoiceEvaluateDto = z.infer<typeof VoiceEvaluateDtoSchema>;

/** Response for the evaluate step: the assessment plus the (re-derived) SRS state. */
export const VoiceAttemptResultSchema = z.object({
  assessment: PronunciationAssessmentSchema,
  /** SRS grade derived from `overall` (the user does not self-rate in voice mode). */
  grade: SelfAssessment,
  srsIntervalDays: z.number(),
  srsDueAt: z.string().datetime(),
  attemptedAt: z.string().datetime(),
});
export type VoiceAttemptResult = z.infer<typeof VoiceAttemptResultSchema>;

export const LessonProgressSchema = z.object({
  lessonId: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  completionPct: z.number().int().min(0).max(100),
  lastPracticedAt: z.string().datetime().nullable(),
  xpEarned: z.number().int(),
});
export type LessonProgress = z.infer<typeof LessonProgressSchema>;
