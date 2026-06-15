import type { ImportBatch, ImportLesson, ImportSentence } from '@elearning/contracts';

import { fetchText } from '../lib/http';
import { isAllowed } from '../lib/robots';
import { buildTopicVocab, candidateWords } from '../lib/vocab-extract';
import type { RunContext, Source } from '../types';

const API = 'https://tatoeba.org/en/api_v0/search';

interface TatoebaTranslation {
  text?: string;
  lang?: string;
}
interface TatoebaResult {
  text?: string;
  lang?: string;
  translations?: TatoebaTranslation[][];
}
interface TatoebaResponse {
  results?: TatoebaResult[];
}

/** Tatoeba returns translations as [direct[], indirect[]]; pull a Vietnamese one. */
function pickVietnamese(result: TatoebaResult): string | null {
  for (const group of result.translations ?? []) {
    if (!Array.isArray(group)) continue;
    for (const t of group) {
      if (t.lang === 'vie' && t.text?.trim()) return t.text.trim();
    }
  }
  return null;
}

/**
 * Tatoeba — English example sentences paired with Vietnamese translations.
 * Produces one "example sentences" lesson per topic plus enriched vocab cards.
 */
export const tatoebaSource: Source = {
  name: 'tatoeba',
  licence: 'Tatoeba sentences (CC BY 2.0 FR — attribute; audio licensed per-clip)',
  crawl: async (ctx: RunContext): Promise<ImportBatch> => {
    const plan = ctx.plan;
    if (!plan) {
      throw new Error('Tatoeba source requires a topic plan — run with --topic <slug> / --pilot / --all.');
    }

    const pairs: { en: string; vi: string }[] = [];
    const seen = new Set<string>();

    for (const query of plan.queries) {
      if (pairs.length >= ctx.limit) break;
      const url =
        `${API}?from=eng&to=vie&trans_to=vie&trans_filter=limit` + `&sort=relevance&query=${encodeURIComponent(query)}`;
      if (!(await isAllowed(url))) {
        ctx.log(`robots.txt disallows ${url}`);
        continue;
      }

      let data: TatoebaResponse;
      try {
        data = JSON.parse(await fetchText(url)) as TatoebaResponse;
      } catch (err) {
        ctx.log(`tatoeba query "${query}" failed: ${(err as Error).message}`);
        continue;
      }

      for (const result of data.results ?? []) {
        const en = result.text?.trim();
        const vi = pickVietnamese(result);
        if (!en || !vi || seen.has(en.toLowerCase())) continue;
        seen.add(en.toLowerCase());
        pairs.push({ en, vi });
        if (pairs.length >= ctx.limit) break;
      }
      ctx.log(`tatoeba "${query}" → ${pairs.length} pair(s) total`);
    }

    if (pairs.length < 3) {
      ctx.log(`skip "${plan.topicSlug}" — only ${pairs.length} usable sentence pair(s)`);
      return { lessons: [], vocab: [] };
    }

    const sentences: ImportSentence[] = pairs.map((p, i) => ({
      order: i + 1,
      text: p.en,
      ipa: null,
      translation: p.vi,
      audioUrl: null,
    }));

    const lesson: ImportLesson = {
      slug: `tatoeba-${plan.topicSlug}`,
      title: `${plan.title} — Example Sentences`,
      description: `Authentic example sentences for ${plan.title}, with Vietnamese translations.`,
      level: plan.level,
      topicSlug: plan.topicSlug,
      source: 'Tatoeba (CC BY 2.0 FR)',
      externalUrl: null,
      mediaKind: null,
      sentences,
    };

    const englishTexts = pairs.map((p) => p.en);
    const { vocab, gaps } = await buildTopicVocab(candidateWords(englishTexts), plan, englishTexts);
    ctx.log(`"${plan.topicSlug}": ${sentences.length} sentence(s), ${vocab.length} vocab, ${gaps.length} gap(s)`);
    if (gaps.length) ctx.log(`  vocab gaps (no Vietnamese meaning): ${gaps.join(', ')}`);

    return { lessons: [lesson], vocab };
  },
};
