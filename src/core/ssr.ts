/**
 * SSR Safety Utilities
 *
 * This module provides utilities for safe SSR (Server-Side Rendering) integration.
 *
 * RULE: No window/document access at module top-level anywhere in the library.
 * All browser API access must be guarded by these utilities or occur in
 * useEffect/event handlers.
 *
 * This ensures the library can be safely imported in Node.js environments
 * like Next.js SSR without throwing errors.
 */

/**
 * Check if code is running in a server-side environment
 */
export const isSSR = typeof window === 'undefined';

/**
 * Check if DOM APIs are available
 * Use this before accessing window, document, or other browser APIs
 */
export const canUseDOM: boolean =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  typeof window.document.createElement === 'function';

/**
 * Safe wrapper for requestAnimationFrame
 * Returns a no-op function in SSR environments
 */
export function safeRequestAnimationFrame(
  callback: FrameRequestCallback
): number {
  if (canUseDOM) {
    return window.requestAnimationFrame(callback);
  }
  return 0;
}

/**
 * Safe wrapper for cancelAnimationFrame
 * No-ops in SSR environments
 */
export function safeCancelAnimationFrame(handle: number): void {
  if (canUseDOM) {
    window.cancelAnimationFrame(handle);
  }
}

/**
 * Safe wrapper for setTimeout that works in SSR
 */
export function safeSetTimeout(
  callback: () => void,
  delay: number
): ReturnType<typeof setTimeout> | null {
  if (canUseDOM) {
    return setTimeout(callback, delay);
  }
  return null;
}

/**
 * Safe wrapper for clearTimeout that works in SSR
 */
export function safeClearTimeout(
  handle: ReturnType<typeof setTimeout> | null
): void {
  if (handle !== null && canUseDOM) {
    clearTimeout(handle);
  }
}

/**
 * Execute a callback only in browser environments
 * Useful for one-off browser-only operations
 */
export function runInBrowser<T>(callback: () => T): T | undefined {
  if (canUseDOM) {
    return callback();
  }
  return undefined;
}

/**
 * Get a browser API safely, returning undefined in SSR
 * @deprecated Direct window access is discouraged; use specific safe* wrappers
 */
export function getBrowserAPI<K extends keyof Window>(
  key: K
): Window[K] | undefined {
  if (!canUseDOM) {
    return undefined;
  }
  if (!(key in window)) {
    return undefined;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (window as unknown as Record<string, Window[K]>)[key as string];
}
