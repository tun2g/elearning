'use client';

import type { Sentence } from '@elearning/contracts';
import { Loader2, Mic, RotateCcw, Sparkles, Square, Volume2 } from 'lucide-react';
import { useState } from 'react';

import { Waveform } from '@/components/ui/waveform';
import { useVoiceEvaluate, useVoiceTranscribe } from '@/hooks/use-practice';
import { useRecorder, type RecordingPayload } from './use-recorder';
import type { VoiceAttemptResult, VoiceTranscriptionResult, WordResult } from '@/services/practice';
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

function PlaybackButtons({ recordingUrl, nativeUrl }: { recordingUrl: string | null; nativeUrl: string | null }) {
  return (
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
  );
}

/** Step 1 result: what the learner said, with a button to request the AI evaluation. */
function TranscriptionCard({
  transcript,
  recordingUrl,
  nativeUrl,
  onEvaluate,
  evaluating,
  evaluateError,
}: {
  transcript: VoiceTranscriptionResult;
  recordingUrl: string | null;
  nativeUrl: string | null;
  onEvaluate: () => void;
  evaluating: boolean;
  evaluateError: boolean;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card/70 p-4">
      <p className="text-base leading-relaxed">
        <span className="text-muted-foreground">You said:</span> “{transcript.transcription || '—'}”
      </p>

      <PlaybackButtons recordingUrl={recordingUrl} nativeUrl={nativeUrl} />

      <button
        onClick={onEvaluate}
        disabled={evaluating}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-soft) transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
      >
        {evaluating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
        {evaluating ? 'Evaluating…' : 'See feedback'}
      </button>
      {evaluateError && (
        <p className="mt-2 text-xs text-primary">Couldn’t evaluate your speaking right now. Please try again.</p>
      )}
    </div>
  );
}

/** Step 2 result: the full pronunciation evaluation. */
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

      <PlaybackButtons recordingUrl={recordingUrl} nativeUrl={nativeUrl} />
    </div>
  );
}

function VoiceSentenceCard({ sentence }: { sentence: Sentence }) {
  const recorder = useRecorder();
  const transcribe = useVoiceTranscribe();
  const evaluate = useVoiceEvaluate();
  const [payload, setPayload] = useState<RecordingPayload | null>(null);
  const [transcript, setTranscript] = useState<VoiceTranscriptionResult | null>(null);
  const [result, setResult] = useState<VoiceAttemptResult | null>(null);

  const stopAndTranscribe = async () => {
    const p = await recorder.stop();
    if (!p) return;
    setPayload(p);
    try {
      const res = await transcribe.mutateAsync({ sentenceId: sentence.id, ...p });
      setTranscript(res);
    } catch {
      // error surfaced via transcribe.isError below
    }
  };

  const seeFeedback = async () => {
    if (!payload || !transcript) return;
    try {
      const res = await evaluate.mutateAsync({
        attemptId: transcript.attemptId,
        sentenceId: sentence.id,
        ...payload,
      });
      setResult(res);
    } catch {
      // error surfaced via evaluate.isError below
    }
  };

  const retry = () => {
    setPayload(null);
    setTranscript(null);
    setResult(null);
    transcribe.reset();
    evaluate.reset();
    recorder.reset();
  };

  const busy = transcribe.isPending;

  return (
    <li className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-soft)">
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

          {!transcript && (
            <div className="mt-4 flex items-center gap-3">
              {recorder.status === 'recording' ? (
                <button
                  onClick={stopAndTranscribe}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-primary)"
                >
                  <Square size={15} /> Stop
                </button>
              ) : (
                <button
                  onClick={recorder.start}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-(--shadow-primary) transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                >
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Mic size={15} />}
                  {busy ? 'Transcribing…' : 'Speak'}
                </button>
              )}
              {recorder.status === 'recording' && <Waveform className="h-5 w-24 text-primary" />}
              {recorder.error && <span className="text-xs text-primary">{recorder.error}</span>}
              {transcribe.isError && (
                <span className="text-xs text-primary">
                  Couldn’t transcribe your speaking right now. Please try again.
                </span>
              )}
            </div>
          )}

          {transcript && (
            <>
              {result ? (
                <Feedback result={result} recordingUrl={recorder.audioUrl} nativeUrl={sentence.audioUrl} />
              ) : (
                <TranscriptionCard
                  transcript={transcript}
                  recordingUrl={recorder.audioUrl}
                  nativeUrl={sentence.audioUrl}
                  onEvaluate={seeFeedback}
                  evaluating={evaluate.isPending}
                  evaluateError={evaluate.isError}
                />
              )}
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
