/**
 * SSR Import Smoke Test
 *
 * This test verifies that the library can be safely imported in a Node.js
 * environment (like Next.js SSR) without throwing errors.
 *
 * The library must NOT access window/document at module top-level.
 *
 * Note: These tests run in jsdom environment, so isSSR will be false.
 * The important thing is that all imports succeed without errors.
 */

import { describe, it, expect } from 'vitest';

describe('SSR Import Safety', () => {
  it('should export isSSR and canUseDOM utilities', async () => {
    // Dynamic import to simulate SSR import behavior
    const { isSSR, canUseDOM } = await import('../../src/core/ssr');

    // In jsdom environment, these will indicate browser
    expect(typeof isSSR).toBe('boolean');
    expect(typeof canUseDOM).toBe('boolean');
  });

  it('should export types without errors', async () => {
    // Import types module - should not throw
    const types = await import('../../src/types/editor');

    // Verify exported types exist (as undefined values, since they're just types)
    expect(types).toBeDefined();
  });

  it('should export core utilities without errors', async () => {
    // Import extensions - should not throw even in Node environment
    const extensions = await import('../../src/core/extensions');

    expect(extensions.SUPPORTED_BLOCKS).toBeDefined();
    expect(extensions.SUPPORTED_MARKS).toBeDefined();
    expect(typeof extensions.createExtensions).toBe('function');
  });

  it('should export selection helpers without errors', async () => {
    const selection = await import('../../src/core/selection');

    expect(typeof selection.getSelectionState).toBe('function');
    expect(typeof selection.isSelectionEmpty).toBe('function');
    expect(typeof selection.shouldShowToolbar).toBe('function');
  });

  it('should export command helpers without errors', async () => {
    const commands = await import('../../src/core/commands');

    expect(typeof commands.toggleBold).toBe('function');
    expect(typeof commands.toggleItalic).toBe('function');
    expect(typeof commands.setLink).toBe('function');
  });

  it('should export createEditor factory without throwing on import', async () => {
    // Import should not throw - the function exists
    const { createEditor } = await import('../../src/core/createEditor');

    expect(typeof createEditor).toBe('function');
    // Note: In jsdom environment, createEditor() would work (not throw)
    // In true Node environment, it would throw "cannot be called server-side"
  });

  it('should export the main library index without errors', async () => {
    // The main entry point should be safe to import
    const index = await import('../../src/index');

    expect(index).toBeDefined();
    expect(typeof index.createEditor).toBe('function');
    expect(typeof index.isSSR).toBe('boolean');
    expect(typeof index.canUseDOM).toBe('boolean');
  });

  it('should detect jsdom as browser-like environment', async () => {
    const { isSSR, canUseDOM } = await import('../../src/core/ssr');

    // In jsdom environment (which mocks browser), isSSR is false
    // This is expected behavior - jsdom simulates a browser
    expect(isSSR).toBe(false);
    expect(canUseDOM).toBe(true);
  });
});
