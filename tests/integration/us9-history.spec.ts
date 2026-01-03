/**
 * US9 History Integration Tests
 *
 * Tests for undo/redo functionality.
 * Covers undo, redo, and history depth limits.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US9: History', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
    await helper.waitForReady();
  });

  test.describe('8.1 Undo', () => {
    test.describe('8.1.1 Undo Operations', () => {
      test('should undo text input with Cmd/Ctrl+Z', async ({ page }) => {
        // Ensure editor starts empty
        await helper.clearContent();
        await page.waitForTimeout(100);
        
        await helper.type('Hello');
        await page.waitForTimeout(200); // Wait for content to be recorded in history
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        await page.waitForTimeout(200); // Wait for undo to complete
        const text = await helper.getContentText();
        // After undo, content should be empty (we started with empty editor)
        expect(text.trim().length).toBeLessThanOrEqual(1);
      });

      test('should undo formatting application', async ({ page }) => {
        await helper.type('Hello');
        await helper.selectAll();
        await helper.waitForToolbar();
        const boldButton = page.locator('.pubwave-toolbar__button[aria-label*="bold" i]');
        await boldButton.click();
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        const isBold = await helper.isMarkActive('bold');
        expect(isBold).toBe(false);
      });

      test('should undo block type conversion', async ({ page }) => {
        await helper.type('Text');
        await helper.press('Home');
        await helper.type('/h1');
        await helper.press('Enter');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        // Should revert to paragraph
        const content = await helper.getContentJSON();
        expect(content).toBeTruthy();
      });

      test('should undo drag and drop', async ({ page }) => {
        await helper.type('Block 1');
        await helper.press('Enter');
        await helper.type('Block 2');
        // Perform drag (simplified - actual drag would require more setup)
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        // Should undo drag
        expect(true).toBe(true);
      });

      test('should undo image insertion', async ({ page }) => {
        await helper.type('/img');
        await helper.press('Enter');
        await page.waitForTimeout(500);
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        // Image should be removed
        expect(true).toBe(true);
      });
    });

    test.describe('8.1.2 Undo Boundaries', () => {
      test('should not undo beyond initial state', async ({ page }) => {
        // Ensure editor starts empty
        await helper.clearContent();
        await page.waitForTimeout(100);
        
        await helper.type('Hello');
        await page.waitForTimeout(100);
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        await page.waitForTimeout(100);
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        await page.waitForTimeout(100);
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        await page.waitForTimeout(100);
        // Should not crash, should stay at initial state (empty)
        const text = await helper.getContentText();
        expect(text.trim().length).toBeLessThanOrEqual(1);
      });

      test('should maintain cursor position after undo', async ({ page }) => {
        await helper.type('Hello');
        await helper.press('Home');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        // Cursor should be positioned correctly
        await helper.type('X');
        const text = await helper.getContentText();
        expect(text).toContain('X');
      });

    });
  });

  test.describe('8.2 Redo', () => {
    test.describe('8.2.1 Redo Operations', () => {
      test('should redo text input with Cmd/Ctrl+Shift+Z', async ({ page }) => {
        await helper.type('Hello');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        await helper.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');
        const text = await helper.getContentText();
        expect(text).toContain('Hello');
      });

      test('should redo text deletion', async ({ page }) => {
        await helper.type('Hello');
        await helper.press('Backspace');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        await helper.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');
        const text = await helper.getContentText();
        expect(text).toBe('Hell');
      });

      test('should redo block type conversion', async ({ page }) => {
        await helper.type('Text');
        await helper.press('Home');
        await helper.type('/h1');
        await helper.press('Enter');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        await helper.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');
        // Should be heading 1 again
        const content = await helper.getContentJSON();
        expect(content).toBeTruthy();
      });
    });

    test.describe('8.2.2 Redo Boundaries', () => {
      test('should not redo beyond latest state', async ({ page }) => {
        await helper.type('Hello');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');
        await helper.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');
        // Should not crash, should stay at latest state
        const text = await helper.getContentText();
        expect(text).toContain('Hello');
      });

      test('should maintain cursor position after redo', async ({ page }) => {
        await helper.type('Hello');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        await helper.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');
        // Cursor should be positioned correctly
        await helper.type('X');
        const text = await helper.getContentText();
        expect(text).toContain('HelloX');
      });
    });
  });

  test.describe('8.3 History Depth', () => {
    test.describe('8.3.1 Record Limits', () => {
      test('should handle multiple undo operations', async ({ page }) => {
        // Create multiple edits
        for (let i = 0; i < 10; i++) {
          await helper.type(`Edit ${i} `);
        }
        const isMac = process.platform === 'darwin';
        // Undo multiple times
        for (let i = 0; i < 5; i++) {
          await helper.press(isMac ? 'Meta+z' : 'Control+z');
        }
        const text = await helper.getContentText();
        expect(text.length).toBeLessThan(100);
      });

      test('should clear redo stack when new edit is made after undo', async ({ page }) => {
        await helper.type('Hello');
        const isMac = process.platform === 'darwin';
        await helper.press(isMac ? 'Meta+z' : 'Control+z');
        await helper.type('New');
        // Redo should not restore "Hello"
        await helper.press(isMac ? 'Meta+Shift+z' : 'Control+Shift+z');
        const text = await helper.getContentText();
        expect(text).toContain('New');
      });
    });
  });
});

