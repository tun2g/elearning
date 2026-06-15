'use client';

import { ArrowRight, Flame, Layers, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';

import { ButtonLink } from '@/components/ui/button';
import { CountUp } from '@/components/ui/count-up';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/reveal';
import { Waveform } from '@/components/ui/waveform';
import type { HomeData } from '@/services/home';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-3xl border border-border bg-card ${className}`} />;
}

export interface HomeContentProps {
  data?: HomeData;
  isLoading: boolean;
  isError: boolean;
  hasToken: boolean;
}

export function HomeContent({ data, isLoading, isError, hasToken }: HomeContentProps) {
  if (isLoading || !hasToken) {
    return (
      <div className="flex flex-col gap-5">
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-28" />
        <SkeletonCard className="h-24" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Couldn’t load your home data. Please try again.</p>
      </div>
    );
  }

  const { streak, dailyGoal, recommendedLesson, recentXp } = data;

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <header>
          <p className="text-sm font-medium text-muted-foreground">{greeting()} 👋</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground">
            Ready to <span className="text-gradient-warm">speak</span>?
          </h1>
        </header>
      </Reveal>

      {/* Up next — the one clear action on arrival */}
      <Reveal delay={0.02}>
        {recommendedLesson ? (
          <Link
            href={`/lessons/${recommendedLesson.slug}`}
            className="ring-shimmer group block rounded-3xl p-6 shadow-(--shadow-soft) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-lift)"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-deep">
                {recommendedLesson.completionPct > 0 ? 'Pick up where you left off' : 'Start here'}
              </p>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                {recommendedLesson.level}
              </span>
            </div>
            <p className="mt-2 font-display text-xl font-semibold text-foreground">{recommendedLesson.title}</p>
            {recommendedLesson.completionPct > 0 && (
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-primary to-accent transition-[width] duration-700"
                    style={{ width: `${recommendedLesson.completionPct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {recommendedLesson.completionPct}%
                </span>
              </div>
            )}
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-primary) transition-transform group-hover:scale-[1.02]">
              {recommendedLesson.completionPct > 0 ? 'Continue' : 'Start lesson'}
              <ArrowRight size={16} />
            </span>
          </Link>
        ) : (
          <Link
            href="/vocab/review"
            className="ring-shimmer group block rounded-3xl p-6 shadow-(--shadow-soft) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-lift)"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-deep">All caught up</p>
            <p className="mt-2 font-display text-xl font-semibold text-foreground">Review your vocabulary</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You’ve started every lesson — keep your words sharp with a quick review.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-primary) transition-transform group-hover:scale-[1.02]">
              Review now
              <ArrowRight size={16} />
            </span>
          </Link>
        )}
      </Reveal>

      {/* Streak hero */}
      <Reveal delay={0.05}>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary via-primary to-primary-deep p-6 text-white shadow-(--shadow-lift)">
          <div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-accent/40 blur-2xl" />
          <Waveform
            className="pointer-events-none absolute inset-x-6 bottom-3 h-6 text-white/20"
            playing={streak.isAlive}
            bars={32}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">{streak.isAlive ? 'Streak alive' : 'Streak paused'}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <CountUp value={streak.currentStreak} className="font-display text-5xl font-semibold leading-none" />
                <span className="text-lg font-medium text-white/80">day{streak.currentStreak === 1 ? '' : 's'}</span>
              </div>
              <p className="mt-2 text-xs text-white/70">Longest streak · {streak.longestStreak} days</p>
            </div>
            <span className="grid h-16 w-16 animate-[float_11s_ease-in-out_infinite] place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Flame size={32} className="text-white" />
            </span>
          </div>
        </div>
      </Reveal>

      {/* Daily goal */}
      <Reveal delay={0.1}>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-(--shadow-soft)">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-accent-deep" />
              <p className="font-semibold text-foreground">Daily goal</p>
            </div>
            <p className="text-sm text-muted-foreground">
              <CountUp value={dailyGoal.completedSentences} /> / {dailyGoal.targetSentences} sentences
            </p>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-linear-to-r from-secondary to-secondary-deep transition-[width] duration-700 ease-out-soft"
              style={{ width: `${dailyGoal.percentage}%` }}
            />
          </div>
          {dailyGoal.completed ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-secondary-deep">
              <Sparkles size={15} /> Goal complete for today!
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {dailyGoal.targetSentences - dailyGoal.completedSentences} to go — you’ve got this.
            </p>
          )}
        </div>
      </Reveal>

      {/* Quick actions */}
      <RevealGroup className="grid grid-cols-2 gap-3">
        <RevealItem>
          <Link
            href="/lessons"
            data-tour="practice"
            className="group flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-lift)"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary-deep">
              <Sparkles size={20} />
            </span>
            <span className="mt-4 flex items-center justify-between font-semibold text-foreground">
              Practice
              <ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </RevealItem>
        <RevealItem>
          <Link
            href="/vocab/review"
            className="group flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft) transition-all duration-300 hover:-translate-y-1 hover:shadow-(--shadow-lift)"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary-soft text-secondary-deep">
              <Layers size={20} />
            </span>
            <span className="mt-4 flex items-center justify-between font-semibold text-foreground">
              Review
              <ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </RevealItem>
      </RevealGroup>

      {/* Recent XP */}
      {recentXp.length > 0 && (
        <Reveal delay={0.05}>
          <div className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft)">
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Recent XP</p>
            <ul className="flex flex-col divide-y divide-border">
              {recentXp.map((e, i) => (
                <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="capitalize text-foreground">{e.sourceType.replace(/_/g, ' ')}</span>
                  <span className="font-semibold text-primary-deep">+{e.amount} XP</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}

      <ButtonLink href="/lessons" variant="ghost" className="mx-auto">
        Browse all lessons
        <ArrowRight size={16} />
      </ButtonLink>
    </div>
  );
}
