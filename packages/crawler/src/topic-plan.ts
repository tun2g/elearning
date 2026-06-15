import { allTopics, CefrLevel, getTopic } from './lib/taxonomy';

/** A topic-aware crawl target: what to search for and how to tag the output. */
export interface TopicPlanEntry {
  topicSlug: string;
  title: string;
  level: CefrLevel;
  /** Search terms for content sources (Tatoeba sentence search, vocab seeds). */
  queries: string[];
  /** Optional VOA RSS feed for authentic audio lessons on this topic. */
  voaFeed?: string;
}

/** Stopwords stripped when deriving search queries from a topic title. */
const TITLE_STOP = new Set([
  'a',
  'an',
  'the',
  'at',
  'in',
  'on',
  'of',
  'to',
  'and',
  'or',
  'for',
  'with',
  'your',
  'you',
  'about',
  'into',
  'basics',
  'common',
  'simple',
  'describing',
  'discussing',
  'part',
  'task',
]);

/** Per-topic overrides: sharper queries and (for news-style topics) a VOA feed. */
const OVERRIDES: Record<string, Partial<TopicPlanEntry>> = {
  'greetings-and-introductions': { queries: ['nice to meet you', 'my name is', 'how are you'] },
  'ordering-at-a-restaurant': { queries: ['order food', 'menu', 'restaurant', 'waiter'] },
  'at-a-cafe': { queries: ['coffee', 'cafe', 'order a drink'] },
  'at-the-airport': { queries: ['airport', 'flight', 'boarding pass', 'check in'] },
  'at-the-hotel': { queries: ['hotel', 'reservation', 'check in', 'room'] },
  'job-interviews': { queries: ['job interview', 'experience', 'strengths'] },
  'daily-routines': { queries: ['every morning', 'wake up', 'go to work', 'before bed'] },
  'family-members': { queries: ['my family', 'brother', 'sister', 'parents'] },
  'shopping-for-clothes': { queries: ['buy clothes', 'try on', 'size', 'fitting room'] },
  'at-the-doctor-s': { queries: ['doctor', 'symptoms', 'feel sick', 'appointment'] },
  'weather-and-seasons': { queries: ['weather', 'raining', 'sunny', 'cold today'] },
  'directions-and-locations': { queries: ['how do i get to', 'turn left', 'next to', 'directions'] },
  'numbers-and-counting': { queries: ['how many', 'count', 'number'] },
  'hobbies-and-free-time': { queries: ['hobby', 'free time', 'i enjoy', 'spare time'] },
  'jobs-and-occupations': { queries: ['what do you do', 'job', 'work as'] },
  'phones-and-devices': { queries: ['phone', 'mobile', 'charge', 'screen'] },
  'news-and-media': { queries: ['news', 'report', 'headline'] },
  'environment-and-climate-change': { queries: ['climate change', 'global warming', 'pollution'] },
  'artificial-intelligence': { queries: ['artificial intelligence', 'computer', 'robot'] },
};

/** Tokenize a topic title into a single fallback search query. */
function deriveQueries(title: string): string[] {
  const cleaned = title
    .replace(/&/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .toLowerCase();
  const words = cleaned.split(/[^a-z0-9']+/).filter((w) => w && !TITLE_STOP.has(w));
  const phrase = words.join(' ').trim();
  return phrase ? [phrase] : [title.toLowerCase()];
}

/** Build the crawl plan for one topic slug (taxonomy + overrides). */
export function planForTopic(slug: string): TopicPlanEntry {
  const topic = getTopic(slug);
  if (!topic) throw new Error(`Unknown topic slug "${slug}" — not in taxonomy.json`);
  const override = OVERRIDES[slug] ?? {};
  return {
    topicSlug: topic.slug,
    title: topic.title,
    level: topic.cefrLevel,
    queries: override.queries ?? deriveQueries(topic.title),
    voaFeed: override.voaFeed,
  };
}

/** Build the crawl plan for every taxonomy topic (Phase 3 scale runs). */
export function planForAll(): TopicPlanEntry[] {
  return allTopics().map((t) => planForTopic(t.slug));
}

/**
 * Pilot set: ~18 topics spread across categories and CEFR levels, chosen for
 * source coverage (concrete, situational themes Tatoeba covers well).
 */
export const PILOT_TOPICS: string[] = [
  'greetings-and-introductions',
  'family-members',
  'daily-routines',
  'numbers-and-counting',
  'common-foods',
  'ordering-at-a-restaurant',
  'at-a-cafe',
  'directions-and-locations',
  'at-the-airport',
  'at-the-hotel',
  'shopping-for-clothes',
  'at-the-doctor-s',
  'weather-and-seasons',
  'hobbies-and-free-time',
  'jobs-and-occupations',
  'job-interviews',
  'phones-and-devices',
  'artificial-intelligence',
];
