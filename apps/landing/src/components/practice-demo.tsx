'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Play, RotateCcw, Volume2 } from 'lucide-react';
import { useState } from 'react';

import { Waveform } from '@/components/waveform';
import { cn } from '@/lib/cn';

interface Line {
  text: string;
  ipa: string;
  vn: string;
}

const LINES: Line[] = [
  {
    text: 'Nice to meet you.',
    ipa: '/naɪs tə miːt juː/',
    vn: 'Rất vui được gặp bạn.',
  },
  {
    text: 'What do you do for work?',
    ipa: '/wɒt də juː duː fə wɜːk/',
    vn: 'Bạn làm nghề gì?',
  },
  {
    text: 'Could you speak more slowly?',
    ipa: '/kʊd juː spiːk mɔː ˈsləʊli/',
    vn: 'Bạn có thể nói chậm hơn không?',
  },
];

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

const CHIPS = [
  { label: 'Again', cls: 'bg-primary-soft text-primary-deep hover:bg-primary hover:text-white' },
  { label: 'Hard', cls: 'bg-accent-soft text-accent-deep hover:bg-accent hover:text-white' },
  { label: 'Easy', cls: 'bg-secondary-soft text-secondary-deep hover:bg-secondary hover:text-white' },
];

export function PracticeDemo() {
  const [index, setIndex] = useState(0);
  const [played, setPlayed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(0);

  const line = LINES[index];
  const progress = Math.round((done / LINES.length) * 100);

  const play = () => {
    speak(line.text);
    setPlayed(true);
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 1400);
  };

  const assess = () => {
    setPlayed(false);
    setDone((d) => Math.min(d + 1, LINES.length));
    setIndex((i) => (i + 1) % LINES.length);
  };

  const reset = () => {
    setIndex(0);
    setPlayed(false);
    setDone(0);
  };

  return (
    <div className="relative">
      <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-secondary-soft via-card to-primary-soft blur-2xl" />
      <div className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-lift)] sm:p-7">
        <div className="flex items-center justify-between text-xs font-medium text-subtle">
          <span className="inline-flex items-center gap-1.5">
            <Volume2 size={14} className="text-primary" /> Try a real card
          </span>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors hover:text-foreground"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${progress}%` }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
          />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="relative inline-flex">
            {playing && (
              <span className="absolute inset-0 rounded-full bg-primary/40 animate-[pulse-ring_1.4s_ease-out_infinite]" />
            )}
            <button
              onClick={play}
              aria-label="Play sentence"
              className="relative grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-[var(--shadow-primary)] transition-transform hover:scale-105 active:scale-95"
            >
              <Play size={20} className="fill-current" />
            </button>
          </span>
          <Waveform className="h-9 flex-1 text-primary" playing={playing} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="mt-6"
          >
            <p className="font-display text-2xl font-medium leading-snug text-foreground">“{line.text}”</p>
            <p className="mt-2 font-mono text-sm text-secondary-deep">{line.ipa}</p>
            <p className="mt-1 text-sm text-subtle">{line.vn}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 min-h-[3rem]">
          <AnimatePresence mode="wait">
            {played ? (
              <motion.div
                key="chips"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-2"
              >
                {CHIPS.map((c) => (
                  <button
                    key={c.label}
                    onClick={assess}
                    className={cn('flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors', c.cls)}
                  >
                    {c.label}
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pt-3 text-center text-sm text-subtle"
              >
                Press play, say it out loud, then rate yourself ↑
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
