import type { LessonProgress, VoiceAttemptResult, VoiceTranscriptionResult } from '@elearning/contracts';

import { apiGet, apiPost } from '@/lib/api';

import type { Assessment } from './types';

export type {
  LessonProgress,
  PronunciationAssessment,
  VoiceAttemptResult,
  VoiceTranscriptionResult,
  WordResult,
} from '@elearning/contracts';

export interface LessonState {
  completionPct: number;
  status: string;
  attempts: { sentenceId: string; selfAssessment: Assessment }[];
}

export function getLessonState(token: string, lessonId: string): Promise<LessonState> {
  return apiGet<LessonState>(`/practice/lesson/${lessonId}`, token);
}

/** The user's progress across every lesson they've started — for the lessons list. */
export function getLessonProgress(token: string): Promise<LessonProgress[]> {
  return apiGet<LessonProgress[]>('/practice/progress', token);
}

/** Transcribe a recording and save the attempt. Scoring is deferred. */
export function postVoiceTranscribe(
  token: string,
  input: { sentenceId: string; audioBase64: string; mimeType: string }
): Promise<VoiceTranscriptionResult> {
  return apiPost<VoiceTranscriptionResult>('/practice/voice-attempt', input, token);
}

/** Score a previously-transcribed attempt on demand (audio is re-sent). */
export function postVoiceEvaluate(
  token: string,
  input: { attemptId: string; sentenceId: string; audioBase64: string; mimeType: string }
): Promise<VoiceAttemptResult> {
  return apiPost<VoiceAttemptResult>('/practice/voice-attempt/evaluate', input, token);
}
