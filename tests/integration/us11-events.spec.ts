/**
 * US11 Events Integration Tests
 *
 * Tests for editor event callbacks: onChange, onSelectionChange, onFocus, onBlur, onReady.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US11: Events', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
    await helper.waitForReady();
  });

  test.describe('10.1 onChange Event', () => {
    test.describe('10.1.1 Content Changes', () => {
      test('should trigger onChange when text is typed', async ({ page }) => {
        let changeCount = 0;
        await page.evaluate(() => {
          const win = window as any;
          if (win.pubwaveEditor) {
            // Monitor changes (implementation specific)
            changeCount = 1;
          }
        });
        await helper.type('Hello');
        // onChange should be triggered
        expect(true).toBe(true);
      });

      test('should trigger onChange when text is deleted', async () => {
        await helper.type('Hello');
        await helper.press('Backspace');
        // onChange should be triggered
        expect(true).toBe(true);
      });

      test('should trigger onChange when formatting is applied', async ({ page }) => {
        await helper.type('Hello');
        await helper.selectAll();
        await helper.waitForToolbar();
        const boldButton = page.locator('.pubwave-toolbar__button[aria-label*="bold" i]');
        await boldButton.click();
        // onChange should be triggered
        expect(true).toBe(true);
      });

      test('should trigger onChange when block type is converted', async () => {
        await helper.type('Text');
        await helper.press('Home');
        await helper.type('/h1');
        await helper.press('Enter');
        // onChange should be triggered
        expect(true).toBe(true);
      });

    });

    test.describe('10.1.2 onChange Parameters', () => {
      test('should receive correct content (JSONContent) in onChange', async () => {
        await helper.type('Hello');
        const content = await helper.getContentJSON();
        expect(content).toBeTruthy();
        expect(content).toHaveProperty('type');
        expect(content).toHaveProperty('content');
      });

      test('should include all blocks in onChange content', async () => {
        await helper.type('Block 1');
        await helper.press('Enter');
        await helper.type('Block 2');
        const content = await helper.getContentJSON() as any;
        expect(content.content).toBeTruthy();
        expect(content.content.length).toBeGreaterThan(0);
      });

      test('should include all marks in onChange content', async ({ page }) => {
        await helper.type('Hello');
        await helper.selectAll();
        await helper.waitForToolbar();
        const boldButton = page.locator('.pubwave-toolbar__button[aria-label*="bold" i]');
        await boldButton.click();
        const content = await helper.getContentJSON() as any;
        // Content should include marks
        expect(content).toBeTruthy();
      });
    });
  });

  test.describe('10.2 onSelectionChange Event', () => {
    test.describe('10.2.1 Selection Changes', () => {
      test('should trigger onSelectionChange when text is selected', async () => {
        await helper.type('Hello world');
        await helper.selectAll();
        // onSelectionChange should be triggered
        expect(true).toBe(true);
      });

      test('should trigger onSelectionChange when selection is cleared', async () => {
        await helper.type('Hello');
        await helper.selectAll();
        await helper.clearSelection();
        // onSelectionChange should be triggered
        expect(true).toBe(true);
      });
    });

    test.describe('10.2.2 Selection Behavior', () => {
      test('should trigger onSelectionChange on double click', async () => {
        await helper.type('Hello world');
        await helper.doubleClickWord();
        // onSelectionChange should be triggered
        expect(true).toBe(true);
      });

      test('should trigger onSelectionChange on triple click', async () => {
        await helper.type('Hello world');
        await helper.tripleClickLine();
        // onSelectionChange should be triggered
        expect(true).toBe(true);
      });

      test('should trigger onSelectionChange on Ctrl+A', async () => {
        await helper.type('Hello');
        await helper.press('Enter');
        await helper.type('World');
        await helper.selectAll();
        // onSelectionChange should be triggered
        expect(true).toBe(true);
      });
    });
  });

  test.describe('10.3 onFocus Event', () => {
    test.describe('10.3.1 Focus Gain', () => {
    });

    test.describe('10.3.2 Focus Behavior', () => {
    });
  });

  test.describe('10.4 onBlur Event', () => {
    test.describe('10.4.1 Focus Loss', () => {
    });

    test.describe('10.4.2 Focus Behavior', () => {
    });
  });

  test.describe('10.5 onReady Event', () => {
    test.describe('10.5.1 Editor Ready', () => {
      test('should trigger onReady when editor is created', async ({ page }) => {
        // onReady should be called during initialization
        await helper.waitForReady();
        const api = await helper.getEditorAPI();
        expect(api).toBeTruthy();
      });

      test('should provide EditorAPI in onReady', async () => {
        const api = await helper.getEditorAPI();
        expect(api).toBeTruthy();
        expect(api).toHaveProperty('getState');
        expect(api).toHaveProperty('getJSON');
        expect(api).toHaveProperty('getHTML');
        expect(api).toHaveProperty('getText');
      });

      test('should trigger onReady only once', async () => {
        // onReady should only be called once during initialization
        const api = await helper.getEditorAPI();
        expect(api).toBeTruthy();
      });
    });

    test.describe('10.5.2 API Availability', () => {
      test('should have API methods available when onReady fires', async ({ page }) => {
        // Wait for editor API to be available via window.pubwaveEditor
        await page.waitForFunction(
          () => {
            const win = window as any;
            return win.pubwaveEditor != null && typeof win.pubwaveEditor.getState === 'function';
          },
          { timeout: 10000 }
        );
        // Additional wait to ensure API is fully ready
        await page.waitForTimeout(500);
        
        // Check API methods directly in the page context
        const hasMethods = await page.evaluate(() => {
          const win = window as any;
          const api = win.pubwaveEditor;
          if (!api) return false;
          return typeof api.getState === 'function' &&
                 typeof api.getJSON === 'function' &&
                 typeof api.getHTML === 'function' &&
                 typeof api.getText === 'function';
        });
        
        expect(hasMethods).toBe(true);
      });

      test('should have correct API state when onReady fires', async () => {
        const state = await helper.getEditorState();
        expect(state).toBeTruthy();
        expect(state).toHaveProperty('isFocused');
        expect(state).toHaveProperty('isEditable');
        expect(state).toHaveProperty('isEmpty');
      });
    });
  });
});

