'use client';

import type { Sentence } from '@elearning/contracts';
import { Loader2, Mic, RotateCcw, Square, Volume2 } from 'lucide-react';
import { useState } from 'react';

import { Waveform } from '@/components/ui/waveform';
import { useVoiceAttempt } from '@/hooks/use-practice';
import { useRecorder } from './use-recorder';
import type { VoiceAttemptResult, WordResult } from '@/services/practice';
import { cn } from '@/lib/utils';

function play(url: string | null) {
  if (url) new Audio(url).play().catch(() => undefined);
}

function scoreTint(overall: number): string {
  if (overall >= 85) return 'text-secondary-deep';
  if (overall >= 60) return 'text-accent-deep';
  return 'text-primary';
}

function Word({ word }: { word: WordResult }) {
  if (word.status === 'omitted') {
    return <span className="text-subtle line-through decoration-subtle/50">{word.text} </span>;
  }
  if (word.status === 'inserted') {
    return <span className="italic text-accent-deep">+{word.text} </span>;
  }
  if (word.status === 'substituted') {
    return (
      <span
        className="font-semibold text-primary underline decoration-primary/40 underline-offset-2"
        title={word.heardAs ? `heard: ${word.heardAs}` : undefined}
      >
        {word.text}{' '}
      </span>
    );
  }
  return <span className="text-foreground">{word.text} </span>;
}

function Feedback({
  result,
  recordingUrl,
  nativeUrl,
}: {
  result: VoiceAttemptResult;
  recordingUrl: string | null;
  nativeUrl: string | null;
}) {
  const { assessment } = result;
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card/70 p-4">
      <div className="flex items-baseline gap-2">
        <span className={cn('font-display text-3xl font-bold tabular-nums', scoreTint(assessment.overall))}>
          {assessment.overall}
        </span>
        <span className="text-xs font-medium text-muted-foreground">/ 100 pronunciation</span>
      </div>

      <p className="mt-3 text-base leading-relaxed">
        {assessment.words.map((w, i) => (
          <Word key={i} word={w} />
        ))}
      </p>

      <p className="mt-2 text-sm text-subtle">
        <span className="text-muted-foreground">You said:</span> “{assessment.transcription || '—'}”
      </p>

      {assessment.coachingNote && (
        <p className="mt-2 rounded-xl bg-secondary-soft/40 px-3 py-2 text-sm text-secondary-deep">
          {assessment.coachingNote}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {nativeUrl && (
          <button
            onClick={() => play(nativeUrl)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary-deep transition-colors hover:border-primary"
          >
            <Volume2 size={13} /> Native
          </button>
        )}
        {recordingUrl && (
          <button
            onClick={() => play(recordingUrl)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-accent-deep transition-colors hover:border-accent"
          >
            <Volume2 size={13} /> You
          </button>
        )}
      </div>
    </div>
  );
}

function VoiceSentenceCard({ sentence }: { sentence: Sentence }) {
  const recorder = useRecorder();
  const voice = useVoiceAttempt();
  const [result, setResult] = useState<VoiceAttemptResult | null>(null);

  const evaluate = async () => {
    const payload = await recorder.stop();
    if (!payload) return;
    try {
      const res = await voice.mutateAsync({ sentenceId: sentence.id, ...payload });
      setResult(res);
    } catch {
      // error surfaced via voice.isError below
    }
  };

  const retry = () => {
    setResult(null);
    voice.reset();
    recorder.reset();
  };

  const busy = voice.isPending;

  return (
    <li className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start gap-4">
        <button
          onClick={() => play(sentence.audioUrl)}
          aria-label="Play native audio"
          className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform hover:scale-105 active:scale-95"
        >
          <Volume2 size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-medium leading-snug text-foreground">{sentence.text}</p>
          {sentence.ipa && <p className="mt-1 font-mono text-sm text-secondary-deep">{sentence.ipa}</p>}

          {!result && (
            <div className="mt-4 flex items-center gap-3">
              {recorder.status === 'recording' ? (
                <button
                  onClick={evaluate}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-primary)]"
                >
                  <Square size={15} /> Stop &amp; check
                </button>
              ) : (
                <button
                  onClick={recorder.start}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-primary)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                >
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Mic size={15} />}
                  {busy ? 'Analyzing…' : 'Speak'}
                </button>
              )}
              {recorder.status === 'recording' && <Waveform className="h-5 w-24 text-primary" />}
              {recorder.error && <span className="text-xs text-primary">{recorder.error}</span>}
              {voice.isError && (
                <span className="text-xs text-primary">Couldn’t check your speaking right now. Please try again.</span>
              )}
            </div>
          )}

          {result && (
            <>
              <Feedback result={result} recordingUrl={recorder.audioUrl} nativeUrl={sentence.audioUrl} />
              <button
                onClick={retry}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                <RotateCcw size={14} /> Try again
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}

export function VoicePracticeList({ sentences }: { sentences: Sentence[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {sentences.map((s) => (
        <VoiceSentenceCard key={s.id} sentence={s} />
      ))}
    </ol>
  );
}
