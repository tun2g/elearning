import type { ImportBatch } from '@elearning/contracts';

/** Options passed to a source adapter for one crawl run. */
export interface RunContext {
  /** Max items (lessons) to produce. */
  limit: number;
  /** Source-specific feed/listing URL (overrides the adapter default). */
  feedUrl?: string;
  /** Whether to download + upload native audio (off → faster dry runs). */
  withAudio: boolean;
  log: (message: string) => void;
}

/**
 * A content source. Each adapter declares its own ToS/licence basis and is
 * responsible for respecting robots.txt + rate limits inside `crawl`.
 */
export interface Source {
  /** Stable id used on the CLI (e.g. `voa`). */
  name: string;
  /** Human description of the licence/ToS basis (printed before a run). */
  licence: string;
  /** Optional default feed URL when `--feed` is omitted. */
  defaultFeed?: string;
  crawl: (ctx: RunContext) => Promise<ImportBatch>;
}
