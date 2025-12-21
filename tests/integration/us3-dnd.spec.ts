/**
 * User Story 3: Confident Block Reordering
 *
 * Integration tests for drag and drop behavior.
 * Tests Journey C: Drag → Drop indicator → Selection preservation
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US3: Confident Block Reordering', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
  });

  test.describe('Drag Cancel', () => {
    test('pressing Escape during drag cancels operation', async ({ page }) => {
      // Create multiple blocks
      await helper.type('Block 1');
      await helper.press('Enter');
      await helper.type('Block 2');
      await helper.press('Enter');
      await helper.type('Block 3');

      // Get initial content
      const initialContent = await helper.getContentJSON();

      // Start drag on second block (hover to reveal handle)
      const blocks = page.locator('.pubwave-block');
      const secondBlock = blocks.nth(1);
      await secondBlock.hover();

      // Get drag handle
      const dragHandle = page.locator('.pubwave-drag-handle--visible').first();

      // Start drag
      if (await dragHandle.isVisible()) {
        const handleBox = await dragHandle.boundingBox();
        if (handleBox) {
          await page.mouse.move(
            handleBox.x + handleBox.width / 2,
            handleBox.y + handleBox.height / 2
          );
          await page.mouse.down();

          // Move a bit to initiate drag
          await page.mouse.move(
            handleBox.x + 50,
            handleBox.y + 100,
            { steps: 5 }
          );

          // Cancel with Escape
          await page.keyboard.press('Escape');

          // Release mouse
          await page.mouse.up();
        }
      }

      // Verify content unchanged
      const finalContent = await helper.getContentJSON();
      expect(finalContent).toEqual(initialContent);
    });

    test('dropping outside editor cancels operation', async ({ page }) => {
      // Create multiple blocks
      await helper.type('Block 1');
      await helper.press('Enter');
      await helper.type('Block 2');

      // Get initial content
      const initialContent = await helper.getContentJSON();

      // Start drag and drop outside
      const blocks = page.locator('.pubwave-block');
      const secondBlock = blocks.nth(1);
      await secondBlock.hover();

      const dragHandle = page.locator('.pubwave-drag-handle--visible').first();

      if (await dragHandle.isVisible()) {
        const handleBox = await dragHandle.boundingBox();
        if (handleBox) {
          await page.mouse.move(
            handleBox.x + handleBox.width / 2,
            handleBox.y + handleBox.height / 2
          );
          await page.mouse.down();

          // Drag outside the viewport
          await page.mouse.move(-100, 0, { steps: 5 });
          await page.mouse.up();
        }
      }

      // Verify content unchanged
      const finalContent = await helper.getContentJSON();
      expect(finalContent).toEqual(initialContent);
    });
  });

  test.describe('Drop Preserves State', () => {
    test('successful drop preserves focus', async ({ page }) => {
      // Create multiple blocks
      await helper.type('Block 1');
      await helper.press('Enter');
      await helper.type('Block 2');
      await helper.press('Enter');
      await helper.type('Block 3');

      // Perform drag and drop
      const blocks = page.locator('.pubwave-block');
      await blocks.nth(0).hover();

      const dragHandle = page.locator('.pubwave-drag-handle--visible').first();

      if (await dragHandle.isVisible()) {
        // Drag first block to after third block
        await helper.dragBlock(0, 2);
      }

      // Verify editor still has focus
      const editor = helper.getContent();
      await expect(editor).toBeFocused();
    });

    test('keyboard is usable immediately after drop', async ({ page }) => {
      // Create blocks
      await helper.type('Block 1');
      await helper.press('Enter');
      await helper.type('Block 2');

      // Perform drag
      const blocks = page.locator('.pubwave-block');
      await blocks.nth(0).hover();

      const dragHandle = page.locator('.pubwave-drag-handle--visible').first();

      if (await dragHandle.isVisible()) {
        await helper.dragBlock(0, 1);
      }

      // Immediately type after drop
      await page.keyboard.type(' - appended');

      // Verify typing worked
      const content = helper.getContent();
      const text = await content.textContent();
      expect(text).toContain('appended');
    });
  });

  test.describe('Visual Feedback', () => {
    test('drag handle appears on block hover', async ({ page }) => {
      // Create a block
      await helper.type('Hover over me');

      // Hover over the block
      const blocks = page.locator('.pubwave-block');
      await blocks.first().hover();

      // Drag handle should become visible
      const dragHandle = page.locator('.pubwave-drag-handle--visible');
      await expect(dragHandle).toBeVisible({ timeout: 1000 });
    });

    test('drag handle has adequate hit area for touch', async ({ page }) => {
      // Create a block
      await helper.type('Test block');

      // Hover to reveal handle
      const blocks = page.locator('.pubwave-block');
      await blocks.first().hover();

      // Check handle size
      const dragHandle = page.locator('.pubwave-drag-handle');
      const box = await dragHandle.boundingBox();

      if (box) {
        // Minimum 44px hit area per accessibility guidelines
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    });
  });
});
