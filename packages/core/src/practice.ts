/**
 * Practice concepts distilled from the ebot ecosystem.
 *
 * NOTE: AI-driven evaluation (pronunciation/shadowing scoring via an LLM or a
 * speech assessment service) is a LATER phase. These types define the contract
 * those evaluators will fulfil, so the apps can be built against them now.
 */

export const PracticeMode = {
  /** Listen to native audio, no scoring. The MVP "practice by sound" flow. */
  Listen: 'listen',
  /** Echo the sentence immediately after hearing it. */
  Shadow: 'shadow',
  /** Read the sentence aloud cold; get a pronunciation score. */
  Voice: 'voice',
} as const;
export type PracticeMode = (typeof PracticeMode)[keyof typeof PracticeMode];

/** Rubric for shadowing — mirrors ebot's evaluateShadowing breakdown. */
export interface ShadowingScore {
  accuracy: number; // 0-10 word matching
  rhythm: number; // 0-10 pace / syllable timing
  connectedSpeech: number; // 0-10 linking, reductions
  stressIntonation: number; // 0-10 prosody
}

/** Rubric for cold read-aloud — mirrors ebot's evaluateVoicePronunciation. */
export interface PronunciationScore {
  accuracy: number; // 0-4
  fluency: number; // 0-3
  intonation: number; // 0-3
  transcription: string;
}

export function shadowingTotal(s: ShadowingScore): number {
  return s.accuracy + s.rhythm + s.connectedSpeech + s.stressIntonation;
}

export function pronunciationTotal(s: PronunciationScore): number {
  return s.accuracy + s.fluency + s.intonation;
}
