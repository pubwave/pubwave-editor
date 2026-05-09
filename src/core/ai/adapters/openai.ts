/**
 * OpenAI-compatible chat completions adapter
 *
 * Works against the `/v1/chat/completions` endpoint shape, which is supported
 * by OpenAI itself plus Azure OpenAI, Groq, Together, Fireworks, OpenRouter,
 * DeepSeek, Moonshot, Qwen DashScope, SiliconFlow, vLLM, LM Studio and
 * Ollama (in OpenAI-compatible mode), among others.
 *
 * Pure `fetch`; no SDK dependency.
 */

import type { AIAdapter, AIRequest } from '../types';
import { AIError } from '../types';
import { parseSSE } from '../sse';

export interface OpenAICompatibleAdapterOptions {
  /** Provider base URL, defaults to OpenAI public endpoint. */
  baseURL?: string;
  /** API key sent as `Authorization: Bearer ...`. Optional for local servers. */
  apiKey?: string;
  /** Default model used when the request does not specify one. */
  model?: string;
  /** Extra headers merged into every request (e.g. org id, project id). */
  headers?: Record<string, string>;
  /** Override the global `fetch` (e.g. for proxies, retries). */
  fetch?: typeof fetch;
  /** Stable id for telemetry. Defaults to `openai-compatible`. */
  id?: string;
  /** Extra body fields appended to the JSON payload. */
  extraBody?: Record<string, unknown>;
}

interface OpenAIDelta {
  choices?: { delta?: { content?: string }; finish_reason?: string | null }[];
}

export function createOpenAICompatibleAdapter(
  options: OpenAICompatibleAdapterOptions = {}
): AIAdapter {
  const baseURL = (options.baseURL ?? 'https://api.openai.com/v1').replace(
    /\/+$/,
    ''
  );
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const id = options.id ?? 'openai-compatible';

  return {
    id,
    async *stream(
      request: AIRequest,
      signal: AbortSignal
    ): AsyncIterable<string> {
      const model = request.model ?? options.model;
      if (!model) {
        throw new AIError('OpenAI adapter requires a model', { adapterId: id });
      }

      const body = {
        model,
        messages: request.messages,
        stream: true,
        ...(request.temperature != null
          ? { temperature: request.temperature }
          : {}),
        ...(request.maxTokens != null ? { max_tokens: request.maxTokens } : {}),
        ...(options.extraBody ?? {}),
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(options.headers ?? {}),
      };
      if (options.apiKey) {
        headers.Authorization = `Bearer ${options.apiKey}`;
      }

      let response: Response;
      try {
        response = await fetchImpl(`${baseURL}/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal,
        });
      } catch (err) {
        throw new AIError('OpenAI request failed', {
          cause: err,
          adapterId: id,
        });
      }

      if (!response.ok) {
        const text = await safeReadText(response);
        throw new AIError(
          `OpenAI request failed (${String(response.status)}): ${text}`,
          { status: response.status, adapterId: id }
        );
      }

      for await (const event of parseSSE(response, signal)) {
        const data = event.data.trim();
        if (!data || data === '[DONE]') continue;

        let parsed: OpenAIDelta;
        try {
          parsed = JSON.parse(data) as OpenAIDelta;
        } catch {
          continue;
        }
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      }
    },
  };
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '<unreadable body>';
  }
}
