'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type RecorderStatus = 'idle' | 'recording' | 'recorded';

export interface RecordingPayload {
  /** Base64 (no data: prefix), for upload. */
  audioBase64: string;
  mimeType: string;
}

export interface RecorderState {
  status: RecorderStatus;
  /** Object URL of the latest recording, for local A/B playback (session-scoped). */
  audioUrl: string | null;
  error: string | null;
  start: () => Promise<void>;
  /** Stop recording and resolve once the encoded payload is ready. */
  stop: () => Promise<RecordingPayload | null>;
  reset: () => void;
}

/** Pick a MIME type the browser can actually record. */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.slice(result.indexOf(',') + 1)); // strip "data:...;base64,"
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function useRecorder(): RecorderState {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);
  const resolveStopRef = useRef<((p: RecordingPayload | null) => void) | null>(null);

  const clearUrl = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
    if (!stream) {
      setError('Microphone access was blocked. Allow it and try again.');
      setStatus('idle');
      return;
    }
    streamRef.current = stream;
    try {
      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stopStream();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        clearUrl();
        urlRef.current = URL.createObjectURL(blob);
        setAudioUrl(urlRef.current);
        setStatus('recorded');
        const payload: RecordingPayload = {
          audioBase64: await blobToBase64(blob),
          // Bare type (drop ";codecs=…") — evaluators expect the container type only.
          mimeType: blob.type.split(';')[0],
        };
        resolveStopRef.current?.(payload);
        resolveStopRef.current = null;
      };

      recorderRef.current = recorder;
      recorder.start();
      setStatus('recording');
    } catch {
      stopStream(); // release the mic if recorder setup failed
      setError('Recording is not supported on this device.');
      setStatus('idle');
    }
  }, [clearUrl, stopStream]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return Promise.resolve(null);
    return new Promise<RecordingPayload | null>((resolve) => {
      resolveStopRef.current = resolve;
      recorder.stop();
    });
  }, []);

  const reset = useCallback(() => {
    clearUrl();
    chunksRef.current = [];
    resolveStopRef.current = null;
    setAudioUrl(null);
    setError(null);
    setStatus('idle');
  }, [clearUrl]);

  // Release the object URL and mic stream if the card unmounts mid-session.
  useEffect(() => {
    return () => {
      clearUrl();
      stopStream();
    };
  }, [clearUrl, stopStream]);

  return { status, audioUrl, error, start, stop, reset };
}
