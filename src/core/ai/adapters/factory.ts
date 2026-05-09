/**
 * Unified adapter factory
 *
 * Single entry point that dispatches to the provider-specific adapter based
 * on a `provider` discriminator. Each branch narrows to the matching
 * options shape so TypeScript shows the right autocomplete:
 *
 *   createAdapter({ provider: 'openai', apiKey, model })
 *   createAdapter({ provider: 'anthropic', apiKey, model, anthropicVersion })
 *   createAdapter({ provider: 'gemini', apiKey, model })
 *   createAdapter({ provider: 'ollama', model })
 *
 * `provider: 'openai'` covers OpenAI itself plus any OpenAI-compatible
 * endpoint (Azure, Groq, Together, OpenRouter, DeepSeek, Moonshot, Zhipu,
 * Qwen DashScope compat-mode, vLLM, LM Studio, your own proxy) — just
 * override `baseURL`.
 *
 * The provider-specific factories (`createOpenAICompatibleAdapter`, etc.)
 * remain exported for callers that prefer them — this is purely additive.
 */

import type { AIAdapter } from '../types';
import {
  createOpenAICompatibleAdapter,
  type OpenAICompatibleAdapterOptions,
} from './openai';
import {
  createAnthropicAdapter,
  type AnthropicAdapterOptions,
} from './anthropic';
import { createGeminiAdapter, type GeminiAdapterOptions } from './gemini';
import { createOllamaAdapter, type OllamaAdapterOptions } from './ollama';

export type CreateAdapterInput =
  | ({ provider: 'openai' } & OpenAICompatibleAdapterOptions)
  | ({ provider: 'anthropic' } & AnthropicAdapterOptions)
  | ({ provider: 'gemini' } & GeminiAdapterOptions)
  | ({ provider: 'ollama' } & OllamaAdapterOptions);

export function createAdapter(input: CreateAdapterInput): AIAdapter {
  switch (input.provider) {
    case 'openai':
      return createOpenAICompatibleAdapter(input);
    case 'anthropic':
      return createAnthropicAdapter(input);
    case 'gemini':
      return createGeminiAdapter(input);
    case 'ollama':
      return createOllamaAdapter(input);
  }
}
