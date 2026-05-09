/**
 * Dispatcher
 *
 * Thin orchestration on top of an `AIAdapter`. Adds:
 * - System prompt injection
 * - AbortController plumbing
 * - Uniform error wrapping
 * - Optional onChunk side-effect during iteration
 */

import type { AIAdapter, AIConfig, AIRequest } from './types';
import { AIError } from './types';

export interface RunRequest {
  adapter: AIAdapter;
  request: AIRequest;
  config?: Pick<
    AIConfig,
    'systemPrompt' | 'defaultModel' | 'maxTokens' | 'temperature'
  >;
  signal: AbortSignal;
}

export async function* runAI(input: RunRequest): AsyncIterable<string> {
  const { adapter, signal, config } = input;
  const request = mergeRequest(input.request, config);

  try {
    for await (const chunk of adapter.stream(request, signal)) {
      if (signal.aborted) return;
      if (chunk.length > 0) yield chunk;
    }
  } catch (err) {
    if (signal.aborted) return;
    if (err instanceof AIError) throw err;
    throw new AIError(toMessage(err), {
      cause: err,
      adapterId: adapter.id,
    });
  }
}

function mergeRequest(
  request: AIRequest,
  config: RunRequest['config']
): AIRequest {
  const messages = [...request.messages];
  if (config?.systemPrompt && !messages.some((m) => m.role === 'system')) {
    messages.unshift({ role: 'system', content: config.systemPrompt });
  }
  return {
    messages,
    model: request.model ?? config?.defaultModel,
    temperature: request.temperature ?? config?.temperature,
    maxTokens: request.maxTokens ?? config?.maxTokens,
  };
}

function toMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'AI request failed';
}
