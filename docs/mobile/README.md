# Mobile app — apps/mobile

The mobile app is the **Obytes React Native template v9** cloned at `apps/mobile/`
(expo 54, react-native 0.81.5, expo-router 6, `uniwind` for Tailwind, TanStack Query

- axios via `react-query-kit`, zustand, MMKV, i18n). The template is unmodified except
  for the workspace adaptations below.

## Workspace adaptations applied on top of the template

| Change                       | What                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`               | name → `@elearning/mobile`, packageManager synced, added `@elearning/contracts`, `@elearning/core`, `expo-speech`; removed `prepare: husky` |
| `env.ts`                     | bundle IDs / scheme / name rebranded to `com.elearning` / `elearning` / `Elearning`; removed demo vars                                      |
| `app.config.ts`              | slug → `elearning`; splash/adaptive-icon color → `#6c4add`; EAS project ID cleared                                                          |
| `metro.config.js`            | Added `watchFolders` + `nodeModulesPaths` for monorepo hoisting                                                                             |
| `.husky/`                    | Removed (root `.husky/` handles all git hooks)                                                                                              |
| `.env`                       | Set `EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1`                                                                                      |
| `src/app/(app)/_layout.tsx`  | Tabs: Lessons (Home icon) + Settings; Style tab hidden (`href: null`)                                                                       |
| `src/app/(app)/index.tsx`    | Points to `LessonsScreen` instead of template `FeedScreen`                                                                                  |
| `src/app/lessons/[slug].tsx` | New route — stack-pushes `PracticeScreen`                                                                                                   |
| `src/features/lessons/`      | New feature: `api.ts` (react-query-kit hooks), `lessons-screen.tsx`, `practice-screen.tsx`                                                  |
| `src/translations/en.json`   | Added `lessons.*` keys; updated onboarding message                                                                                          |

The feed, style-demo, and auth features from the template are **kept** (they are useful
example code and the auth store is still referenced by the tab layout).

## Setup

```bash
# from repo root
pnpm install
cp apps/mobile/.env.example apps/mobile/.env   # already done — .env is committed for dev
# On a physical device, replace localhost in .env with your machine's LAN IP
```

## Run

```bash
pnpm --filter @elearning/mobile start   # Expo Go / dev client
pnpm --filter @elearning/mobile ios     # iOS simulator
pnpm --filter @elearning/mobile android # Android emulator
```

## Vertical slice (Phase 0)

Lessons tab → `GET /lessons` list → tap → `GET /lessons/:slug` practice screen.
Each sentence has a ▶ button that reads it aloud via `expo-speech` (stand-in for native
audio). IPA + Vietnamese translation shown below. Check-mark marks practiced; progress
bar tracks session.

When the crawler phase (Phase 1) lands and `sentence.audioUrl` is populated, change the
`speak()` function in `practice-screen.tsx` to stream that URL instead of calling Speech.

## Feature structure

```
src/features/lessons/
  api.ts               react-query-kit hooks: useLessons, useLesson
  lessons-screen.tsx   FlashList of lesson cards → link to [slug]
  practice-screen.tsx  sentence-by-sentence practice with progress bar
src/app/lessons/
  [slug].tsx           Expo Router stack route → PracticeScreen
```
