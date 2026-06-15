/**
 * Practice concepts distilled from the ebot ecosystem.
 *
 * NOTE: AI-driven evaluation (pronunciation/shadowing scoring via an LLM or a
 * speech assessment service) is a LATER phase. These types define the contract
 * those evaluators will fulfil, so the apps can be built against them now.
 */

import type { SelfAssessment, WordResult } from '@elearning/contracts';

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

// --- Speaking evaluation: deterministic word alignment + SRS grade derivation ---

interface Token {
  /** Original surface form, for display. */
  display: string;
  /** Normalized form, for comparison. */
  norm: string;
}

function tokenize(text: string): Token[] {
  return text
    .split(/\s+/)
    .map((display) => ({
      display,
      norm: display.toLowerCase().replace(/[^\p{L}\p{N}']/gu, ''),
    }))
    .filter((t) => t.norm.length > 0);
}

/**
 * Align a recognizer transcription against the known reference sentence and
 * classify each reference word as ok / substituted / omitted, plus any extra
 * spoken words as inserted. Uses Levenshtein alignment with backtrace — the
 * result is deterministic and does not rely on the model to judge words.
 *
 * The output preserves reference word order; inserted words appear at the
 * position they were spoken.
 */
export function alignWords(reference: string, transcription: string): WordResult[] {
  const ref = tokenize(reference);
  const hyp = tokenize(transcription);
  const m = ref.length;
  const n = hyp.length;

  // dp[i][j] = min edits to align ref[0..i) with hyp[0..j)
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = ref[i - 1].norm === hyp[j - 1].norm ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j - 1] + cost, dp[i - 1][j] + 1, dp[i][j - 1] + 1);
    }
  }

  // Backtrace from (m, n) to (0, 0), emitting operations in reverse.
  const out: WordResult[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && ref[i - 1].norm === hyp[j - 1].norm && dp[i][j] === dp[i - 1][j - 1]) {
      out.push({ text: ref[i - 1].display, status: 'ok' });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      out.push({ text: ref[i - 1].display, status: 'substituted', heardAs: hyp[j - 1].display });
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      out.push({ text: ref[i - 1].display, status: 'omitted' });
      i--;
    } else {
      out.push({ text: hyp[j - 1].display, status: 'inserted' });
      j--;
    }
  }

  return out.reverse();
}

/**
 * Derive the SM-2 grade from an overall pronunciation score (0–100). In voice
 * mode the machine judges — the user never self-rates — so this band feeds the
 * existing spaced-repetition scheduler in place of a manual Again/Hard/Easy tap.
 */
export function scoreToGrade(overall: number): SelfAssessment {
  if (overall < 60) return 'again';
  if (overall < 85) return 'hard';
  return 'easy';
}

/** Minimum overall pronunciation score (0–100) that counts as "passing" a sentence. */
export const PASS_SCORE = 70;

/** Whether an overall pronunciation score clears the pass bar. */
export function isPassing(overall: number): boolean {
  return overall >= PASS_SCORE;
}
