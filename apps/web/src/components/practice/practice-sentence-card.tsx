'use client';

import type { PronunciationAssessment, Sentence } from '@elearning/contracts';
import { isPassing, PASS_SCORE } from '@elearning/core';
import { CheckCircle2, Loader2, Mic, RotateCcw, Sparkles, Square, Volume2 } from 'lucide-react';
import { useState } from 'react';

import { Waveform } from '@/components/ui/waveform';
import { useVoiceEvaluate, useVoiceTranscribe } from '@/hooks/use-practice';
import { cn } from '@/lib/utils';
import type { VoiceAttemptResult, VoiceTranscriptionResult, WordResult } from '@/services/practice';

import { useRecorder, type RecordingPayload } from './use-recorder';

function playAudio(url: string | null, text: string) {
  if (url) {
    new Audio(url).play().catch(() => undefined);
    return;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
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
          onClick={() => playAudio(nativeUrl, '')}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary-deep transition-colors hover:border-primary"
        >
          <Volume2 size={13} /> Native
        </button>
      )}
      {recordingUrl && (
        <button
          onClick={() => playAudio(recordingUrl, '')}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-accent-deep transition-colors hover:border-accent"
        >
          <Volume2 size={13} /> You
        </button>
      )}
    </div>
  );
}

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
    <div className="mt-4 rounded-2xl border border-border bg-card/70 p-4 text-left">
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
        {evaluating ? 'Scoring…' : 'Check my pronunciation'}
      </button>
      {evaluateError && (
        <p className="mt-2 text-xs text-primary">Couldn’t score your speaking right now. Please try again.</p>
      )}
    </div>
  );
}

function Feedback({
  assessment,
  recordingUrl,
  nativeUrl,
}: {
  assessment: PronunciationAssessment;
  recordingUrl: string | null;
  nativeUrl: string | null;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-border bg-card/70 p-4 text-left">
      <p className="text-base leading-relaxed">
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

function PassBanner({ overall }: { overall: number }) {
  const passed = isPassing(overall);
  return (
    <div
      className={cn(
        'mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-left',
        passed ? 'border-secondary/40 bg-secondary-soft/50' : 'border-primary/30 bg-primary-soft/40'
      )}
    >
      <span className={cn('font-display text-2xl font-bold tabular-nums', scoreTint(overall))}>{overall}</span>
      <div className="min-w-0 flex-1">
        {passed ? (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-secondary-deep">
            <CheckCircle2 size={15} /> Passed — you can continue
          </p>
        ) : (
          <p className="text-sm font-semibold text-primary-deep">
            Almost — reach {PASS_SCORE} to pass. Listen again and retry.
          </p>
        )}
      </div>
    </div>
  );
}

export interface PracticeSentenceCardProps {
  sentence: Sentence;
  /** Fired when the learner's recording has been scored. */
  onResult: (sentenceId: string, assessment: PronunciationAssessment) => void;
}

export function PracticeSentenceCard({ sentence, onResult }: PracticeSentenceCardProps) {
  const recorder = useRecorder();
  const transcribe = useVoiceTranscribe();
  const evaluate = useVoiceEvaluate();
  const [payload, setPayload] = useState<RecordingPayload | null>(null);
  const [transcript, setTranscript] = useState<VoiceTranscriptionResult | null>(null);
  const [result, setResult] = useState<VoiceAttemptResult | null>(null);
  const [playing, setPlaying] = useState(false);

  const onListen = () => {
    playAudio(sentence.audioUrl, sentence.text);
    setPlaying(true);
    window.setTimeout(() => setPlaying(false), 1500);
  };

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

  const checkPronunciation = async () => {
    if (!payload || !transcript) return;
    try {
      const res = await evaluate.mutateAsync({ attemptId: transcript.attemptId, sentenceId: sentence.id, ...payload });
      setResult(res);
      onResult(sentence.id, res.assessment);
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
  const recording = recorder.status === 'recording';

  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-(--shadow-lift) sm:p-8">
      <Waveform playing={false} bars={20} className="mx-auto mb-5 h-4 w-28 text-primary/25" />
      <p className="font-display text-2xl font-semibold leading-snug text-foreground sm:text-3xl">{sentence.text}</p>
      {sentence.ipa && <p className="mt-2 font-mono text-base text-secondary-deep">{sentence.ipa}</p>}
      {sentence.translation && <p className="mt-1.5 text-sm text-subtle">{sentence.translation}</p>}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onListen}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-primary) transition-transform hover:scale-105 active:scale-95"
        >
          <Volume2 size={16} /> Listen
        </button>

        {recording ? (
          <button
            onClick={stopAndTranscribe}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-(--shadow-primary)"
          >
            <Square size={16} /> Stop
          </button>
        ) : (
          <button
            onClick={recorder.start}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-secondary-deep transition-colors hover:border-secondary disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
            {busy ? 'Transcribing…' : 'Speak'}
          </button>
        )}

        {(playing || recording) && <Waveform className="h-5 w-20 text-primary" />}
      </div>

      {recorder.error && <p className="mt-3 text-xs text-primary">{recorder.error}</p>}
      {transcribe.isError && (
        <p className="mt-3 text-xs text-primary">Couldn’t transcribe your speaking right now. Please try again.</p>
      )}

      {transcript && (
        <>
          {result ? (
            <>
              <PassBanner overall={result.assessment.overall} />
              <Feedback assessment={result.assessment} recordingUrl={recorder.audioUrl} nativeUrl={sentence.audioUrl} />
            </>
          ) : (
            <TranscriptionCard
              transcript={transcript}
              recordingUrl={recorder.audioUrl}
              nativeUrl={sentence.audioUrl}
              onEvaluate={checkPronunciation}
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
  );
}
