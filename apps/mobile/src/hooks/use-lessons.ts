import type { LessonDetail, LessonSummary, VoiceAttemptResult } from '@elearning/contracts';
import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import { client } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';
import { getToken } from '@/lib/auth/utils';

export const useLessons = createQuery<LessonSummary[], void, AxiosError>({
  queryKey: queryKeys.lessons,
  fetcher: () => client.get<LessonSummary[]>('/lessons').then(r => r.data),
});

export const useLesson = createQuery<LessonDetail, { slug: string }, AxiosError>({
  queryKey: queryKeys.lessonDetail,
  fetcher: ({ slug }) =>
    client.get<LessonDetail>(`/lessons/${slug}`).then(r => r.data),
});

export const useVoiceAttempt = createMutation<
  VoiceAttemptResult,
  { sentenceId: string; audioBase64: string; mimeType: string },
  AxiosError
>({
  mutationFn: (input) => {
    // Voice evaluation is gated to authenticated users (it costs an API call).
    if (!getToken()?.access)
      return Promise.reject(new Error('Sign in to use speaking practice'));
    return client
      .post<VoiceAttemptResult>('/practice/voice-attempt', input)
      .then(r => r.data);
  },
});
