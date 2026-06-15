'use client';

import type { LeaderboardEntry } from '@elearning/contracts';
import { Trophy } from 'lucide-react';

import { CountUp } from '@/components/ui/count-up';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';

export interface LeaderboardContentProps {
  entries?: LeaderboardEntry[];
  isLoading: boolean;
  isError: boolean;
  hasToken: boolean;
  currentUserId?: string;
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function SkeletonRow() {
  return <div className="h-16 animate-pulse rounded-2xl border border-border bg-card" />;
}

export function LeaderboardContent({ entries, isLoading, isError, hasToken, currentUserId }: LeaderboardContentProps) {
  if (isLoading || !hasToken) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-24 animate-pulse rounded-3xl border border-border bg-card" />
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (isError || !entries) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load the leaderboard. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary-deep">
            <Trophy size={22} />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Weekly <span className="text-gradient-warm">leaderboard</span>
            </h1>
            <p className="text-sm text-muted-foreground">Top speakers by XP earned this week</p>
          </div>
        </header>
      </Reveal>

      {entries.length === 0 ? (
        <Reveal delay={0.05}>
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No XP earned yet this week. Be the first on the board! 🎧</p>
          </div>
        </Reveal>
      ) : (
        <RevealGroup className="flex flex-col gap-2.5">
          {entries.map((entry) => {
            const isMe = entry.userId === currentUserId;
            return (
              <RevealItem key={entry.userId}>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border p-3.5 transition-colors',
                    isMe ? 'border-primary bg-primary-soft shadow-(--shadow-lift)' : 'border-border bg-card'
                  )}
                >
                  <span className="grid w-8 shrink-0 place-items-center text-lg font-semibold tabular-nums text-muted-foreground">
                    {MEDALS[entry.rank] ?? entry.rank}
                  </span>

                  {entry.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={entry.avatarUrl}
                      alt={entry.displayName}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {initials(entry.displayName)}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {entry.displayName}
                      {isMe && <span className="ml-1.5 text-xs font-normal text-primary-deep">· You</span>}
                    </p>
                  </div>

                  <span className="shrink-0 font-display text-base font-semibold tabular-nums text-foreground">
                    <CountUp value={entry.xpThisWeek} /> XP
                  </span>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}
    </div>
  );
}
