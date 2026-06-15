# @elearning/seed-data

Curated, **committed** content used to seed the database — in dev and prod alike — without
running the crawler.

## Taxonomy (`taxonomy.json`)

The authoritative Category → Topic taxonomy (10 categories, ~200 topics). Each topic carries a
primary CEFR band (`cefrLevel`); individual lessons/vocab keep their own `level` for spiral
content. Seeded **before** any content, idempotently by slug, via `seedTaxonomy()` (run
automatically by both `seed` and `seed:import`).

- `categories[]`: `slug`, `title`, `order`, `description`
- `topics[]`: `slug`, `title`, `categorySlug`, `cefrLevel`, `order`

Content references a topic by `topicSlug`; the importer resolves it to a Topic FK. Unknown
slugs import with a null topic and are reported in `ImportResult.unmatchedTopics`.

## Content batches (`batches/*.json`)

- Each file matches `ImportBatchSchema` from `@elearning/contracts` (the shape the crawler
  emits and `POST /admin/content/import` accepts).
- Imported in filename order — prefix with a number (`0001-…`, `0002-…`).
- **Idempotent**: lessons upsert by `slug`, vocab by `word` + resolved topic.

## Workflow

1. Author content here, or promote a reviewed crawler batch from `data/import/<run>/batch.json`.
2. Validate: `pnpm seed:content:check` (schema check, no DB).
3. Seed: `pnpm seed:content` (seeds taxonomy + imports content).

## Crawling more content (crawl-only pipeline)

The crawler tags everything to the taxonomy and reports per-topic coverage.

```bash
# Pilot: ~18 topics across categories/levels (prove the pipeline)
pnpm crawl --source tatoeba --pilot --limit 12

# A single topic
pnpm crawl --source tatoeba --topic ordering-at-a-restaurant

# Authentic audio lessons from VOA (pass the section RSS feed)
pnpm crawl --source voa --topic news-and-media --feed <voa-rss-url> --limit 5

# Scale to every taxonomy topic (long; run in batches, review per category)
pnpm crawl --source tatoeba --all --limit 12
```

Each run writes `data/import/<run>/batch.json` and prints a coverage report flagging topics
below the gate (≥1 lesson, ≥5 vocab). Review the JSON, then promote good batches into
`batches/` (numbered) and import.

### Sources & licensing

- **Tatoeba** — English example sentences with Vietnamese translations. CC BY 2.0 FR: attribute
  Tatoeba. Audio is licensed **per clip** — verify before using any audio commercially.
- **VOA Learning English** — US-government **public domain** audio lessons. Credit
  `learningenglish.voanews.com`. Filter out embedded third-party (AP/Reuters) material, which is
  not public domain.
- **Free Dictionary API** (Wiktionary-derived) — vocab IPA, English definition, synonyms.
  CC BY-SA 4.0: attribute and keep share-alike in mind.
- **MyMemory translation API** — the Vietnamese gloss (`meaningVn`). English Wiktionary's
  `/w/` + `/api/` are robots-disallowed, so it can't be crawled politely for translations;
  MyMemory is a free, callable en→vi translation API (attribute; ~5k words/day anonymous, more
  with a contact email). Glosses are MT-derived — review before shipping.

Vietnamese meaning is required; candidate words without one are reported as **gaps**, never
fabricated. Crawl-only coverage is uneven by design — the coverage report is the source of truth
for what still needs content.
