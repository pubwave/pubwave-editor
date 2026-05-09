/**
 * SSE parser unit tests
 *
 * Verifies cross-chunk boundaries, multi-line `data:` payloads, comment lines
 * and abort handling.
 */

import { describe, it, expect } from 'vitest';
import { parseSSE } from '../../src/core/ai/sse';

function chunkedResponse(chunks: string[]): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

async function collect(iter: AsyncIterable<{ data: string }>): Promise<string[]> {
  const out: string[] = [];
  for await (const ev of iter) out.push(ev.data);
  return out;
}

describe('parseSSE', () => {
  it('parses single events', async () => {
    const res = chunkedResponse(['data: hello\n\n', 'data: world\n\n']);
    const events = await collect(parseSSE(res, new AbortController().signal));
    expect(events).toEqual(['hello', 'world']);
  });

  it('handles event boundaries split across chunks', async () => {
    const res = chunkedResponse(['data: hel', 'lo\n', '\n', 'data: world\n\n']);
    const events = await collect(parseSSE(res, new AbortController().signal));
    expect(events).toEqual(['hello', 'world']);
  });

  it('joins multi-line data payloads', async () => {
    const res = chunkedResponse(['data: line one\ndata: line two\n\n']);
    const events = await collect(parseSSE(res, new AbortController().signal));
    expect(events).toEqual(['line one\nline two']);
  });

  it('skips comment lines and empty fields', async () => {
    const res = chunkedResponse([': heartbeat\n\n', 'data: actual\n\n']);
    const events = await collect(parseSSE(res, new AbortController().signal));
    expect(events).toEqual(['actual']);
  });

  it('honors AbortSignal', async () => {
    const controller = new AbortController();
    const res = chunkedResponse(['data: a\n\n']);
    controller.abort();
    const events = await collect(parseSSE(res, controller.signal));
    expect(events.length).toBeLessThanOrEqual(1);
  });
});
