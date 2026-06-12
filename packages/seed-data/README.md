# @elearning/seed-data

Curated, **committed** content batches used to seed the database — in dev and prod alike —
without running the crawler.

- Each file in `batches/*.json` matches `ImportBatchSchema` from `@elearning/contracts`
  (the same shape the crawler emits and `POST /admin/content/import` accepts).
- Files are imported in filename order, so prefix with a number (`0001-…`, `0002-…`).
- Batches are **idempotent**: lessons upsert by `slug`, vocab by `word` + `topic`. Re-running
  the import updates rather than duplicates.

## Workflow

1. Author content here, or promote a reviewed crawler batch from `data/import/<run>/batch.json`.
2. Validate: `pnpm seed:content:check` (schema check, no DB).
3. Seed: `pnpm seed:content` (imports into the configured database).
