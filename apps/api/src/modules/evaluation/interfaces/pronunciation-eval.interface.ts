export interface EvaluateInput {
  /** Base64-encoded recording (never persisted). */
  audioBase64: string;
  /** MIME type of the recording, e.g. "audio/webm". */
  mimeType: string;
  /** The sentence the learner was asked to read. */
  referenceText: string;
}

/** Input for the transcription-only step. */
export interface TranscribeInput {
  /** Base64-encoded recording (never persisted). */
  audioBase64: string;
  /** MIME type of the recording, e.g. "audio/webm". */
  mimeType: string;
}

/** Verbatim transcription from the model, with no scoring. */
export interface TranscriptionResult {
  transcription: string;
}

/** Raw scores + transcription from the model. Word-level alignment is done by the caller. */
export interface RawPronunciationEval {
  transcription: string;
  overall: number;
  fluency: number;
  completeness: number;
  coachingNote: string;
}
