/**
 * AI adapter barrel
 *
 * Each adapter is a small zero-dependency `fetch` wrapper. They are exposed
 * both from this barrel and as sub-path exports (`@pubwave/editor/ai/<name>`)
 * so consumers only pay for the providers they use.
 */

export {
  createOpenAICompatibleAdapter,
  type OpenAICompatibleAdapterOptions,
} from './openai';
export {
  createAnthropicAdapter,
  type AnthropicAdapterOptions,
} from './anthropic';
export { createGeminiAdapter, type GeminiAdapterOptions } from './gemini';
export { createOllamaAdapter, type OllamaAdapterOptions } from './ollama';
export { defineAIAdapter, type DefineAIAdapterInput } from './custom';
export { createAdapter, type CreateAdapterInput } from './factory';
