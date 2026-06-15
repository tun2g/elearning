'use client';

import type { Topic } from '@elearning/contracts';
import { ArrowUpRight, BookOpen, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import { Reveal, RevealGroup, RevealItem } from '@/components/ui/reveal';
import { Waveform } from '@/components/ui/waveform';

export interface CategoryGroup {
  slug: string;
  title: string;
  topics: Topic[];
}

export interface VocabCatalogContentProps {
  groups: CategoryGroup[];
  isLoading: boolean;
}

export function VocabCatalogContent({ groups, isLoading }: VocabCatalogContentProps) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-10">
      <Reveal>
        <header className="mb-6">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            <span className="text-gradient-warm">Vocabulary</span>
          </h1>
          <p className="mt-1.5 text-muted-foreground">Browse words by topic, or review what&apos;s due today.</p>
        </header>
      </Reveal>

      <Reveal delay={0.05}>
        <Link
          href="/vocab/review"
          className="group relative mb-8 flex items-center gap-4 overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary via-primary to-primary-deep p-5 text-white shadow-(--shadow-primary) transition-transform duration-300 hover:-translate-y-1"
        >
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-accent/40 blur-2xl" />
          <Waveform className="pointer-events-none absolute inset-x-5 bottom-2 h-5 text-white/20" bars={28} />
          <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur">
            <RefreshCw size={22} />
          </span>
          <div className="relative min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold leading-tight text-white">Daily review</h2>
            <p className="mt-0.5 text-sm text-white/80">Your due words plus a few new ones, spaced over time.</p>
          </div>
          <ArrowUpRight
            size={18}
            className="relative shrink-0 text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </Link>
      </Reveal>

      {isLoading && (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-24 animate-pulse rounded-3xl border border-border bg-card" />
          ))}
        </ul>
      )}

      {!isLoading &&
        groups.map((group) => (
          <section key={group.slug} className="mb-8">
            <Reveal>
              <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-subtle">
                {group.title}
              </h2>
            </Reveal>
            <RevealGroup className="grid gap-3 sm:grid-cols-2">
              {group.topics.map((topic) => (
                <RevealItem key={topic.id}>
                  <Link
                    href={`/vocab/topic/${topic.slug}`}
                    className="group flex h-full items-start gap-3 rounded-3xl border border-border bg-card p-4 shadow-(--shadow-soft) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-lift)"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary-soft text-secondary-deep">
                      <BookOpen size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base font-semibold leading-tight text-foreground">
                        {topic.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-subtle">
                        {topic.vocabCount} {topic.vocabCount === 1 ? 'word' : 'words'} · {topic.cefrLevel}
                      </p>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        ))}

      {!isLoading && groups.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border-strong p-8 text-center text-sm text-muted-foreground">
          No vocabulary yet. Run the API seed:{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">pnpm --filter @elearning/api seed</code>
        </div>
      )}
    </main>
  );
}
