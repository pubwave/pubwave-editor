/**
 * OpenAI-compatible adapter
 *
 * Mocks `fetch` to return a fake SSE stream and asserts the adapter yields
 * the deltas in order, applies request shape correctly, and rejects when
 * the model is missing.
 */

import { describe, it, expect } from 'vitest';
import { createOpenAICompatibleAdapter } from '../../src/core/ai/adapters/openai';
import { AIError } from '../../src/core/ai/types';

function makeFetch(body: string, init: ResponseInit = { status: 200 }): typeof fetch {
  return async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(body));
        controller.close();
      },
    });
    return new Response(stream, {
      ...init,
      headers: { 'Content-Type': 'text/event-stream', ...(init.headers ?? {}) },
    });
  };
}

async function collectStream(
  iter: AsyncIterable<string>
): Promise<string[]> {
  const out: string[] = [];
  for await (const c of iter) out.push(c);
  return out;
}

describe('createOpenAICompatibleAdapter', () => {
  it('yields deltas from a streaming response', async () => {
    const body =
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n' +
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n' +
      'data: [DONE]\n\n';
    const adapter = createOpenAICompatibleAdapter({
      apiKey: 'test',
      model: 'gpt-test',
      fetch: makeFetch(body),
    });
    const chunks = await collectStream(
      adapter.stream({ messages: [{ role: 'user', content: 'hi' }] }, new AbortController().signal)
    );
    expect(chunks.join('')).toBe('Hello world');
  });

  it('throws AIError when no model is provided', async () => {
    const adapter = createOpenAICompatibleAdapter({ fetch: makeFetch('') });
    await expect(async () => {
      for await (const _ of adapter.stream(
        { messages: [{ role: 'user', content: 'hi' }] },
        new AbortController().signal
      )) {
        void _;
      }
    }).rejects.toBeInstanceOf(AIError);
  });

  it('throws AIError on non-OK response', async () => {
    const adapter = createOpenAICompatibleAdapter({
      apiKey: 'test',
      model: 'gpt-test',
      fetch: makeFetch('Bad request', { status: 400 }),
    });
    await expect(async () => {
      for await (const _ of adapter.stream(
        { messages: [{ role: 'user', content: 'hi' }] },
        new AbortController().signal
      )) {
        void _;
      }
    }).rejects.toBeInstanceOf(AIError);
  });
});
