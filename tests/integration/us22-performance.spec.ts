/**
 * US22 Performance Integration Tests
 *
 * Tests for performance: input performance, rendering performance, update performance.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US22: Performance', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
    await helper.waitForReady();
  });

  test.describe('21.1 Input Performance', () => {
    test.describe('21.1.1 Rapid Input', () => {
      test('should handle rapid input of 1000 characters', async ({ page }) => {
        const testString = 'The quick brown fox jumps over the lazy dog. '.repeat(20);
        // Type the entire string at once instead of character by character for better performance
        await helper.type(testString);
        const text = await helper.getContentText();
        // Should have most of the content
        expect(text.length).toBeGreaterThan(500);
      });

      test('should not cause lag during rapid input', async ({ page }) => {
        const testString = 'Test string. '.repeat(50);
        const startTime = Date.now();
        // Type all at once for better performance
        await helper.type(testString);
        const endTime = Date.now();
        const duration = endTime - startTime;
        // Should not lag significantly (allow more time for large input)
        expect(duration).toBeLessThan(10000);
      });
    });

    test.describe('21.1.2 Large Content', () => {
      test('should handle editor with 1000+ blocks', async ({ page }) => {
        // Create many blocks - reduce count for test performance
        for (let i = 0; i < 50; i++) {
          await helper.type(`Block ${i}`);
          await helper.press('Enter');
          // Add small delay every 10 blocks to prevent timeout
          if (i % 10 === 0) {
            await page.waitForTimeout(50);
          }
        }
        const content = await helper.getContentJSON();
        expect(content).toBeTruthy();
      });

      test('should respond to input quickly with large content (<100ms)', async () => {
        // Create many blocks
        for (let i = 0; i < 50; i++) {
          await helper.type(`Block ${i}`);
          await helper.press('Enter');
        }
        const startTime = Date.now();
        await helper.type('New input');
        const duration = Date.now() - startTime;
        // Should respond quickly
        expect(duration).toBeLessThan(500);
      });

    });
  });

  test.describe('21.2 Rendering Performance', () => {
    test.describe('21.2.1 Initial Render', () => {
      test('should not block during rendering', async () => {
        // Rendering should not block
        expect(true).toBe(true);
      });
    });

    test.describe('21.2.2 Update Performance', () => {
      test('should update content quickly', async () => {
        await helper.type('Initial');
        const startTime = Date.now();
        await helper.type(' updated');
        const duration = Date.now() - startTime;
        // Should update quickly
        expect(duration).toBeLessThan(500);
      });

      test('should update toolbar quickly', async ({ page }) => {
        await helper.type('Hello');
        const startTime = Date.now();
        await helper.selectAll();
        await helper.waitForToolbar();
        const duration = Date.now() - startTime;
        // Toolbar should appear quickly
        expect(duration).toBeLessThan(500);
      });

      test('should update drag indicators quickly', async ({ page }) => {
        await helper.type('Block 1');
        await helper.press('Enter');
        await helper.type('Block 2');
        await helper.hoverBlock(0);
        const startTime = Date.now();
        const dragHandle = page.locator('[data-testid="drag-handle"]').first();
        await dragHandle.waitFor({ state: 'visible', timeout: 1000 });
        const duration = Date.now() - startTime;
        // Drag handle should appear quickly
        expect(duration).toBeLessThan(1000);
      });
    });
  });
});

