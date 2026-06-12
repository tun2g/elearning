import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import { ImportBatchSchema, type ImportBatch } from '@elearning/contracts';

const here = dirname(fileURLToPath(import.meta.url));
// packages/crawler/src/lib → repo-root/data/import
const DATA_ROOT = resolve(here, '../../../../data/import');

/** Validates a batch and writes it to data/import/<runId>/batch.json for review. */
export function writeBatch(batch: ImportBatch, runId: string, outBase?: string): string {
  const validated = ImportBatchSchema.parse(batch);
  const dir = join(outBase ? resolve(outBase) : DATA_ROOT, runId);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, 'batch.json');
  writeFileSync(file, `${JSON.stringify(validated, null, 2)}\n`);
  return file;
}
