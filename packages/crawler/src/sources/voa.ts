import type { ImportBatch, ImportLesson, ImportSentence } from '@elearning/contracts';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import Parser from 'rss-parser';

import { fetchBuffer, fetchText } from '../lib/http';
import { isAllowed } from '../lib/robots';
import { segmentSentences } from '../lib/segment';
import { uploadObject } from '../lib/storage';
import type { RunContext, Source } from '../types';

type VoaItem = Parser.Item & { contentEncoded?: string };

const parser: Parser<object, VoaItem> = new Parser({
  customFields: { item: [['content:encoded', 'contentEncoded']] },
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);
}

/** Pull the readable transcript: prefer the full article page, fall back to RSS html. */
async function extractTranscript(item: VoaItem): Promise<string> {
  if (item.link && (await isAllowed(item.link))) {
    try {
      const html = await fetchText(item.link);
      const dom = new JSDOM(html, { url: item.link });
      const article = new Readability(dom.window.document).parse();
      if (article?.textContent && article.textContent.trim().length > 200) {
        return article.textContent;
      }
    } catch {
      // fall through to RSS content
    }
  }
  const fallback = item.contentEncoded ?? item.content ?? '';
  return new JSDOM(`<body>${fallback}</body>`).window.document.body.textContent ?? '';
}

async function buildLesson(item: VoaItem, ctx: RunContext, usedSlugs: Set<string>): Promise<ImportLesson | null> {
  const title = item.title?.trim();
  if (!title) return null;

  const transcript = await extractTranscript(item);
  const texts = segmentSentences(transcript);
  if (texts.length < 3) {
    ctx.log(`skip "${title}" — too few usable sentences (${texts.length})`);
    return null;
  }

  let slug = slugify(title) || `voa-${usedSlugs.size + 1}`;
  while (usedSlugs.has(slug)) slug = `${slug}-${usedSlugs.size + 1}`;
  usedSlugs.add(slug);

  let externalUrl: string | null = null;
  let mediaKind: ImportLesson['mediaKind'] = null;
  const audioSrc = item.enclosure?.url;
  if (ctx.withAudio && audioSrc && (await isAllowed(audioSrc))) {
    try {
      const { buffer, contentType } = await fetchBuffer(audioSrc);
      externalUrl = await uploadObject(
        `voa/${slug}.mp3`,
        buffer,
        contentType.startsWith('audio') ? contentType : 'audio/mpeg'
      );
      mediaKind = 'audio';
      ctx.log(`audio → ${externalUrl}`);
    } catch (err) {
      ctx.log(`audio failed for "${title}": ${(err as Error).message}`);
    }
  }

  const sentences: ImportSentence[] = texts.map((text, i) => ({
    order: i + 1,
    text,
    ipa: null,
    translation: null,
    audioUrl: null,
  }));

  ctx.log(`lesson "${title}" — ${sentences.length} sentence(s)`);

  return {
    slug,
    title: title.slice(0, 240),
    description: texts[0]?.slice(0, 200) ?? null,
    level: 'intermediate',
    topic: 'news',
    source: 'VOA Learning English',
    externalUrl,
    mediaKind,
    sentences,
  };
}

export const voaSource: Source = {
  name: 'voa',
  licence: 'VOA Learning English (US Government — public domain)',
  crawl: async (ctx: RunContext): Promise<ImportBatch> => {
    const feedUrl = ctx.feedUrl ?? voaSource.defaultFeed;
    if (!feedUrl) {
      throw new Error(
        'VOA needs an RSS feed URL — pass --feed <url>. Find feeds at ' +
          'https://learningenglish.voanews.com (RSS links per section).'
      );
    }

    if (!(await isAllowed(feedUrl))) {
      throw new Error(`robots.txt disallows fetching ${feedUrl}`);
    }

    ctx.log(`feed: ${feedUrl}`);
    const feed = await parser.parseURL(feedUrl);
    const items = (feed.items ?? []).slice(0, ctx.limit);

    const lessons: ImportLesson[] = [];
    const usedSlugs = new Set<string>();
    for (const item of items) {
      const lesson = await buildLesson(item, ctx, usedSlugs);
      if (lesson) lessons.push(lesson);
    }

    // Vocabulary extraction needs translation/enrichment (Phase C) — none here.
    return { lessons, vocab: [] };
  },
};
