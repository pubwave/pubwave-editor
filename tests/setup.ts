/**
 * Vitest test setup file
 * Configures the testing environment for unit and integration tests
 */

import '@testing-library/jest-dom/vitest';

// Mock window.matchMedia for tests that need it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }),
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe(): void {
    // No-op mock
  }
  unobserve(): void {
    // No-op mock
  }
  disconnect(): void {
    // No-op mock
  }
}

window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: readonly number[] = [];

  observe(): void {
    // No-op mock
  }
  unobserve(): void {
    // No-op mock
  }
  disconnect(): void {
    // No-op mock
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

window.IntersectionObserver = IntersectionObserverMock;

// Suppress Tiptap's async cleanup errors that occur after editor destruction
// These errors happen when Tiptap's internal setTimeout callbacks try to
// emit events after the editor has been destroyed. They don't affect test
// results and are safe to suppress in the test environment.
process.on('uncaughtException', (error: Error) => {
  // Check if this is a Tiptap cleanup error
  const isTiptapCleanupError =
    error.message?.includes('Cannot read properties of undefined') &&
    error.stack?.includes('EventEmitter.ts') &&
    error.stack?.includes('Editor.emit');

  if (isTiptapCleanupError) {
    // Suppress Tiptap cleanup errors - they don't affect test results
    return;
  }

  // Re-throw other errors
  throw error;
});
