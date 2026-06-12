'use client';

import { motion } from 'motion/react';
import { Play, Sparkles, Star, Flame } from 'lucide-react';

import { ButtonLink } from '@/components/button';
import { Waveform } from '@/components/waveform';
import { site } from '@/lib/site';

const ease = [0.16, 1, 0.3, 1] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease, delay },
});

export function Hero() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-14 px-5 pb-20 pt-36 lg:flex-row lg:items-center lg:gap-8 lg:pb-28 lg:pt-44">
      {/* Copy */}
      <div className="flex-1 text-center lg:text-left">
        <motion.span
          {...rise(0)}
          className="ring-shimmer inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground"
        >
          <Sparkles size={15} className="text-primary" />
          Speaking-first English, by sound
        </motion.span>

        <motion.h1
          {...rise(0.08)}
          className="text-balance mt-6 font-display text-5xl font-semibold leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
        >
          Speak English with <span className="text-gradient-warm">confidence.</span>
        </motion.h1>

        <motion.p
          {...rise(0.16)}
          className="text-balance mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0"
        >
          Listen to native lines, shadow them out loud, and build a daily streak. Spaced-repetition vocabulary and
          pronunciation feedback turn minutes a day into real fluency.
        </motion.p>

        <motion.div {...rise(0.24)} className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
          <ButtonLink href={site.links.start} size="lg">
            Start free
            <Play size={16} className="fill-current" />
          </ButtonLink>
          <ButtonLink href="#how" variant="secondary" size="lg">
            See how it works
          </ButtonLink>
        </motion.div>

        <motion.div {...rise(0.32)} className="mt-8 flex items-center justify-center gap-4 lg:justify-start">
          <div className="flex -space-x-2.5">
            {['#3b82f6', '#4fa3f7', '#22d3ee', '#1d2b43'].map((c, i) => (
              <span key={i} className="h-9 w-9 rounded-full border-2 border-background" style={{ background: c }} />
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-0.5 text-accent-deep">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-current" />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Loved by 12,000+ daily learners</p>
          </div>
        </motion.div>
      </div>

      {/* Animated practice-card mock */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 1, ease, delay: 0.2 }}
        className="relative w-full max-w-sm flex-1 lg:max-w-md"
      >
        {/* glow */}
        <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary-soft via-accent-soft to-secondary-soft blur-2xl" />

        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary-deep">
              Everyday English · A2
            </span>
            <span className="text-xs font-medium text-subtle">3 / 8</span>
          </div>

          {/* play + waveform */}
          <div className="mt-6 flex items-center gap-4">
            <span className="relative inline-flex">
              <span className="absolute inset-0 rounded-full bg-primary/40 animate-[pulse-ring_2.4s_cubic-bezier(0.16,1,0.3,1)_infinite]" />
              <button
                aria-label="Play sentence"
                className="relative grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-[var(--shadow-primary)]"
              >
                <Play size={20} className="fill-current" />
              </button>
            </span>
            <Waveform className="h-10 flex-1 text-primary" />
          </div>

          <div className="mt-6">
            <p className="font-display text-2xl font-medium leading-snug text-foreground">
              “Could you say that again, please?”
            </p>
            <p className="mt-2 font-mono text-sm text-secondary-deep">/kʊd juː seɪ ðæt əˈɡen pliːz/</p>
            <p className="mt-1 text-sm text-subtle">Bạn có thể nói lại được không?</p>
          </div>

          <div className="mt-6 flex gap-2">
            {[
              { label: 'Again', cls: 'bg-primary-soft text-primary-deep' },
              { label: 'Hard', cls: 'bg-accent-soft text-accent-deep' },
              { label: 'Easy', cls: 'bg-secondary-soft text-secondary-deep' },
            ].map((b) => (
              <span key={b.label} className={`flex-1 rounded-full py-2.5 text-center text-sm font-semibold ${b.cls}`}>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* floating streak card */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-6 -top-5 flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-soft)]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft">
            <Flame size={18} className="text-primary" />
          </span>
          <div>
            <p className="text-lg font-bold leading-none text-foreground">12</p>
            <p className="text-[0.65rem] font-medium text-subtle">day streak</p>
          </div>
        </motion.div>

        {/* floating daily-goal card */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.6,
          }}
          className="absolute -bottom-6 -right-5 w-44 rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-muted-foreground">Daily goal</span>
            <span className="text-secondary-deep">80%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '80%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease, delay: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-secondary to-secondary-deep"
            />
          </div>
          <p className="mt-1.5 text-[0.65rem] text-subtle">16 / 20 sentences</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
