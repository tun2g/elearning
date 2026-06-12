import { AiProviderName } from '../constants/ai.constants';
import type { AiGenerateJsonInput, GenerativeAiProvider } from '../interfaces/ai-provider.interface';

export interface OpenAiProviderOptions {
  apiKey: string;
  model: string;
}

/**
 * OpenAI provider — extension point. Implement `generateJson` against the OpenAI
 * SDK (audio input + JSON-schema structured output) when a second provider is
 * needed. Kept inert (isReady=false) until then so it never silently activates.
 */
export class OpenAiProvider implements GenerativeAiProvider {
  readonly name = AiProviderName.OpenAI;

  constructor(private readonly options: OpenAiProviderOptions) {}

  get isReady(): boolean {
    return false;
  }

  generateJson(_input: AiGenerateJsonInput): Promise<unknown> {
    void this.options;
    return Promise.reject(new Error('OpenAI provider is not implemented yet'));
  }
}
