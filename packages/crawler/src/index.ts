import type { ImportBatch } from '@elearning/contracts';

import { writeBatch } from './lib/writer';
import { tatoebaSource } from './sources/tatoeba';
import { voaSource } from './sources/voa';
import { PILOT_TOPICS, planForAll, planForTopic } from './topic-plan';
import type { Source } from './types';

const SOURCES: Record<string, Source> = {
  voa: voaSource,
  tatoeba: tatoebaSource,
};

// Per-topic quality gate (matches the plan's pilot acceptance bar).
const GATE_MIN_VOCAB = 5;

interface Args {
  source: string;
  limit: number;
  topic?: string;
  pilot: boolean;
  all: boolean;
  feed?: string;
  withAudio: boolean;
  out?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { source: 'tatoeba', limit: 12, pilot: false, all: false, withAudio: true };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--source') args.source = argv[(i += 1)];
    else if (a === '--limit') args.limit = Number(argv[(i += 1)]);
    else if (a === '--topic') args.topic = argv[(i += 1)];
    else if (a === '--feed') args.feed = argv[(i += 1)];
    else if (a === '--out') args.out = argv[(i += 1)];
    else if (a === '--pilot') args.pilot = true;
    else if (a === '--all') args.all = true;
    else if (a === '--no-audio') args.withAudio = false;
  }
  return args;
}

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

function targetSlugs(args: Args): string[] {
  if (args.topic) return [args.topic];
  if (args.pilot) return PILOT_TOPICS;
  if (args.all) return planForAll().map((p) => p.topicSlug);
  return [];
}

interface Coverage {
  topicSlug: string;
  lessons: number;
  vocab: number;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const source = SOURCES[args.source];
  if (!source) {
    console.error(`Unknown source "${args.source}". Available: ${Object.keys(SOURCES).join(', ')}`);
    process.exit(1);
  }

  const slugs = targetSlugs(args);
  if (slugs.length === 0) {
    console.error('No topics targeted. Pass one of: --topic <slug> | --pilot | --all');
    process.exit(1);
  }

  console.log(`Source: ${source.name} — ${source.licence}`);
  console.log(`Topics: ${slugs.length} · limit/topic: ${args.limit} · audio: ${args.withAudio ? 'on' : 'off'}\n`);

  const merged: ImportBatch = { lessons: [], vocab: [] };
  const coverage: Coverage[] = [];

  for (const slug of slugs) {
    const plan = planForTopic(slug);
    console.log(`▸ ${slug}`);
    try {
      const batch = await source.crawl({
        limit: args.limit,
        feedUrl: args.feed,
        withAudio: args.withAudio,
        plan,
        log: (m) => console.log(`    ${m}`),
      });
      merged.lessons.push(...batch.lessons);
      merged.vocab.push(...batch.vocab);
      coverage.push({ topicSlug: slug, lessons: batch.lessons.length, vocab: batch.vocab.length });
    } catch (err) {
      console.error(`    error: ${(err as Error).message}`);
      coverage.push({ topicSlug: slug, lessons: 0, vocab: 0 });
    }
  }

  const runId = `${args.source}-${args.topic ?? (args.pilot ? 'pilot' : 'all')}-${stamp()}`;
  const outPath = writeBatch(merged, runId, args.out);

  // Coverage report — surface topics that fall short of the quality gate.
  const short = coverage.filter((c) => c.lessons < 1 || c.vocab < GATE_MIN_VOCAB);
  console.log(`\n── Coverage ──`);
  for (const c of coverage) {
    const flag = c.lessons < 1 || c.vocab < GATE_MIN_VOCAB ? '  ✗' : '  ✓';
    console.log(`${flag} ${c.topicSlug}: ${c.lessons} lesson(s), ${c.vocab} vocab`);
  }
  console.log(
    `\n${coverage.length - short.length}/${coverage.length} topics met the gate ` +
      `(≥1 lesson, ≥${GATE_MIN_VOCAB} vocab).`
  );
  if (short.length) {
    console.log(`Below gate (${short.length}): ${short.map((c) => c.topicSlug).join(', ')}`);
  }

  console.log(`\nWrote ${merged.lessons.length} lesson(s), ${merged.vocab.length} vocab → ${outPath}`);
  console.log('Review it, then import with: pnpm --filter @elearning/api seed:import');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
