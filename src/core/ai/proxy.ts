/**
 * AI proxy handler
 *
 * A framework-agnostic `Request → Response` function that forwards calls
 * from the browser-side AI adapters to the upstream provider, injecting
 * server-side API keys so they never reach the browser.
 *
 * Designed to be a one-line drop-in for any runtime that speaks Web
 * standards — Next.js App Router, Hono, Cloudflare Workers, Bun, Deno,
 * Vercel functions:
 *
 *   // Next.js: app/api/ai/[...path]/route.ts
 *   export const POST = createAIProxyHandler();
 *   export const runtime = 'edge';
 *
 *   // Hono:
 *   app.post('/api/ai/*', (c) => createAIProxyHandler()(c.req.raw));
 *
 *   // Cloudflare Worker:
 *   export default { fetch: createAIProxyHandler() };
 *
 * Path routing (relative to the configured `prefix`, default `/api/ai`):
 *   /openai/...     → OpenAI-compatible upstream (any chat-completions API)
 *   /anthropic/...  → Anthropic Messages API (with x-api-key + version header)
 *   /gemini/...     → Google Gemini REST API (with key query param)
 *
 * Streams are passed through end-to-end without buffering.
 */

export interface ProxyProviderConfig {
  /** API key. Falls back to the matching env var when omitted. */
  apiKey?: string;
  /** Upstream base URL. Falls back to provider default when omitted. */
  baseURL?: string;
  /** Set false to explicitly disable this provider. */
  enabled?: boolean;
}

export interface AIProxyConfig {
  /** URL path prefix the handler is mounted at. Default `/api/ai`. */
  prefix?: string;
  openai?: ProxyProviderConfig;
  anthropic?: ProxyProviderConfig & {
    /** Anthropic API version. Defaults to env or `2023-06-01`. */
    version?: string;
  };
  gemini?: ProxyProviderConfig;
  /** Override `fetch` (testing, queueing, retries). */
  fetch?: typeof fetch;
}

const DEFAULT_PREFIX = '/api/ai';
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_ANTHROPIC_BASE_URL = 'https://api.anthropic.com';
const DEFAULT_ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta';

export function createAIProxyHandler(
  config: AIProxyConfig = {}
): (request: Request) => Promise<Response> {
  const fetchImpl = config.fetch ?? globalThis.fetch;
  const prefix = (config.prefix ?? DEFAULT_PREFIX).replace(/\/+$/, '');

  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') {
      return jsonError(405, 'Method Not Allowed');
    }

    const url = new URL(request.url);
    const sub = stripPrefix(url.pathname, prefix);

    if (sub.startsWith('/openai/')) {
      return forwardOpenAI(
        request,
        sub.slice('/openai'.length),
        config.openai,
        fetchImpl
      );
    }
    if (sub.startsWith('/anthropic/')) {
      return forwardAnthropic(
        request,
        sub.slice('/anthropic'.length),
        config.anthropic,
        fetchImpl
      );
    }
    if (sub.startsWith('/gemini/')) {
      return forwardGemini(
        request,
        sub.slice('/gemini'.length),
        url.searchParams,
        config.gemini,
        fetchImpl
      );
    }

    return jsonError(404, `Unknown AI provider path: ${sub}`);
  };
}

async function forwardOpenAI(
  request: Request,
  subPath: string,
  config: ProxyProviderConfig | undefined,
  fetchImpl: typeof fetch
): Promise<Response> {
  if (config?.enabled === false) return jsonError(403, 'OpenAI proxy disabled');
  const apiKey = config?.apiKey ?? readEnv('OPENAI_API_KEY');
  if (!apiKey) return jsonError(500, missingKey('OPENAI_API_KEY'));

  const baseURL = trimEnd(
    config?.baseURL ?? readEnv('OPENAI_BASE_URL') ?? DEFAULT_OPENAI_BASE_URL
  );

  return passthrough(
    await fetchImpl(`${baseURL}${subPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${apiKey}`,
      },
      body: request.body,
      ...streamingInit(request),
    })
  );
}

async function forwardAnthropic(
  request: Request,
  subPath: string,
  config: (ProxyProviderConfig & { version?: string }) | undefined,
  fetchImpl: typeof fetch
): Promise<Response> {
  if (config?.enabled === false)
    return jsonError(403, 'Anthropic proxy disabled');
  const apiKey = config?.apiKey ?? readEnv('ANTHROPIC_API_KEY');
  if (!apiKey) return jsonError(500, missingKey('ANTHROPIC_API_KEY'));

  const baseURL = trimEnd(
    config?.baseURL ??
      readEnv('ANTHROPIC_BASE_URL') ??
      DEFAULT_ANTHROPIC_BASE_URL
  );
  const version =
    config?.version ?? readEnv('ANTHROPIC_VERSION') ?? DEFAULT_ANTHROPIC_VERSION;

  return passthrough(
    await fetchImpl(`${baseURL}${subPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'x-api-key': apiKey,
        'anthropic-version': version,
      },
      body: request.body,
      ...streamingInit(request),
    })
  );
}

async function forwardGemini(
  request: Request,
  subPath: string,
  incomingQuery: URLSearchParams,
  config: ProxyProviderConfig | undefined,
  fetchImpl: typeof fetch
): Promise<Response> {
  if (config?.enabled === false) return jsonError(403, 'Gemini proxy disabled');
  const apiKey =
    config?.apiKey ?? readEnv('GOOGLE_API_KEY') ?? readEnv('GEMINI_API_KEY');
  if (!apiKey) return jsonError(500, missingKey('GOOGLE_API_KEY'));

  const baseURL = trimEnd(
    config?.baseURL ?? readEnv('GOOGLE_BASE_URL') ?? DEFAULT_GEMINI_BASE_URL
  );

  // Carry through client query params (e.g. alt=sse) but force the server key.
  const query = new URLSearchParams(incomingQuery);
  query.set('key', apiKey);

  return passthrough(
    await fetchImpl(`${baseURL}${subPath}?${query.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: request.body,
      ...streamingInit(request),
    })
  );
}

function passthrough(upstream: Response): Response {
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type':
        upstream.headers.get('Content-Type') ?? 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}

function streamingInit(request: Request): RequestInit {
  return {
    // @ts-expect-error - Edge / Node 18+ require duplex when streaming a body
    duplex: 'half',
    signal: request.signal,
  };
}

function stripPrefix(path: string, prefix: string): string {
  if (!prefix) return path;
  return path.startsWith(prefix) ? path.slice(prefix.length) : path;
}

function trimEnd(value: string): string {
  return value.replace(/\/+$/, '');
}

function readEnv(name: string): string | undefined {
  if (typeof process === 'undefined') return undefined;
  return process.env[name];
}

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function missingKey(name: string): string {
  return `${name} is not set. Define it in your environment (e.g. .env, .env.local, or system env) so the AI proxy can authenticate.`;
}
