import type { AxiosError } from 'axios';
import { createMutation, createQuery } from 'react-query-kit';

import { client } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/query-keys';

export type VocabCardStatus = 'new' | 'review';

export type VocabCard = {
  id: string;
  word: string;
  meaningVn: string;
  ipa: string | null;
  synonyms: string[];
  exampleSentences: string[];
  level: string;
  status: VocabCardStatus;
};

export const useVocabReview = createQuery<VocabCard[], void, AxiosError>({
  queryKey: queryKeys.vocabReview,
  fetcher: () => client.get<VocabCard[]>('/vocabulary/review').then(r => r.data),
});

export const useVocabAttempt = createMutation<
  unknown,
  { vocabId: string; correct: boolean; assessment: 'again' | 'hard' | 'easy' },
  AxiosError
>({
  mutationFn: vars => client.post('/vocabulary/attempt', vars),
});
