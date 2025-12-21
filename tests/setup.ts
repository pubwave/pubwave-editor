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
