# Elearning — English-learning ecosystem · Plan

A speaking-first English practice platform (web + mobile + API), built as a turbo/pnpm
monorepo. Method inspired by luyennoi.com ("practice by sound" — listen, shadow, speak),
with concepts borrowed from the existing `ebot` Telegram bot.

## Decisions (locked)

| Area             | Decision                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Monorepo         | Turborepo + pnpm workspaces                                                                                 |
| Backend standard | `vault/be` — NestJS 11 + TypeORM + **PostgreSQL** (single source of truth)                                  |
| Web standard     | `vault/dapp` — Next.js 16 (App Router/RSC) + Tailwind 4 + shadcn + React Query                              |
| Mobile           | **Obytes Expo starter** (latest) — Expo Router + NativeWind + TanStack Query                                |
| Content          | **Crawl-first hybrid**: crawl multiple sources → AI fills fixed-content gaps → AI _speaking_ features later |
| ebot             | Borrow concepts only (shadowing, vocab, streaks, stats); not integrated now                                 |
| Auth             | JWT/email/social — **not** vault's wallet auth (adapt structure, swap mechanism)                            |

## Architecture

```
apps/
  api      NestJS + Postgres — system of record (users, content, progress, streaks)
  web      Next.js 16 — browser client
  mobile   Obytes Expo starter — iOS/Android client
packages/
  contracts  shared zod schemas + TS types (the api↔clients contract)
  core       pure learning logic borrowed from ebot (scoring rubrics, streak math)
```

One API is the brain; web, mobile (and later the bot) are clients. Clients **share
contracts + logic, not UI** (Next/shadcn vs Expo/NativeWind keep separate component layers).

## Domain model (start)

- **Lesson** — a practice unit (slug, title, level, topic, source attribution).
- **Sentence** — the atom of "practice by sound" (text, IPA, translation, audioUrl, order).
- _(later)_ **User**, **Attempt** (per-sentence practice + score), **Progress/Streak**,
  **Vocabulary**, **Topic**.

The schema is shaped now so crawled data slots in (`source`, `audioUrl`, `ipa`).

## Roadmap

### Phase 0 — Foundation ✅ (this turn)

- Monorepo (turbo + pnpm), shared tooling (prettier, husky, commitlint, lint-staged).
- `packages/contracts` + `packages/core`.
- `apps/api`: NestJS + TypeORM + Postgres, `Lesson`/`Sentence`, `GET /lessons`,
  `GET /lessons/:slug`, seed, docker-compose for Postgres, Swagger.
- `apps/web`: lessons list + practice screen (audio via Web Speech API placeholder).
- `apps/mobile`: Obytes generate + integrate guide + ready lessons slice (`docs/mobile/`).

### Phase 1 — Content pipeline (crawler)

- Decide concrete sources (pick legally-safe ones; confirm ToS/copyright per source).
- Crawler service (likely a NestJS module or a `packages/crawler` job) → normalize into
  `Lesson`/`Sentence` with `source` attribution and audio handling.
- Admin/internal endpoints to ingest, review, publish content.
- AI fallback to **generate fixed content** where crawled data is thin (reuse ebot's
  generation prompts).
- **Open question to resolve:** which sources, and audio strategy (store crawled audio vs
  re-synthesize TTS).

### Phase 2 — Accounts & progress

- Auth (JWT + email/social/OTP). Adapt vault's guard/context structure; drop wallet auth.
- `User`, `Attempt`, `Progress`, `Streak` (streak math already in `packages/core`).
- Per-user progress on web + mobile; daily streak + reminders.

### Phase 3 — Speaking & AI (the ELSA/Duolingo-style core)

- Record audio on web/mobile → API → evaluation.
- MVP scoring via **Gemini multimodal** (port ebot's `evaluateVoicePronunciation` /
  `evaluateShadowing` rubrics — already typed in `packages/core`).
- Upgrade path for true phoneme-level scoring: **Azure Speech Pronunciation Assessment**.
- Shadowing, cold read-aloud, AI tutor / roleplay (ebot concepts).

### Phase 4 — Gamification & retention

- Streaks, XP, leaderboards, daily goals, push notifications.

### Phase 5 — Ecosystem

- Bring `ebot` in as a client of the API (shared user + progress + content), retiring its
  separate data store over time.

## Risks / open questions

- **Crawl legality** — must vet each source's ToS/copyright before building on it.
- **Audio rights** — crawled native audio may be unredistributable; TTS may be safer.
- **Pronunciation depth** — LLM scoring is "good enough" for MVP; phoneme-grade needs Azure.
- **Mobile↔monorepo** — Obytes is standalone; integration steps in `docs/mobile/README.md`.
- **TypeORM 1.0** — newer than vault's 0.3.x; watch for API differences when porting patterns.
