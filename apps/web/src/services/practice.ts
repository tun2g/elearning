import type { VoiceAttemptResult } from '@elearning/contracts';

import { apiGet, apiPost } from '@/lib/api';

import type { Assessment } from './types';

export type { PronunciationAssessment, VoiceAttemptResult, WordResult } from '@elearning/contracts';

export interface LessonState {
  completionPct: number;
  status: string;
  attempts: { sentenceId: string; selfAssessment: Assessment }[];
}

export function getLessonState(token: string, lessonId: string): Promise<LessonState> {
  return apiGet<LessonState>(`/practice/lesson/${lessonId}`, token);
}

export function postPracticeAttempt(
  token: string,
  input: { sentenceId: string; assessment: Assessment }
): Promise<unknown> {
  return apiPost(
    '/practice/attempt',
    {
      sentenceId: input.sentenceId,
      mode: 'listen',
      selfAssessment: input.assessment,
    },
    token
  );
}

export function postVoiceAttempt(
  token: string,
  input: { sentenceId: string; audioBase64: string; mimeType: string }
): Promise<VoiceAttemptResult> {
  return apiPost<VoiceAttemptResult>('/practice/voice-attempt', input, token);
}
