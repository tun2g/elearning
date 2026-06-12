<div align="center">

# 🌊 Soundwell

### Speak English with confidence.

**Soundwell is a speaking-first English course.** Listen to native lines, shadow them out
loud, and build a daily streak — with spaced-repetition vocabulary and instant pronunciation
feedback.

</div>

---

## Why Soundwell

Most apps teach English by _reading and tapping_. Soundwell teaches it by **sound** — because
fluency is a speaking skill, not a multiple-choice one. The whole experience is built around a
single, proven loop:

> ### 🎧 Listen → 🗣️ Shadow → 🎙️ Speak
>
> **Listen** to a native sentence. **Shadow** it out loud, matching the rhythm and
> intonation. **Speak** it back and get feedback. Repeat daily, and confidence compounds.

No grammar drills in a vacuum. Every rep is your own voice, on real sentences.

## ✨ Features

|                                      |                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| 🎧 **Practice by sound**             | Short, native-audio lessons you listen to, shadow, and speak back — the core loop.   |
| 🧠 **Spaced-repetition vocabulary**  | Words you struggle with resurface at the right moment (SRS), so they actually stick. |
| 🔥 **Streaks & progress**            | A daily streak and per-lesson progress keep the habit alive and visible.             |
| 🎙️ **Pronunciation feedback**        | Speak a sentence and see how close you landed — practice the lines that need it.     |
| 📚 **Curated, rights-clear content** | Lessons are sourced from compliant, attributed material — never scraped junk.        |
| 🌗 **Light & dark, everywhere**      | One shared design system across web and mobile, with a light/dark toggle.            |

## 📱 One product, three surfaces

Soundwell is a **speaking-first English-learning ecosystem** — a single API powering a web
app, native mobile apps, and a marketing site.

- **Web app** — practice in the browser (`apps/web`).
- **Mobile app** — iOS & Android, same account and progress (`apps/mobile`).
- **Landing site** — the public marketing front door with SEO (`apps/landing`).

## 🏗️ How it's built

A **Turborepo + pnpm** monorepo. One API is the brain; every client shares the same
**contracts and learning logic — not UI**.

```
apps/
  api      NestJS 11 + TypeORM + Postgres — system of record (users, content, progress, streaks)
  web      Next.js 16 (App Router) — browser client
  mobile   Expo + Expo Router + Uniwind — iOS/Android client
  landing  Next.js 16 marketing site — Motion + SEO
packages/
  contracts  shared zod schemas + TS types (the api↔clients contract)
  core       pure learning logic (scoring rubrics, streak math, SRS)
  theme      centralized design tokens (light/dark) shared by web + landing
  crawler    compliant content ingestion (RSS/articles → normalized import JSON)
  seed-data  curated, committed content batches (lessons + vocab) for prod seeding
```

**Stack:** NestJS · TypeORM · PostgreSQL · Next.js 16 · React Query · Tailwind v4 · Expo ·
Uniwind · Motion · Zod · TypeScript end-to-end.

## 🚀 Getting started

Setup, run, migrations, and content seeding live in **[`docs/SETUP.md`](docs/SETUP.md)**.

```bash
pnpm install && pnpm db:up && pnpm dev
```

## 📖 Documentation

- **[Setup & local development](docs/SETUP.md)** — install, run, migrate, seed content.
- **[Product plan](docs/PLAN.md)** — vision, decisions, domain model, roadmap.
- **[Mobile app](docs/mobile/README.md)** — Expo/Obytes conventions.
