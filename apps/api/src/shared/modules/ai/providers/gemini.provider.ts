import { GoogleGenAI } from '@google/genai';

import { AiProviderName } from '../constants/ai.constants';
import type { AiGenerateJsonInput, GenerativeAiProvider } from '../interfaces/ai-provider.interface';

export interface GeminiProviderOptions {
  apiKey: string;
  model: string;
}

/** Gemini-backed provider. Adapts @google/genai to the GenerativeAiProvider interface. */
export class GeminiProvider implements GenerativeAiProvider {
  readonly name = AiProviderName.Gemini;
  private readonly client: GoogleGenAI | null;
  private readonly model: string;

  constructor(options: GeminiProviderOptions) {
    this.model = options.model;
    this.client = options.apiKey ? new GoogleGenAI({ apiKey: options.apiKey }) : null;
  }

  get isReady(): boolean {
    return this.client !== null;
  }

  async generateJson(input: AiGenerateJsonInput): Promise<unknown> {
    if (!this.client) throw new Error('Gemini provider is not configured');

    const parts: Array<Record<string, unknown>> = [{ text: input.prompt }];
    if (input.media) {
      parts.push({ inlineData: { data: input.media.base64, mimeType: input.media.mimeType } });
    }

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: input.responseSchema,
      },
    });

    return JSON.parse(response.text ?? '{}');
  }
}
