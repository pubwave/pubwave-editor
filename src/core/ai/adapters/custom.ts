/**
 * Custom adapter helper
 *
 * Lets consumers define an `AIAdapter` from any streaming source (their own
 * proxy, a LangChain `BaseChatModel`, the Vercel AI SDK, etc.) without
 * importing those libraries here.
 */

import type { AIAdapter, AIRequest } from '../types';

export interface DefineAIAdapterInput {
  id: string;
  stream: (request: AIRequest, signal: AbortSignal) => AsyncIterable<string>;
}

export function defineAIAdapter(input: DefineAIAdapterInput): AIAdapter {
  return {
    id: input.id,
    stream: input.stream,
  };
}
