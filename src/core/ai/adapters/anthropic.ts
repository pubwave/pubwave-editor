/**
 * Anthropic Messages API adapter
 *
 * Targets `/v1/messages` with `stream: true`. Pure `fetch`; no SDK dep.
 *
 * NOTE: Anthropic's API requires the `anthropic-dangerous-direct-browser-access`
 * header when called from a browser. Set it via `headers` only when you have
 * accepted the risk (Anthropic recommends a backend proxy in production).
 */

import type { AIAdapter, AIMessage, AIRequest } from '../types';
import { AIError } from '../types';
import { parseSSE } from '../sse';

export interface AnthropicAdapterOptions {
  baseURL?: string;
  apiKey?: string;
  model?: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
  id?: string;
  /** API version header. Defaults to a known good value. */
  anthropicVersion?: string;
}

interface AnthropicEvent {
  type: string;
  delta?: { type?: string; text?: string };
}

export function createAnthropicAdapter(
  options: AnthropicAdapterOptions = {}
): AIAdapter {
  const baseURL = (options.baseURL ?? 'https://api.anthropic.com').replace(
    /\/+$/,
    ''
  );
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const id = options.id ?? 'anthropic';

  return {
    id,
    async *stream(
      request: AIRequest,
      signal: AbortSignal
    ): AsyncIterable<string> {
      const model = request.model ?? options.model;
      if (!model) {
        throw new AIError('Anthropic adapter requires a model', {
          adapterId: id,
        });
      }

      const { system, messages } = splitSystem(request.messages);
      const body = {
        model,
        messages,
        stream: true,
        max_tokens: request.maxTokens ?? 1024,
        ...(request.temperature != null
          ? { temperature: request.temperature }
          : {}),
        ...(system ? { system } : {}),
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'anthropic-version': options.anthropicVersion ?? '2023-06-01',
        ...(options.headers ?? {}),
      };
      if (options.apiKey) {
        headers['x-api-key'] = options.apiKey;
      }

      let response: Response;
      try {
        response = await fetchImpl(`${baseURL}/v1/messages`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal,
        });
      } catch (err) {
        throw new AIError('Anthropic request failed', {
          cause: err,
          adapterId: id,
        });
      }

      if (!response.ok) {
        const text = await safeReadText(response);
        throw new AIError(
          `Anthropic request failed (${String(response.status)}): ${text}`,
          { status: response.status, adapterId: id }
        );
      }

      for await (const event of parseSSE(response, signal)) {
        const data = event.data.trim();
        if (!data) continue;
        let parsed: AnthropicEvent;
        try {
          parsed = JSON.parse(data) as AnthropicEvent;
        } catch {
          continue;
        }
        if (
          parsed.type === 'content_block_delta' &&
          parsed.delta?.type === 'text_delta' &&
          parsed.delta.text
        ) {
          yield parsed.delta.text;
        }
      }
    },
  };
}

function splitSystem(messages: AIMessage[]): {
  system?: string;
  messages: AIMessage[];
} {
  const systemParts = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content);
  const rest = messages.filter((m) => m.role !== 'system');
  return {
    system: systemParts.length > 0 ? systemParts.join('\n\n') : undefined,
    messages: rest,
  };
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '<unreadable body>';
  }
}
