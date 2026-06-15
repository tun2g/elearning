import type { TopicRef } from '@elearning/contracts';

import { apiGet, apiPost } from '@/lib/api';

import type { Assessment } from './types';

export type VocabCardStatus = 'new' | 'review';

export interface VocabCard {
  id: string;
  word: string;
  meaningVn: string;
  ipa: string | null;
  synonyms: string[];
  exampleSentences: string[];
  topic: TopicRef | null;
  status: VocabCardStatus;
}

export function getVocabReview(token: string): Promise<VocabCard[]> {
  return apiGet<VocabCard[]>('/vocabulary/review', token);
}

export function getVocabTopicSession(token: string, slug: string): Promise<VocabCard[]> {
  return apiGet<VocabCard[]>(`/vocabulary/topic/${slug}/study`, token);
}

/** Queue mispronounced words for review; returns how many matched the catalog. */
export function postSeedReviewWords(token: string, words: string[]): Promise<{ seeded: number }> {
  return apiPost<{ seeded: number }>('/vocabulary/review/seed', { words }, token);
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
