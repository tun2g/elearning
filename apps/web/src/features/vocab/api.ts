import { createMutation, createQuery } from 'react-query-kit';

import { getVocabReview, postVocabAttempt, type Assessment, type VocabCard } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { queryKeys } from '@/lib/query-keys';

export const useVocabReview = createQuery<VocabCard[]>({
  queryKey: queryKeys.vocabReview,
  fetcher: () => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return getVocabReview(token);
  },
});

export const useVocabAttempt = createMutation({
  mutationFn: (input: { vocabId: string; assessment: Assessment }) => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return postVocabAttempt(token, input);
  },
});
