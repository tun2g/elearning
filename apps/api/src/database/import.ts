import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';

import { ImportBatchSchema, type ImportBatch } from '@elearning/contracts';

import { applyImportBatch } from '../modules/content/content-import.logic';
import { AppDataSource } from './data-source';
import { seedTaxonomy } from './seed-taxonomy';

/**
 * Imports reviewed content batches into the database.
 *
 *   pnpm --filter @elearning/api seed:import [path] [--dry]
 *
 * `path` is a JSON file or a directory of *.json batches. Relative paths resolve
 * from the repo root (default: ./data/import). Each file must match ImportBatchSchema.
 * `--dry` validates the batches without touching the database (useful in CI).
 *
 * For prod-style seeding from committed data:
 *   pnpm --filter @elearning/api seed:import packages/seed-data/batches
 */

// this file lives at apps/api/src/database/import.ts → repo root is four levels up
const REPO_ROOT = resolve(__dirname, '../../../..');
const DEFAULT_IMPORT_DIR = resolve(REPO_ROOT, 'data/import');

function collectFiles(target: string): string[] {
  if (!existsSync(target)) {
    throw new Error(`Import path not found: ${target}`);
  }
  if (statSync(target).isDirectory()) {
    return readdirSync(target)
      .filter((f) => f.endsWith('.json'))
      .map((f) => join(target, f))
      .sort();
  }
  return [target];
}

function loadBatches(files: string[]): ImportBatch {
  const merged: ImportBatch = { lessons: [], vocab: [] };
  for (const file of files) {
    const raw = JSON.parse(readFileSync(file, 'utf8')) as unknown;
    const batch = ImportBatchSchema.parse(raw);
    merged.lessons.push(...batch.lessons);
    merged.vocab.push(...batch.vocab);
    console.log(`  ${file}: ${batch.lessons.length} lesson(s), ${batch.vocab.length} vocab`);
  }
  return merged;
}

async function run(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry');
  const pathArg = args.find((a) => !a.startsWith('--'));
  const target = pathArg ? resolve(REPO_ROOT, pathArg) : DEFAULT_IMPORT_DIR;
  console.log(`Importing from: ${target}${dryRun ? ' (dry run)' : ''}`);

  const files = collectFiles(target);
  if (files.length === 0) {
    console.log('No .json batches found — nothing to import.');
    return;
  }

  const batch = loadBatches(files);

  if (dryRun) {
    console.log(`Valid — ${batch.lessons.length} lesson(s), ${batch.vocab.length} vocab (not imported).`);
    return;
  }

  await AppDataSource.initialize();
  try {
    const taxo = await seedTaxonomy(AppDataSource);
    console.log(`Taxonomy ready: ${taxo.categories} categories, ${taxo.topics} topics.`);

    const result = await AppDataSource.transaction((manager) => applyImportBatch(manager, batch));
    console.log(
      `Done — lessons +${result.lessonsCreated}/~${result.lessonsUpdated}, ` +
        `vocab +${result.vocabCreated}/~${result.vocabUpdated}`
    );
    if (result.unmatchedTopics.length) {
      console.warn(
        `\n⚠ ${result.unmatchedTopics.length} unmatched topic slug(s) (imported with null topic):\n  ` +
          result.unmatchedTopics.join(', ')
      );
    }
  } finally {
    await AppDataSource.destroy();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
