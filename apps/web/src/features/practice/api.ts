import { createMutation, createQuery } from 'react-query-kit';

import { getLessonState, postPracticeAttempt, type Assessment, type LessonState } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';

export const usePracticeAttempt = createMutation({
  mutationFn: (input: { sentenceId: string; assessment: Assessment }) => {
    const token = getAccessToken();
    if (!token) return Promise.resolve(undefined); // guest — no persistence
    return postPracticeAttempt(token, input);
  },
});

export const useLessonState = createQuery<LessonState, { lessonId: string }>({
  queryKey: queryKeys.lessonState,
  fetcher: ({ lessonId }) => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return getLessonState(token, lessonId);
  },
});
