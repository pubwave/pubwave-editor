/**
 * `@pubwave/editor/server`
 *
 * Server-only entry point. Contains the AI proxy handler and any other
 * helpers that must NOT pull React, Tiptap, ProseMirror or CSS into the
 * consumer's server bundle (Next.js route handlers, Hono routes,
 * Cloudflare Workers, Bun, Deno).
 *
 * Use:
 *
 *   // app/api/ai/[...path]/route.ts
 *   import { createAIProxyHandler } from '@pubwave/editor/server';
 *   export const POST = createAIProxyHandler();
 *   export const runtime = 'edge';
 */

export { createAIProxyHandler } from './core/ai/proxy';
export type { AIProxyConfig, ProxyProviderConfig } from './core/ai/proxy';
