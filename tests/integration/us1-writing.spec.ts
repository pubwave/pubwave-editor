/**
 * US1 Writing Integration Tests
 *
 * Tests for Journey A: "Editing Feels Premium"
 * Validates typing stability, navigation, and focus behavior.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US1: Premium Writing Experience', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
  });

  test.describe('Typing Stability', () => {
    test('should allow typing without focus loss', async ({ page }) => {
      const content = helper.getContent();

      // Click to focus
      await content.click();

      // Type some text
      await page.keyboard.type('Hello, world!');

      // Verify text was entered
      const text = await content.innerText();
      expect(text).toContain('Hello, world!');
    });

    test('should create new block with Enter', async ({ page }) => {
      const content = helper.getContent();
      await content.click();

      // Type first line
      await page.keyboard.type('First paragraph');
      await page.keyboard.press('Enter');
      await page.keyboard.type('Second paragraph');

      // Verify both paragraphs exist
      const text = await content.innerText();
      expect(text).toContain('First paragraph');
      expect(text).toContain('Second paragraph');
    });

    test('should maintain cursor position during typing', async ({ page }) => {
      const content = helper.getContent();
      await content.click();

      // Type, move cursor, type more
      await page.keyboard.type('Hello');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.type('XX');

      // Verify insertion happened in the middle
      const text = await content.innerText();
      expect(text).toContain('HelXXlo');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate between blocks with arrow keys', async ({ page }) => {
      const content = helper.getContent();
      await content.click();

      // Create multiple blocks
      await page.keyboard.type('Block 1');
      await page.keyboard.press('Enter');
      await page.keyboard.type('Block 2');
      await page.keyboard.press('Enter');
      await page.keyboard.type('Block 3');

      // Navigate up
      await page.keyboard.press('ArrowUp');
      await page.keyboard.type(' - edited');

      const text = await content.innerText();
      expect(text).toContain('Block 2 - edited');
    });

    test('should allow selecting text with Shift+Arrow', async ({ page }) => {
      const content = helper.getContent();
      await content.click();

      await page.keyboard.type('Select this text');

      // Use platform-specific shortcut to go to start of line
      const isMac = process.platform === 'darwin';
      await page.keyboard.press(isMac ? 'Meta+ArrowLeft' : 'Home');

      // Select first word using Shift+Right Arrow
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Shift+ArrowRight');
      }

      // The selection should exist (toolbar might appear)
      // We're just testing that selection doesn't break
      await page.keyboard.type('Replaced');

      const text = await content.innerText();
      expect(text).toContain('Replaced');
      expect(text).toContain('this text');
    });

    test('should select all with Ctrl+A', async ({ page }) => {
      const content = helper.getContent();
      await content.click();

      await page.keyboard.type('Some text');
      // Use platform-specific modifier
      const isMac = process.platform === 'darwin';
      await page.keyboard.press(isMac ? 'Meta+a' : 'Control+a');
      await page.keyboard.type('All replaced');

      const text = await content.innerText();
      expect(text).toBe('All replaced');
    });
  });

  test.describe('Mouse Interaction', () => {
    test('should place cursor on click', async ({ page }) => {
      const content = helper.getContent();

      // Initial click to focus and add content
      await content.click();
      await page.keyboard.type('Click anywhere in this text');

      // Click somewhere in the content
      const box = await content.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 50, box.y + 10);
      }

      // Type at new position - should work
      await page.keyboard.type('X');

      const text = await content.innerText();
      expect(text).toContain('X');
    });

    test('should maintain focus after clicking outside then back', async ({
      page,
    }) => {
      const content = helper.getContent();
      await content.click();
      await page.keyboard.type('Initial text');

      // Click outside editor
      await page.mouse.click(10, 10);

      // Click back in editor
      await content.click();

      // Should be able to continue typing
      await page.keyboard.type(' more text');

      const text = await content.innerText();
      expect(text).toContain('more text');
    });
  });

  test.describe('Visual Stability', () => {
    test('should not cause layout shift during typing', async ({ page }) => {
      const content = helper.getContent();
      await content.click();

      // Get initial position
      const initialBox = await content.boundingBox();

      // Type a lot of text
      await page.keyboard.type('This is a longer paragraph with more content.');
      await page.keyboard.press('Enter');
      await page.keyboard.type('Second paragraph.');

      // Get final position
      const finalBox = await content.boundingBox();

      // Editor should not have shifted horizontally
      expect(finalBox?.x).toBe(initialBox?.x);
    });

    test('should handle rapid typing without lag', async ({ page }) => {
      const content = helper.getContent();
      await content.click();

      const testString = 'The quick brown fox jumps over the lazy dog.';

      // Type rapidly
      await page.keyboard.type(testString, { delay: 10 });

      // All characters should be present
      const text = await content.innerText();
      expect(text).toContain(testString);
    });
  });

  test.describe('Read-Only Mode', () => {
    // Note: This test requires the example app to support read-only toggle
    test.skip('should not allow editing in read-only mode', async ({ page }) => {
      // Set read-only mode (would require UI toggle or URL param)
      // await page.goto('/?readonly=true');

      const content = helper.getContent();

      // Attempt to type
      await content.click();
      await page.keyboard.type('Should not appear');

      // Content should be unchanged
      const text = await content.innerText();
      expect(text).not.toContain('Should not appear');
    });
  });
});
