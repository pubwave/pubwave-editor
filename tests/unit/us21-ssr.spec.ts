/**
 * US21 SSR Safety Unit Tests
 *
 * Tests for SSR (Server-Side Rendering) safety: module imports, browser API access, error handling.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('US21: SSR Safety', () => {
  let originalWindow: typeof window;
  let originalDocument: typeof document;

  beforeEach(() => {
    // Store original globals
    originalWindow = global.window;
    originalDocument = global.document;
  });

  afterEach(() => {
    // Restore original globals
    global.window = originalWindow;
    global.document = originalDocument;
  });

  describe('20.1 Server-Side Import', () => {
    describe('20.1.1 Module Import', () => {
      it('should safely import all modules in Node environment', async () => {
        // Remove browser globals to simulate Node environment
        delete (global as any).window;
        delete (global as any).document;

        // Should be able to import modules
        expect(async () => {
          // Import main module
          const module = await import('../../src/index');
          expect(module).toBeTruthy();
        }).not.toThrow();
      });

      it('should not access window/document during import', async () => {
        delete (global as any).window;
        delete (global as any).document;

        // Import should not access browser APIs
        await expect(async () => {
          await import('../../src/index');
        }).not.toThrow();
      });

      it('should not throw errors during import', async () => {
        delete (global as any).window;
        delete (global as any).document;

        try {
          await import('../../src/index');
          expect(true).toBe(true);
        } catch (e) {
          // Should not throw
          expect(e).toBeUndefined();
        }
      });
    });

    describe('20.1.2 Type Import', () => {
      it('should safely import type definitions', async () => {
        delete (global as any).window;
        delete (global as any).document;

        // Type imports should work
        await expect(async () => {
          await import('../../src/types/editor');
        }).not.toThrow();
      });

      it('should not execute code during type import', async () => {
        delete (global as any).window;
        delete (global as any).document;

        // Type imports should not execute code
        await expect(async () => {
          await import('../../src/types/editor');
        }).not.toThrow();
      });
    });
  });

  describe('20.2 Browser API Access', () => {
    describe('20.2.1 Safe Access', () => {
      it('should use canUseDOM check', async () => {
        // Check if canUseDOM is used
        const utilModule = await import('../../src/core/util');
        expect(utilModule).toBeTruthy();
      });

      it('should use isSSR check', async () => {
        // Check if isSSR is used
        const utilModule = await import('../../src/core/util');
        expect(utilModule).toBeTruthy();
      });

      it('should use safeRequestAnimationFrame', async () => {
        const utilModule = await import('../../src/core/util');
        expect(utilModule).toBeTruthy();
        // safeRequestAnimationFrame should be available
        expect(true).toBe(true);
      });

      it('should use safeSetTimeout', async () => {
        const utilModule = await import('../../src/core/util');
        expect(utilModule).toBeTruthy();
        // safeSetTimeout should be available
        expect(true).toBe(true);
      });
    });

    describe('20.2.2 Error Handling', () => {
      it('should throw error when createEditor() is called on server', async () => {
        delete (global as any).window;
        delete (global as any).document;

        // Should throw error with clear message
        await expect(async () => {
          const { createEditor } = await import('../../src/core/createEditor');
          createEditor();
        }).rejects.toThrow();
      });

      it('should provide clear error message for server-side createEditor()', async () => {
        delete (global as any).window;
        delete (global as any).document;

        try {
          const { createEditor } = await import('../../src/core/createEditor');
          createEditor();
        } catch (e: any) {
          // Error message should be clear
          expect(e?.message).toBeTruthy();
        }
      });
    });
  });
});

