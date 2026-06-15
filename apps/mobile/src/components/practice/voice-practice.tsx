import type { Sentence, VoiceAttemptResult, VoiceTranscriptionResult, WordResult } from '@elearning/contracts';
import type { RecordingPayload } from './use-recorder';
import { createAudioPlayer } from 'expo-audio';
import * as React from 'react';

import { ActivityIndicator } from 'react-native';

import { Pressable, Text, View } from '@/components/ui';
import { useVoiceEvaluate, useVoiceTranscribe } from '@/hooks/use-lessons';
import { useRecorder } from './use-recorder';

function play(uri: string | null) {
  if (!uri)
    return;
  try {
    createAudioPlayer(uri).play();
  }
  catch {
    // ignore playback errors
  }
}

function scoreTint(overall: number): string {
  if (overall >= 85)
    return 'text-secondary-500';
  if (overall >= 60)
    return 'text-accent-500';
  return 'text-primary-500';
}

function Word({ word }: { word: WordResult }) {
  if (word.status === 'omitted') {
    return (
      <Text className="text-neutral-400 line-through">
        {word.text}
        {' '}
      </Text>
    );
  }
  if (word.status === 'inserted')
    return <Text className="text-accent-600 italic">{`+${word.text} `}</Text>;
  if (word.status === 'substituted') {
    return (
      <Text className="font-semibold text-primary-500 underline">
        {word.text}
        {' '}
      </Text>
    );
  }
  return (
    <Text className="text-neutral-800 dark:text-neutral-100">
      {word.text}
      {' '}
    </Text>
  );
}

function PlaybackButtons({ recordingUri, nativeUrl }: { recordingUri: string | null; nativeUrl: string | null }) {
  return (
    <View className="mt-3 flex-row gap-2">
      {nativeUrl
        ? (
            <Pressable
              onPress={() => play(nativeUrl)}
              className="rounded-full border border-neutral-300 px-3 py-1.5 dark:border-neutral-600"
            >
              <Text className="text-xs font-semibold text-primary-500">▶ Native</Text>
            </Pressable>
          )
        : null}
      {recordingUri
        ? (
            <Pressable
              onPress={() => play(recordingUri)}
              className="rounded-full border border-neutral-300 px-3 py-1.5 dark:border-neutral-600"
            >
              <Text className="text-xs font-semibold text-accent-600">▶ You</Text>
            </Pressable>
          )
        : null}
    </View>
  );
}

function TranscriptionCard({
  transcript,
  recordingUri,
  nativeUrl,
  onEvaluate,
  evaluating,
  evaluateError,
}: {
  transcript: VoiceTranscriptionResult;
  recordingUri: string | null;
  nativeUrl: string | null;
  onEvaluate: () => void;
  evaluating: boolean;
  evaluateError: boolean;
}) {
  return (
    <View className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      <Text className="text-base/relaxed text-neutral-800 dark:text-neutral-100">
        You said: “
        {transcript.transcription || '—'}
        ”
      </Text>

      <PlaybackButtons recordingUri={recordingUri} nativeUrl={nativeUrl} />

      <Pressable
        onPress={onEvaluate}
        disabled={evaluating}
        className={`mt-3 flex-row items-center self-start rounded-full bg-secondary-500 px-4 py-2 ${evaluating ? 'opacity-60' : ''}`}
      >
        {evaluating
          ? <ActivityIndicator size="small" color="#fff" />
          : <Text className="text-sm font-semibold text-white">✨ See feedback</Text>}
      </Pressable>
      {evaluateError
        ? (
            <Text className="mt-2 text-xs text-primary-500">
              Couldn’t evaluate your speaking right now. Please try again.
            </Text>
          )
        : null}
    </View>
  );
}

function Feedback({
  result,
  recordingUri,
  nativeUrl,
}: {
  result: VoiceAttemptResult;
  recordingUri: string | null;
  nativeUrl: string | null;
}) {
  const { assessment } = result;
  return (
    <View className="mt-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      <View className="flex-row items-baseline gap-1.5">
        <Text className={`text-3xl font-bold ${scoreTint(assessment.overall)}`}>
          {assessment.overall}
        </Text>
        <Text className="text-xs text-neutral-500">/ 100 pronunciation</Text>
      </View>

      <Text className="mt-3 text-base/relaxed">
        {assessment.words.map((w, i) => (
          <Word key={i} word={w} />
        ))}
      </Text>

      <Text className="mt-2 text-sm text-neutral-500">
        You said: “
        {assessment.transcription || '—'}
        ”
      </Text>

      {assessment.coachingNote
        ? (
            <Text className="mt-2 rounded-xl bg-secondary-500/10 px-3 py-2 text-sm text-secondary-600">
              {assessment.coachingNote}
            </Text>
          )
        : null}

      <PlaybackButtons recordingUri={recordingUri} nativeUrl={nativeUrl} />
    </View>
  );
}

