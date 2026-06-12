import { apiGet, apiPost } from '@/lib/api';

import type { Assessment } from './types';

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
