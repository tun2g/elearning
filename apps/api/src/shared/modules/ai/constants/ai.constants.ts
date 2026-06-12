/** Identifiers for the supported generative-AI providers. */
export const AiProviderName = {
  Gemini: 'gemini',
  OpenAI: 'openai',
} as const;

export type AiProviderName = (typeof AiProviderName)[keyof typeof AiProviderName];
