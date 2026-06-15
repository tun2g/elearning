import type { ImportVocab } from '@elearning/contracts';

import { fetchDefinition, fetchVietnamese } from './dictionary';
import type { TopicPlanEntry } from '../topic-plan';

/** Common English words to exclude from topic vocab candidates. */
const STOPWORDS = new Set([
  'about',
  'after',
  'again',
  'against',
  'because',
  'been',
  'before',
  'being',
  'between',
  'both',
  'could',
  'does',
  'doing',
  'down',
  'during',
  'each',
  'from',
  'further',
  'have',
  'having',
  'here',
  'into',
  'just',
  'more',
  'most',
  'only',
  'other',
  'over',
  'same',
  'should',
  'some',
  'such',
  'than',
  'that',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'through',
  'under',
  'until',
  'very',
  'were',
  'what',
  'when',
  'where',
  'which',
  'while',
  'with',
  'would',
  'your',
  'yours',
  'will',
  'going',
  'want',
  'like',
  'know',
  'really',
  'something',
  'someone',
]);

/** Most frequent content words across a set of sentences, longest-tie-broken. */
export function candidateWords(sentences: string[], limit = 12): string[] {
  const freq = new Map<string, number>();
  for (const sentence of sentences) {
    for (const raw of sentence.toLowerCase().match(/[a-z][a-z'-]+/g) ?? []) {
      const word = raw.replace(/^['-]+|['-]+$/g, '');
      if (word.length < 4 || STOPWORDS.has(word)) continue;
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([word]) => word)
    .slice(0, limit);
}

export interface VocabBuildResult {
  vocab: ImportVocab[];
  /** Candidate words dropped because no Vietnamese meaning could be sourced. */
  gaps: string[];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Enrich candidate words into vocab cards. A card requires a Vietnamese meaning;
 * words without one are reported as gaps (never fabricated).
 */
export async function buildTopicVocab(
  words: string[],
  plan: TopicPlanEntry,
  sentences: string[]
): Promise<VocabBuildResult> {
  const vocab: ImportVocab[] = [];
  const gaps: string[] = [];

  for (const word of words) {
    const [definition, meaningVn] = await Promise.all([fetchDefinition(word), fetchVietnamese(word)]);
    if (!meaningVn) {
      gaps.push(word);
      continue;
    }
    const matcher = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i');
    const example = sentences.find((s) => matcher.test(s));
    vocab.push({
      word,
      meaningVn,
      meaningEn: definition?.meaningEn ?? null,
      ipa: definition?.ipa ?? null,
      synonyms: definition?.synonyms ?? [],
      exampleSentences: example ? [example] : [],
      topicSlug: plan.topicSlug,
      level: plan.level,
      audioUrl: definition?.audioUrl ?? null,
      sourceLessonSlug: null,
    });
  }

  return { vocab, gaps };
}
