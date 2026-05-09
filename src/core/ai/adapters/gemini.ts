/**
 * Google Gemini adapter
 *
 * Targets `/v1beta/models/{model}:streamGenerateContent?alt=sse`. Pure
 * `fetch`; no SDK dep.
 */

import type { AIAdapter, AIMessage, AIRequest } from '../types';
import { AIError } from '../types';
import { parseSSE } from '../sse';

export interface GeminiAdapterOptions {
  baseURL?: string;
  apiKey?: string;
  model?: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
  id?: string;
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
  }[];
}

export function createGeminiAdapter(
  options: GeminiAdapterOptions = {}
): AIAdapter {
  const baseURL = (
    options.baseURL ?? 'https://generativelanguage.googleapis.com/v1beta'
  ).replace(/\/+$/, '');
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const id = options.id ?? 'gemini';

  return {
    id,
    async *stream(
      request: AIRequest,
      signal: AbortSignal
    ): AsyncIterable<string> {
      const model = request.model ?? options.model;
      if (!model) {
        throw new AIError('Gemini adapter requires a model', { adapterId: id });
      }

      const { systemInstruction, contents } = toGeminiContents(
        request.messages
      );
      const body = {
        contents,
        ...(systemInstruction ? { systemInstruction } : {}),
        generationConfig: {
          ...(request.temperature != null
            ? { temperature: request.temperature }
            : {}),
          ...(request.maxTokens != null
            ? { maxOutputTokens: request.maxTokens }
            : {}),
        },
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(options.headers ?? {}),
      };

      // Build URL via string concat so relative baseURLs (used by server
      // proxies, e.g. `/api/ai/gemini`) work — `new URL()` would throw.
      const query = new URLSearchParams({ alt: 'sse' });
      if (options.apiKey) query.set('key', options.apiKey);
      const url = `${baseURL}/models/${model}:streamGenerateContent?${query.toString()}`;

      let response: Response;
      try {
        response = await fetchImpl(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal,
        });
      } catch (err) {
        throw new AIError('Gemini request failed', {
          cause: err,
          adapterId: id,
        });
      }

      if (!response.ok) {
        const text = await safeReadText(response);
        throw new AIError(
          `Gemini request failed (${String(response.status)}): ${text}`,
          { status: response.status, adapterId: id }
        );
      }

      for await (const event of parseSSE(response, signal)) {
        const data = event.data.trim();
        if (!data) continue;
        let parsed: GeminiResponse;
        try {
          parsed = JSON.parse(data) as GeminiResponse;
        } catch {
          continue;
        }
        const parts = parsed.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part.text) yield part.text;
        }
      }
    },
  };
}

function toGeminiContents(messages: AIMessage[]): {
  systemInstruction?: { parts: { text: string }[] };
  contents: { role: 'user' | 'model'; parts: { text: string }[] }[];
} {
  const systemParts = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content);
  const conversation = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    }));

  return {
    systemInstruction:
      systemParts.length > 0
        ? { parts: [{ text: systemParts.join('\n\n') }] }
        : undefined,
    contents: conversation,
  };
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '<unreadable body>';
  }
}
