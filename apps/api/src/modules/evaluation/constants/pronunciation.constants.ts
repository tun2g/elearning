/** JSON Schema the model must return for a pronunciation evaluation. */
export const PRONUNCIATION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    transcription: { type: 'string' },
    overall: { type: 'integer' },
    fluency: { type: 'integer' },
    completeness: { type: 'integer' },
    coachingNote: { type: 'string' },
  },
  required: ['transcription', 'overall', 'fluency', 'completeness', 'coachingNote'],
  additionalProperties: false,
} as const;

/** JSON Schema for the transcription-only step (no scoring). */
export const TRANSCRIPTION_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    transcription: { type: 'string' },
  },
  required: ['transcription'],
  additionalProperties: false,
} as const;

/**
 * Prompt for verbatim transcription only. Deliberately withholds the reference
 * sentence so the model can't "correct" toward it — we want what was actually said.
 */
export const TRANSCRIPTION_PROMPT =
  `Transcribe this recording of an English learner reading aloud. ` +
  `Return JSON with "transcription": exactly what you heard them say, verbatim and uncorrected. ` +
  `Do not guess at or fix mistakes — write what was actually said.`;

/** Build the evaluator prompt for a given reference sentence. */
export function buildPronunciationPrompt(referenceText: string): string {
  return (
    `You are a pronunciation coach for English learners. The learner was asked to read ` +
    `this sentence aloud:\n\n"${referenceText}"\n\n` +
    `Listen to the recording and return JSON with:\n` +
    `- transcription: exactly what you heard them say, verbatim and uncorrected.\n` +
    `- overall: 0-100, how clear and accurate their pronunciation was.\n` +
    `- fluency: 0-100, pacing and smoothness.\n` +
    `- completeness: 0-100, how much of the sentence they attempted.\n` +
    `- coachingNote: one short, specific, encouraging tip.\n\n` +
    `Score for intelligibility, not native perfection. Be encouraging.`
  );
}
