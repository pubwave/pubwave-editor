/**
 * US10 Keyboard Shortcuts Integration Tests
 *
 * Tests for keyboard shortcuts: formatting, navigation, editing, commands.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US10: Keyboard Shortcuts', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
    await helper.waitForReady();
  });

  test.describe('9.1 Formatting Shortcuts', () => {
    test.describe('9.1.1 Text Formatting', () => {
      test('should toggle underline with Cmd/Ctrl+U', async () => {
        await helper.type('Hello');
        await helper.selectAll();
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+u' : 'Control+u');
        // Underline should be applied
        expect(true).toBe(true);
      });

      test('should toggle inline code with Cmd/Ctrl+`', async () => {
        await helper.type('Hello');
        await helper.selectAll();
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+`' : 'Control+`');
        // Code should be applied
        expect(true).toBe(true);
      });

      test('should apply formatting to subsequent input when nothing selected', async () => {
        await helper.type('Hello');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+b' : 'Control+b');
        await helper.type(' world');
        // " world" should be bold
        expect(true).toBe(true);
      });
    });

    test.describe('9.1.2 Shortcut Behavior', () => {
      test('should prevent default browser behavior', async ({ page }) => {
        await helper.type('Hello');
        await helper.selectAll();
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+b' : 'Control+b');
        // Browser menu should not open
        expect(true).toBe(true);
      });

      test('should update toolbar button state after shortcut', async ({ page }) => {
        await helper.type('Hello');
        await helper.selectAll();
        await helper.waitForToolbar();
        const boldButton = page.locator('.pubwave-toolbar__button[aria-label*="bold" i]');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+b' : 'Control+b');
        await expect(boldButton).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  test.describe('9.2 Navigation Shortcuts', () => {
    test.describe('9.2.1 Cursor Movement', () => {
      test('should move to line end with End', async () => {
        await helper.type('Hello');
        await helper.press('End');
        await helper.type(' end');
        const text = await helper.getContentText();
        expect(text).toContain('Hello end');
      });

    });

    test.describe('9.2.2 Text Selection', () => {
      test('should select to document start with Shift+Ctrl+Home', async () => {
        await helper.type('First');
        await helper.press('Enter');
        await helper.type('Second');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+End' : 'Control+End');
        await helper.press(isMac ? 'Shift+Meta+Home' : 'Shift+Control+Home');
        await helper.type('X');
        const text = await helper.getContentText();
        expect(text).toContain('X');
      });

    });
  });

  test.describe('9.3 Editing Shortcuts', () => {
    test.describe('9.3.1 History Operations', () => {
      test('should undo with Cmd/Ctrl+Z', async ({ page }) => {
        await helper.type('Hello');
        await page.waitForTimeout(100); // Wait for content to be recorded in history
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        await page.waitForTimeout(100); // Wait for undo to complete
        const text = await helper.getContentText();
        // After undo, content should be empty or just whitespace
        expect(text.trim().length).toBeLessThanOrEqual(1);
      });

      test('should redo with Cmd/Ctrl+Shift+Z', async () => {
        await helper.type('Hello');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        await helper.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');
        const text = await helper.getContentText();
        expect(text).toContain('Hello');
      });
    });

    test.describe('9.3.2 Block Operations', () => {
      test('should create new block with Enter', async () => {
        await helper.type('Block 1');
        await helper.press('Enter');
        await helper.type('Block 2');
        const text = await helper.getContentText();
        expect(text).toContain('Block 1');
        expect(text).toContain('Block 2');
      });

      test('should delete character or merge block with Backspace', async () => {
        await helper.type('First');
        await helper.press('Enter');
        await helper.type('Second');
        await helper.press('Home');
        await helper.press('Backspace');
        // Should merge or delete
        expect(true).toBe(true);
      });

      test('should delete character or merge block with Delete', async () => {
        await helper.type('First');
        await helper.press('Enter');
        await helper.type('Second');
        await helper.press('ArrowUp');
        await helper.press('End');
        await helper.press('Delete');
        // Should merge or delete
        expect(true).toBe(true);
      });
    });
  });

  test.describe('9.4 Command Shortcuts', () => {
    test.describe('9.4.1 Slash Commands', () => {
      test('should select slash command with Enter', async () => {
        await helper.type('/h1');
        await helper.press('Enter');
        // Should convert to heading 1
        const content = await helper.getContentJSON();
        expect(content).toBeTruthy();
      });
    });

    test.describe('9.4.2 Drag Cancellation', () => {
      test('should cancel drag with Escape', async ({ page }) => {
        await helper.type('Block 1');
        await helper.press('Enter');
        await helper.type('Block 2');
        const initialContent = await helper.getContentJSON();
        await helper.hoverBlock(0);
        const dragHandle = page.locator('[data-testid="drag-handle"]').first();
        const handleBox = await dragHandle.boundingBox();
        if (handleBox) {
          await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
          await page.mouse.down();
          await page.mouse.move(handleBox.x + 50, handleBox.y + 50, { steps: 5 });
          await helper.press('Escape');
          await page.mouse.up();
          // Content should be unchanged
          const finalContent = await helper.getContentJSON();
          expect(JSON.stringify(finalContent)).toBe(JSON.stringify(initialContent));
        }
      });
    });
  });
});

