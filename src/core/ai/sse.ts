/**
 * Minimal SSE (Server-Sent Events) parser used by AI adapters.
 *
 * Reads a `Response` body as a stream and yields the data payload of each
 * event. Handles cross-chunk boundaries and ignores comments / heartbeats.
 */

export interface SSEEvent {
  event?: string;
  data: string;
}

export async function* parseSSE(
  response: Response,
  signal: AbortSignal
): AsyncIterable<SSEEvent> {
  if (!response.body) {
    throw new Error('SSE response has no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let separatorIndex: number;
      while ((separatorIndex = findEventBoundary(buffer)) !== -1) {
        const rawEvent = buffer.slice(0, separatorIndex);
        buffer = buffer.slice(separatorIndex).replace(/^(\r\n|\r|\n){2}/, '');
        const parsed = parseEvent(rawEvent);
        if (parsed) yield parsed;
      }
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // ignore
    }
  }
}

function findEventBoundary(buffer: string): number {
  const indices = [
    buffer.indexOf('\n\n'),
    buffer.indexOf('\r\n\r\n'),
    buffer.indexOf('\r\r'),
  ].filter((i) => i !== -1);
  if (indices.length === 0) return -1;
  return Math.min(...indices);
}

function parseEvent(raw: string): SSEEvent | null {
  const lines = raw.split(/\r\n|\r|\n/);
  let event: string | undefined;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(':')) continue;
    const colonIndex = line.indexOf(':');
    const field = colonIndex === -1 ? line : line.slice(0, colonIndex);
    const value =
      colonIndex === -1 ? '' : line.slice(colonIndex + 1).replace(/^ /, '');

    if (field === 'event') {
      event = value;
    } else if (field === 'data') {
      dataLines.push(value);
    }
  }

  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join('\n') };
}
