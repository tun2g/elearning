import { createMutation, createQuery } from 'react-query-kit';

import {
  getVocabReview,
  getVocabTopicSession,
  postSeedReviewWords,
  postVocabAttempt,
  type VocabCard,
} from '@/services/vocab';

import type { Assessment } from '@/services/types';
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

export const useVocabTopicSession = createQuery<VocabCard[], { slug: string }>({
  queryKey: queryKeys.vocabTopicSession,
  fetcher: ({ slug }) => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return getVocabTopicSession(token, slug);
  },
});

export const useVocabAttempt = createMutation({
  mutationFn: (input: { vocabId: string; assessment: Assessment }) => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    return postVocabAttempt(token, input);
  },
});

export const useSeedReviewWords = createMutation({
  mutationFn: (input: { words: string[] }) => {
    const token = getAccessToken();
    if (!token) return Promise.resolve({ seeded: 0 });
    return postSeedReviewWords(token, input.words);
  },
});
