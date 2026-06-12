/** A single inline media part (e.g. an audio recording) sent alongside the prompt. */
export interface AiMediaPart {
  /** Base64-encoded bytes (no data: prefix). */
  base64: string;
  mimeType: string;
}

/** A request for JSON output constrained to a schema, optionally with media input. */
export interface AiGenerateJsonInput {
  prompt: string;
  media?: AiMediaPart;
  /** Standard JSON Schema the response must conform to. */
  responseSchema: Record<string, unknown>;
}

/**
 * A swappable generative-AI backend (Gemini, OpenAI, …). Each provider adapts a
 * vendor SDK to this interface so callers stay vendor-neutral.
 */
export interface GenerativeAiProvider {
  /** Stable provider identifier, e.g. "gemini". */
  readonly name: string;
  /** Whether the provider is configured (has credentials) and usable. */
  readonly isReady: boolean;
  /** Generate JSON conforming to `responseSchema`. Returns the parsed object. */
  generateJson(input: AiGenerateJsonInput): Promise<unknown>;
}
