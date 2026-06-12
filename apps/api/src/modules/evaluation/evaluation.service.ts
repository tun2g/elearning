import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

import { AiService } from 'src/shared/modules/ai/ai.service';

import { buildPronunciationPrompt, PRONUNCIATION_RESPONSE_SCHEMA } from './constants/pronunciation.constants';
import type { EvaluateInput, RawPronunciationEval } from './interfaces/pronunciation-eval.interface';

function clampScore(n: unknown): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Pronunciation evaluator. Owns the rubric (prompt + schema) and delegates the
 * actual model call to the vendor-neutral {@link AiService}, so swapping Gemini
 * for another provider needs no change here.
 */
@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(private readonly ai: AiService) {}

  /** Name of the active AI provider (stored on the assessment for provenance). */
  get provider(): string {
    return this.ai.providerName;
  }

  async evaluatePronunciation(input: EvaluateInput): Promise<RawPronunciationEval> {
    let raw: unknown;
    try {
      raw = await this.ai.generateJson({
        prompt: buildPronunciationPrompt(input.referenceText),
        media: { base64: input.audioBase64, mimeType: input.mimeType },
        responseSchema: PRONUNCIATION_RESPONSE_SCHEMA as unknown as Record<string, unknown>,
      });
    } catch (err) {
      if (err instanceof ServiceUnavailableException) throw err;
      // Log details server-side; return a generic message to the client.
      this.logger.error(`Pronunciation evaluation failed: ${err instanceof Error ? err.message : String(err)}`);
      throw new ServiceUnavailableException('Voice evaluation is unavailable right now.');
    }

    const r = raw as Partial<RawPronunciationEval>;
    return {
      transcription: typeof r.transcription === 'string' ? r.transcription : '',
      overall: clampScore(r.overall),
      fluency: clampScore(r.fluency),
      completeness: clampScore(r.completeness),
      coachingNote: typeof r.coachingNote === 'string' ? r.coachingNote : '',
    };
  }
}
