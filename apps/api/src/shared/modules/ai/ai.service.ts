import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppConfig } from 'src/config/configuration';

import { AiProviderName } from './constants/ai.constants';
import type { AiGenerateJsonInput, GenerativeAiProvider } from './interfaces/ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';

/**
 * Vendor-neutral entry point for generative-AI calls. Builds every known provider
 * from config and routes calls to the one selected by `ai.provider`. Adding a
 * provider means registering it here — callers never change.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly providers: Record<string, GenerativeAiProvider>;
  private readonly active: GenerativeAiProvider;

  constructor(configService: ConfigService<AppConfig, true>) {
    const ai = configService.get('ai', { infer: true });

    this.providers = {
      [AiProviderName.Gemini]: new GeminiProvider(ai.gemini),
      [AiProviderName.OpenAI]: new OpenAiProvider(ai.openai),
    };

    const active = this.providers[ai.provider];
    if (!active) {
      this.logger.warn(`Unknown AI provider "${ai.provider}" — defaulting to gemini`);
    }
    this.active = active ?? this.providers[AiProviderName.Gemini];
  }

  /** The active provider's name (e.g. "gemini"). */
  get providerName(): string {
    return this.active.name;
  }

  /** Whether the active provider is configured and usable. */
  get isReady(): boolean {
    return this.active.isReady;
  }

  async generateJson(input: AiGenerateJsonInput): Promise<unknown> {
    if (!this.active.isReady) {
      // Log the real reason server-side; never expose provider/config details to the client.
      this.logger.warn(`AI provider "${this.active.name}" is not configured`);
      throw new ServiceUnavailableException('Voice evaluation is unavailable right now.');
    }
    return this.active.generateJson(input);
  }
}
