/**
 * Ollama native API adapter
 *
 * Targets `/api/chat` with NDJSON streaming. Use this when Ollama is running
 * with its native protocol; for the OpenAI-compatible mode (default in newer
 * Ollama builds) prefer `createOpenAICompatibleAdapter` with
 * `baseURL: 'http://localhost:11434/v1'`.
 */

import type { AIAdapter, AIRequest } from '../types';
import { AIError } from '../types';

export interface OllamaAdapterOptions {
  baseURL?: string;
  model?: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
  id?: string;
}

interface OllamaChunk {
  message?: { content?: string };
  done?: boolean;
}

export function createOllamaAdapter(
  options: OllamaAdapterOptions = {}
): AIAdapter {
  const baseURL = (options.baseURL ?? 'http://localhost:11434').replace(
    /\/+$/,
    ''
  );
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const id = options.id ?? 'ollama';

  return {
    id,
    async *stream(
      request: AIRequest,
      signal: AbortSignal
    ): AsyncIterable<string> {
      const model = request.model ?? options.model;
      if (!model) {
        throw new AIError('Ollama adapter requires a model', { adapterId: id });
      }

      const body = {
        model,
        messages: request.messages,
        stream: true,
        options: {
          ...(request.temperature != null
            ? { temperature: request.temperature }
            : {}),
          ...(request.maxTokens != null
            ? { num_predict: request.maxTokens }
            : {}),
        },
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      };

      let response: Response;
      try {
        response = await fetchImpl(`${baseURL}/api/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal,
        });
      } catch (err) {
        throw new AIError('Ollama request failed', {
          cause: err,
          adapterId: id,
        });
      }

      if (!response.ok || !response.body) {
        const text = await safeReadText(response);
        throw new AIError(
          `Ollama request failed (${String(response.status)}): ${text}`,
          { status: response.status, adapterId: id }
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      try {
        while (!signal.aborted) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            let parsed: OllamaChunk;
            try {
              parsed = JSON.parse(trimmed) as OllamaChunk;
            } catch {
              continue;
            }
            const delta = parsed.message?.content;
            if (delta) yield delta;
            if (parsed.done) return;
          }
        }
      } finally {
        try {
          await reader.cancel();
        } catch {
          // ignore
        }
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
