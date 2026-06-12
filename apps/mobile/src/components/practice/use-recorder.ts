import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import * as React from 'react';

export type RecorderStatus = 'idle' | 'recording' | 'recorded';

export type RecordingPayload = {
  audioBase64: string;
  mimeType: string;
};

export function useRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [status, setStatus] = React.useState<RecorderStatus>('idle');
  const [uri, setUri] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const start = React.useCallback(async () => {
    setError(null);
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setError('Microphone permission denied');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatus('recording');
    }
    catch {
      setError('Could not start recording');
      setStatus('idle');
    }
  }, [recorder]);

  const stop = React.useCallback(async (): Promise<RecordingPayload | null> => {
    await recorder.stop();
    const u = recorder.uri;
    setUri(u);
    setStatus('recorded');
    if (!u)
      return null;
    const audioBase64 = await FileSystem.readAsStringAsync(u, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { audioBase64, mimeType: 'audio/mp4' };
  }, [recorder]);

  const reset = React.useCallback(() => {
    setStatus('idle');
    setUri(null);
    setError(null);
  }, []);

  return { status, uri, error, start, stop, reset };
}
