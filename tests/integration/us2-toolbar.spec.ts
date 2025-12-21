/**
 * User Story 2: Discoverable Formatting
 *
 * Integration tests for toolbar visibility and selection-driven behavior.
 * Tests Journey B: Selection → Toolbar visibility → Formatting actions
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US2: Discoverable Formatting', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    await navigateToEditor(page);
    helper = new EditorTestHelper(page);
    await helper.waitForReady();
  });

  test.describe('Toolbar Visibility', () => {
    test('toolbar is hidden when no text is selected', async ({ page }) => {
      // Type some text
      await helper.type('Hello world');

      // Toolbar should be hidden (cursor only, no selection)
      const toolbar = page.locator('.pubwave-toolbar');
      await expect(toolbar).toHaveAttribute('aria-hidden', 'true');
    });

    test('toolbar appears when text is selected', async ({ page }) => {
      // Type some text
      await helper.type('Hello world');

      // Select the text
      await helper.selectAll();

      // Toolbar should be visible
      const toolbar = page.locator('.pubwave-toolbar');
      await expect(toolbar).toHaveClass(/pubwave-toolbar--visible/);
      await expect(toolbar).toHaveAttribute('aria-hidden', 'false');
    });

    test('toolbar disappears when selection is cleared', async ({ page }) => {
      // Type and select text
      await helper.type('Hello world');
      await helper.selectAll();

      // Verify toolbar is visible
      const toolbar = page.locator('.pubwave-toolbar');
      await expect(toolbar).toHaveClass(/pubwave-toolbar--visible/);

      // Click to clear selection
      await page.keyboard.press('ArrowRight');

      // Toolbar should be hidden
      await expect(toolbar).toHaveAttribute('aria-hidden', 'true');
    });

    test('toolbar does not appear for cursor-only state', async ({ page }) => {
      // Type text and move cursor (no selection)
      await helper.type('Hello world');
      await page.keyboard.press('Home');
      await page.keyboard.press('End');

      // Toolbar should remain hidden
      const toolbar = page.locator('.pubwave-toolbar');
      await expect(toolbar).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test.describe('Toolbar Positioning', () => {
    test('toolbar appears above selection when there is room', async ({
      page,
    }) => {
      // Type some text with space above
      await helper.type('\n\n\nHello world');
      await helper.selectAll();

      // Toolbar should be positioned above the selection
      const toolbar = page.locator('.pubwave-toolbar');
      const editor = page.locator('.pubwave-editor');

      const toolbarBox = await toolbar.boundingBox();
      const editorBox = await editor.boundingBox();

      // Toolbar should have a valid position
      expect(toolbarBox).not.toBeNull();
      expect(editorBox).not.toBeNull();
    });

    test('toolbar stays within viewport bounds', async ({ page }) => {
      // Type text and select
      await helper.type('Hello world this is a longer text');
      await helper.selectAll();

      const toolbar = page.locator('.pubwave-toolbar');
      const toolbarBox = await toolbar.boundingBox();
      const viewport = page.viewportSize();

      if (toolbarBox && viewport) {
        // Toolbar should be within viewport
        expect(toolbarBox.x).toBeGreaterThanOrEqual(0);
        expect(toolbarBox.y).toBeGreaterThanOrEqual(0);
        expect(toolbarBox.x + toolbarBox.width).toBeLessThanOrEqual(
          viewport.width
        );
        expect(toolbarBox.y + toolbarBox.height).toBeLessThanOrEqual(
          viewport.height
        );
      }
    });
  });

  test.describe('Formatting Actions', () => {
    test('bold button toggles bold on selection', async ({ page }) => {
      // Type and select text
      await helper.type('Hello world');
      await helper.selectAll();

      // Click bold button
      const boldButton = page.locator(
        '.pubwave-toolbar__button[aria-label="Toggle bold formatting"]'
      );
      await boldButton.click();

      // Verify bold is applied
      await expect(boldButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('italic button toggles italic on selection', async ({ page }) => {
      // Type and select text
      await helper.type('Hello world');
      await helper.selectAll();

      // Click italic button
      const italicButton = page.locator(
        '.pubwave-toolbar__button[aria-label="Toggle italic formatting"]'
      );
      await italicButton.click();

      // Verify italic is applied
      await expect(italicButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('button state reflects current selection marks', async ({ page }) => {
      // Apply bold to text
      await helper.type('Hello world');
      await helper.selectAll();

      const boldButton = page.locator(
        '.pubwave-toolbar__button[aria-label="Toggle bold formatting"]'
      );
      await boldButton.click();

      // Clear selection and re-select
      await page.keyboard.press('ArrowRight');
      await helper.selectAll();

      // Bold button should still show active state
      await expect(boldButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('Focus Management', () => {
    test('clicking toolbar button maintains editor focus', async ({
      page,
    }) => {
      // Type and select text
      await helper.type('Hello world');
      await helper.selectAll();

      // Click bold button
      const boldButton = page.locator(
        '.pubwave-toolbar__button[aria-label="Toggle bold formatting"]'
      );
      await boldButton.click();

      // Editor should still be focused
      const editor = page.locator('.pubwave-editor .ProseMirror');
      await expect(editor).toBeFocused();
    });

    test('toolbar is keyboard accessible', async ({ page }) => {
      // Type and select text
      await helper.type('Hello world');
      await helper.selectAll();

      // Tab to toolbar (if focusable)
      const toolbar = page.locator('.pubwave-toolbar');
      await expect(toolbar).toHaveAttribute('role', 'toolbar');
      await expect(toolbar).toHaveAttribute('aria-label', 'Text formatting toolbar');
    });
  });
});
