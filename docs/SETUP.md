# Setup & Local Development

Everything you need to run the Soundwell monorepo locally — install, run, migrate, and seed
content. For what the product _is_, see the [README](../README.md); for the product plan, see
[`PLAN.md`](./PLAN.md).

## Prerequisites

- **Node 24** (`.nvmrc`), **pnpm 10**, **Docker** (for Postgres + MinIO).

## Setup

```bash
pnpm install

# 1) start Postgres (+ MinIO)
pnpm db:up                            # docker compose up -d (apps/api/docker-compose.yml)

# 2) build shared packages (contracts + core)
pnpm build:packages

# 3) configure + seed the API
cp apps/api/.env.example apps/api/.env
pnpm seed                             # DB_SYNCHRONIZE=true creates tables on boot/seed

# 4) configure the web app
cp apps/web/.env.example apps/web/.env
```

## Run (dev)

```bash
pnpm dev:api                          # http://localhost:4000  (Swagger: /docs)
pnpm dev:web                          # http://localhost:3000  -> /lessons
pnpm dev:landing                      # http://localhost:3001  -> marketing landing page
```

> The landing app reads `NEXT_PUBLIC_APP_URL` (where CTAs point) and `NEXT_PUBLIC_SITE_URL`
> (canonical URL for SEO). Copy `apps/landing/.env.example` to `apps/landing/.env` if you need
> non-default values; both fall back to localhost.

Or everything wired through turbo:

```bash
pnpm dev
```

### Mobile

The mobile app follows the **Obytes Expo starter v9** conventions and is scaffolded at
`apps/mobile/`. See [`mobile/README.md`](./mobile/README.md).

```bash
pnpm --filter @elearning/mobile start   # Expo dev server
```

## Database migrations

Dev uses `DB_SYNCHRONIZE=true` (schema auto-synced from entities). For production-grade
schema changes, use TypeORM migrations (`synchronize: false`). Run from `apps/api/`:

Generate/create take a path that ends in a meaningful name (`<timestamp>-<name>.ts`):

```bash
# diff entities vs DB -> new migration file (pass a descriptive name)
pnpm --filter @elearning/api migration:generate src/database/migrations/init-schema
# empty migration to hand-write
pnpm --filter @elearning/api migration:create src/database/migrations/add-units
pnpm --filter @elearning/api migration:run:dev     # apply (ts-node, src/ data source)
pnpm --filter @elearning/api migration:revert:dev  # roll back the last migration
pnpm --filter @elearning/api migration:show        # list applied/pending
```

Migrations live in `apps/api/src/database/migrations/`. In production run the compiled build:
`migration:run:prod` / `migration:revert:prod` (uses `dist/database/data-source.js` — build first).

> Generating: set `DB_SYNCHRONIZE=false` first, otherwise the live schema already matches the
> entities and the generated migration will be empty.

## Content pipeline (crawler → review → import)

Compliant content ingestion. The crawler (`packages/crawler`) pulls from rights-clear
sources, normalizes to import JSON, downloads native audio to MinIO, and writes a batch to
`data/import/<run>/` for **human review** — it never writes to the DB. You then import the
reviewed batch via the API/CLI. See
[`../plans/20260612130515-content-crawler/plan.md`](../plans/20260612130515-content-crawler/plan.md).

```bash
pnpm db:up                                   # Postgres + MinIO (console: http://localhost:9001)

# Crawl a compliant source (VOA = US-gov public domain). Pass a VOA RSS feed URL:
pnpm crawl --source voa --feed <voa-rss-url> --limit 5
#   --no-audio   skip audio download (faster dry run)
#   --out <dir>  override the output base dir

# Review the generated data/import/<run>/batch.json, then import it:
pnpm seed:import                             # imports every data/import/**/batch.json
# or import one batch:  pnpm seed:import data/import/<run>/batch.json
```

Audio: native audio is downloaded to MinIO and attached at the **lesson** level
(`media_kind=audio`, `external_url=<mp3>`). Per-sentence IPA/translation and vocabulary come
from the enrichment phase (Phase C). The admin HTTP route `POST /admin/content/import`
(`x-api-key: $INTERNAL_API_KEY`) does the same import as the CLI.

### Committed seed data (reliable prod seeding)

`data/import/` is git-ignored (raw, per-run crawler output). Once a batch is reviewed, copy it
into **`packages/seed-data/batches/`** (committed) so production seeds from version-controlled
content — no need to re-run the crawler.

```bash
pnpm seed:content:check     # validate committed batches against the schema (no DB)
pnpm seed:content           # import packages/seed-data/batches into the DB
```

> **Compliance:** sources are allowlisted, robots.txt is respected, requests are rate-limited,
> and attribution is stored in `lessons.source`. YouTube/blogs are handled as embeds/text only —
> never audio downloads. `data/` is git-ignored.

## Theming

Design tokens are centralized in **`packages/theme/theme.css`** (the single source of truth,
imported by `apps/web` and `apps/landing`). Light is the default; `.dark` overrides surfaces.
Web + landing switch modes via `next-themes`; mobile via its Settings switcher. Change the
theme once, in that file.
