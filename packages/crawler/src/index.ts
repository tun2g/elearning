import { voaSource } from './sources/voa';
import type { Source } from './types';
import { writeBatch } from './lib/writer';

const SOURCES: Record<string, Source> = {
  voa: voaSource,
};

interface Args {
  source: string;
  limit: number;
  feed?: string;
  withAudio: boolean;
  out?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { source: 'voa', limit: 5, withAudio: true };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--source') args.source = argv[(i += 1)];
    else if (a === '--limit') args.limit = Number(argv[(i += 1)]);
    else if (a === '--feed') args.feed = argv[(i += 1)];
    else if (a === '--out') args.out = argv[(i += 1)];
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

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const source = SOURCES[args.source];
  if (!source) {
    console.error(`Unknown source "${args.source}". Available: ${Object.keys(SOURCES).join(', ')}`);
    process.exit(1);
  }

  console.log(`Source: ${source.name} — ${source.licence}`);
  console.log(`Limit: ${args.limit} · audio: ${args.withAudio ? 'on' : 'off'}\n`);

  const batch = await source.crawl({
    limit: args.limit,
    feedUrl: args.feed,
    withAudio: args.withAudio,
    log: (m) => console.log(`  ${m}`),
  });

  const runId = `${args.source}-${stamp()}`;
  const outPath = writeBatch(batch, runId, args.out);
  console.log(`\nWrote ${batch.lessons.length} lesson(s), ${batch.vocab.length} vocab → ${outPath}`);
  console.log('Review it, then import with: pnpm --filter @elearning/api seed:import');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
