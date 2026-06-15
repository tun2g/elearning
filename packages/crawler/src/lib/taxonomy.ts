import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
// packages/crawler/src/lib → packages/seed-data/taxonomy.json
const TAXONOMY_FILE = resolve(here, '../../../seed-data/taxonomy.json');

export type CefrLevel = 'beginner' | 'intermediate' | 'advanced';

export interface TaxonomyTopic {
  slug: string;
  title: string;
  categorySlug: string;
  cefrLevel: CefrLevel;
  order: number;
}

interface TaxonomyFile {
  categories: { slug: string; title: string }[];
  topics: TaxonomyTopic[];
}

let cache: TaxonomyFile | null = null;

function load(): TaxonomyFile {
  if (!cache) cache = JSON.parse(readFileSync(TAXONOMY_FILE, 'utf8')) as TaxonomyFile;
  return cache;
}

export function allTopics(): TaxonomyTopic[] {
  return load().topics;
}

export function getTopic(slug: string): TaxonomyTopic | undefined {
  return load().topics.find((t) => t.slug === slug);
}
