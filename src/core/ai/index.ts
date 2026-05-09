/**
 * Public surface of the AI core layer.
 *
 * Adapters live under `./adapters` and are re-exported here for the
 * default barrel; consumers can also import them via the sub-path
 * `@pubwave/editor/ai/<provider>` exports declared in `package.json`.
 */

export type {
  AIMessage,
  AIRequest,
  AIAdapter,
  AIAction,
  AIActionContext,
  AIApplyMode,
  AIContextSource,
  AIConfig,
} from './types';
export { AIError } from './types';
export { defaultAIActions, getAction } from './actions';
export { runAI } from './dispatcher';
export { localeToLanguage } from './locale';
export { parseSSE } from './sse';
export type { SSEEvent } from './sse';
export {
  createOpenAICompatibleAdapter,
  createAnthropicAdapter,
  createGeminiAdapter,
  createOllamaAdapter,
  defineAIAdapter,
  createAdapter,
} from './adapters';
export type { CreateAdapterInput } from './adapters';
// Note: `createAIProxyHandler` lives in `src/server.ts` (sub-path
// `@pubwave/editor/server`) to keep React/Tiptap out of server-only bundles.
