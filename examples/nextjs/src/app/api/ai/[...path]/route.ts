/**
 * AI proxy — catch-all route.
 *
 * One file, one line. The library's `createAIProxyHandler` dispatches to
 * the upstream provider based on the URL path:
 *
 *   /api/ai/openai/...     → OpenAI-compatible chat completions
 *   /api/ai/anthropic/...  → Anthropic Messages API
 *   /api/ai/gemini/...     → Google Gemini REST API
 *
 * Configure providers via env (any of `.env`, `.env.local`, or system env):
 *
 *   OPENAI_API_KEY,    OPENAI_BASE_URL    (optional)
 *   ANTHROPIC_API_KEY, ANTHROPIC_BASE_URL (optional)
 *   GOOGLE_API_KEY,    GOOGLE_BASE_URL    (optional)
 */

import { createAIProxyHandler } from '@pubwave/editor/server';

export const runtime = 'edge';
export const POST = createAIProxyHandler();