function RecordControls({
  recorder,
  transcribe,
  onStop,
}: {
  recorder: ReturnType<typeof useRecorder>;
  transcribe: ReturnType<typeof useVoiceTranscribe>;
  onStop: () => void;
}) {
  return (
    <View className="mt-4 flex-row items-center gap-3">
      {recorder.status === 'recording'
        ? (
            <Pressable
              onPress={onStop}
              className="flex-row items-center rounded-full bg-primary-500 px-4 py-2"
            >
              <Text className="text-sm font-semibold text-white">■ Stop</Text>
            </Pressable>
          )
        : (
            <Pressable
              onPress={recorder.start}
              disabled={transcribe.isPending}
              className={`flex-row items-center rounded-full bg-primary-500 px-4 py-2 ${transcribe.isPending ? 'opacity-60' : ''}`}
            >
              {transcribe.isPending
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text className="text-sm font-semibold text-white">● Speak</Text>}
            </Pressable>
          )}
      {transcribe.isPending
        ? <Text className="text-sm text-neutral-500">Transcribing…</Text>
        : null}
      {recorder.error
        ? <Text className="text-xs text-primary-500">{recorder.error}</Text>
        : null}
      {transcribe.isError
        ? (
            <Text className="text-xs text-primary-500">
              Couldn’t transcribe your speaking right now. Please try again.
            </Text>
          )
        : null}
    </View>
  );
}

function VoiceSentenceCard({ sentence }: { sentence: Sentence }) {
  const recorder = useRecorder();
  const transcribe = useVoiceTranscribe();
  const evaluate = useVoiceEvaluate();
  const [payload, setPayload] = React.useState<RecordingPayload | null>(null);
  const [transcript, setTranscript] = React.useState<VoiceTranscriptionResult | null>(null);
  const [result, setResult] = React.useState<VoiceAttemptResult | null>(null);

  const stopAndTranscribe = async () => {
    const p = await recorder.stop();
    if (!p)
      return;
    setPayload(p);
    try {
      const res = await transcribe.mutateAsync({ sentenceId: sentence.id, ...p });
      setTranscript(res);
    }
    catch {
      // surfaced via transcribe.isError
    }
  };

  const seeFeedback = async () => {
    if (!payload || !transcript)
      return;
    try {
      const res = await evaluate.mutateAsync({
        attemptId: transcript.attemptId,
        sentenceId: sentence.id,
        ...payload,
      });
      setResult(res);
    }
    catch {
      // surfaced via evaluate.isError
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

  return (
    <View className="mx-4 mb-3 rounded-3xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-800">
      <Text className="text-lg font-semibold">{sentence.text}</Text>
      {sentence.ipa
        ? <Text className="mt-1 text-sm text-secondary-600">{sentence.ipa}</Text>
        : null}

      {!transcript && (
        <RecordControls recorder={recorder} transcribe={transcribe} onStop={stopAndTranscribe} />
      )}

      {transcript && (
        <>
          {result
            ? <Feedback result={result} recordingUri={recorder.uri} nativeUrl={sentence.audioUrl} />
            : (
                <TranscriptionCard
                  transcript={transcript}
                  recordingUri={recorder.uri}
                  nativeUrl={sentence.audioUrl}
                  onEvaluate={seeFeedback}
                  evaluating={evaluate.isPending}
                  evaluateError={evaluate.isError}
                />
              )}
          <Pressable onPress={retry} className="mt-3">
            <Text className="text-sm font-semibold text-neutral-500">↺ Try again</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

export function VoicePracticeList({ sentences }: { sentences: Sentence[] }) {
  return (
    <>
      {sentences.map(s => (
        <VoiceSentenceCard key={s.id} sentence={s} />
      ))}
    </>
  );
}
