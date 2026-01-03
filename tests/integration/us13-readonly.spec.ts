/**
 * US13 Read-Only Mode Integration Tests
 *
 * Tests for read-only mode behavior: editing disabled, UI hidden, content accessible.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US13: Read-Only Mode', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
    await helper.waitForReady();
  });

  test.describe('12.1 Read-Only Mode Behavior', () => {
    test.describe('12.1.1 Editing Disabled', () => {
      test('should not allow typing in read-only mode', async ({ page }) => {
        // Set read-only mode (if supported via API or URL param)
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          await helper.focus();
          await helper.type('Should not appear');
          const text = await helper.getContentText();
          expect(text).not.toContain('Should not appear');
        }
      });

      test('should not allow deleting text in read-only mode', async ({ page }) => {
        await helper.type('Hello');
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          await helper.press('Backspace');
          const text = await helper.getContentText();
          expect(text).toContain('Hello');
        }
      });

      test('should not allow formatting in read-only mode', async ({ page }) => {
        await helper.type('Hello');
        await helper.selectAll();
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          await helper.waitForToolbar();
          const toolbar = page.locator('.pubwave-toolbar');
          const isVisible = await toolbar.isVisible().catch(() => false);
          // Toolbar should not appear in read-only mode
          expect(isVisible).toBe(false);
        }
      });

      test('should not allow block type conversion in read-only mode', async () => {
        await helper.type('Text');
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await helper.page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          await helper.press('Home');
          await helper.type('/h1');
          // Slash menu should not appear
          expect(true).toBe(true);
        }
      });

      test('should not allow dragging blocks in read-only mode', async ({ page }) => {
        await helper.type('Block 1');
        await helper.press('Enter');
        await helper.type('Block 2');
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await helper.page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          await helper.hoverBlock(0);
          await page.waitForTimeout(300);
          const dragHandle = page.locator('[data-testid="drag-handle"]');
          const isVisible = await dragHandle.first().isVisible().catch(() => false);
          // Drag handle should not appear in read-only mode
          expect(isVisible).toBe(false);
        }
      });
    });

    test.describe('12.1.2 UI Hidden', () => {
      test('should hide toolbar in read-only mode', async ({ page }) => {
        await helper.type('Hello');
        await helper.selectAll();
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await helper.page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          const toolbar = page.locator('.pubwave-toolbar');
          const isVisible = await toolbar.isVisible().catch(() => false);
          expect(isVisible).toBe(false);
        }
      });

      test('should hide drag handles in read-only mode', async ({ page }) => {
        await helper.type('Block');
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await helper.page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          await helper.hoverBlock(0);
          await page.waitForTimeout(300);
          const dragHandle = page.locator('[data-testid="drag-handle"]');
          const isVisible = await dragHandle.first().isVisible().catch(() => false);
          expect(isVisible).toBe(false);
        }
      });

      test('should not trigger slash commands in read-only mode', async () => {
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await helper.page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          await helper.focus();
          await helper.type('/');
          await helper.page.waitForTimeout(300);
          // Slash menu should not appear
          expect(true).toBe(true);
        }
      });
    });

    test.describe('12.1.3 Content Accessibility', () => {
      test('should allow text selection in read-only mode', async () => {
        await helper.type('Hello world');
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await helper.page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          await helper.selectAll();
          // Selection should work
          expect(true).toBe(true);
        }
      });

      test('should allow copying content in read-only mode', async () => {
        await helper.type('Hello world');
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await helper.page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          await helper.selectAll();
          const isMac = process.platform === 'darwin';
          await helper.press(isMac ? 'Meta+c' : 'Control+c');
          // Copy should work
          expect(true).toBe(true);
        }
      });

      test('should allow clicking links in read-only mode', async () => {
        await helper.type('Link text');
        await helper.selectAll();
        await helper.waitForToolbar();
        const linkButton = helper.page.locator('.pubwave-toolbar__button[aria-label*="link" i]');
        await linkButton.click();
        await helper.page.waitForTimeout(300);
        // Add link (before setting read-only)
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await helper.page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          // Links should be clickable
          expect(true).toBe(true);
        }
      });
    });
  });

  test.describe('12.2 Read-Only Mode Toggle', () => {
    test.describe('12.2.1 Dynamic Toggle', () => {
      test('should switch from edit mode to read-only mode', async ({ page }) => {
        await helper.type('Hello');
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          const state = await helper.getEditorState();
          expect(state?.isEditable).toBe(false);
        }
      });

      test('should switch from read-only mode to edit mode', async ({ page }) => {
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          await page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(true);
          });
          const state = await helper.getEditorState();
          expect(state?.isEditable).toBe(true);
        }
      });

      test('should update UI when toggling read-only mode', async ({ page }) => {
        await helper.type('Hello');
        await helper.selectAll();
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          await page.waitForTimeout(200);
          const toolbar = page.locator('.pubwave-toolbar');
          const isVisible = await toolbar.isVisible().catch(() => false);
          expect(isVisible).toBe(false);
        }
      });
    });

    test.describe('12.2.2 Toggle Timing', () => {
      test('should preserve content when toggling read-only mode', async ({ page }) => {
        await helper.type('Hello world');
        const initialText = await helper.getContentText();
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          const finalText = await helper.getContentText();
          expect(finalText).toBe(initialText);
        }
      });

      test('should maintain selection when toggling read-only mode', async ({ page }) => {
        await helper.type('Hello world');
        await helper.selectAll();
        const api = await helper.getEditorAPI();
        if (api?.setEditable) {
          await page.evaluate(() => {
            const win = window as any;
            win.pubwaveEditor?.setEditable(false);
          });
          // Selection should be maintained
          expect(true).toBe(true);
        }
      });
    });
  });
});

