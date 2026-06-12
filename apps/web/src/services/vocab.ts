import { apiGet, apiPost } from '@/lib/api';

import type { Assessment } from './types';

export interface VocabCard {
  id: string;
  word: string;
  meaningVn: string;
  ipa: string | null;
  synonyms: string[];
  exampleSentences: string[];
}

export function getVocabReview(token: string): Promise<VocabCard[]> {
  return apiGet<VocabCard[]>('/vocabulary/review', token);
}

export function postVocabAttempt(token: string, input: { vocabId: string; assessment: Assessment }): Promise<unknown> {
  return apiPost(
    '/vocabulary/attempt',
    {
      vocabId: input.vocabId,
      correct: input.assessment === 'easy',
      assessment: input.assessment,
    },
    token
  );
}
