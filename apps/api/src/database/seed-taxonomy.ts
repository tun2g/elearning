import { readFileSync } from 'fs';
import { resolve } from 'path';

import { DataSource } from 'typeorm';

import { CategoryEntity } from '../modules/content/entities/category.entity';
import { CefrLevel, TopicEntity } from '../modules/content/entities/topic.entity';

// this file lives at apps/api/src/database/seed-taxonomy.ts → repo root is four levels up
const REPO_ROOT = resolve(__dirname, '../../../..');
const TAXONOMY_FILE = resolve(REPO_ROOT, 'packages/seed-data/taxonomy.json');

interface TaxonomyCategory {
  slug: string;
  title: string;
  order: number;
  description?: string | null;
}

interface TaxonomyTopic {
  slug: string;
  title: string;
  categorySlug: string;
  cefrLevel: CefrLevel;
  order: number;
  description?: string | null;
}

interface TaxonomyFile {
  categories: TaxonomyCategory[];
  topics: TaxonomyTopic[];
}

/**
 * Upserts the committed category + topic taxonomy by slug. Idempotent — safe to
 * run on every seed/import so topic slugs always resolve to a Topic FK.
 */
export async function seedTaxonomy(dataSource: DataSource): Promise<{ categories: number; topics: number }> {
  const raw = JSON.parse(readFileSync(TAXONOMY_FILE, 'utf8')) as TaxonomyFile;
  const categoryRepo = dataSource.getRepository(CategoryEntity);
  const topicRepo = dataSource.getRepository(TopicEntity);

  const categoryBySlug = new Map<string, CategoryEntity>();
  for (const c of raw.categories) {
    const category = (await categoryRepo.findOne({ where: { slug: c.slug } })) ?? categoryRepo.create({ slug: c.slug });
    category.title = c.title;
    category.order = c.order;
    category.description = c.description ?? null;
    categoryBySlug.set(c.slug, await categoryRepo.save(category));
  }

  for (const t of raw.topics) {
    const category = categoryBySlug.get(t.categorySlug);
    if (!category) {
      throw new Error(`Topic "${t.slug}" references unknown category "${t.categorySlug}"`);
    }
    const topic = (await topicRepo.findOne({ where: { slug: t.slug } })) ?? topicRepo.create({ slug: t.slug });
    topic.title = t.title;
    topic.cefrLevel = t.cefrLevel;
    topic.order = t.order;
    topic.description = t.description ?? null;
    topic.category = category;
    await topicRepo.save(topic);
  }

  return { categories: raw.categories.length, topics: raw.topics.length };
}
