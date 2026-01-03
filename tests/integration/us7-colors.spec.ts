/**
 * US7 Colors Integration Tests - Core Tests Only
 * 
 * Core tests for color picker functionality.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US7: Colors', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
    await helper.waitForReady();
  });

  test('should display color picker button in toolbar', async ({ page }) => {
    await helper.type('Hello world');
    await helper.selectAll();
    await helper.waitForToolbar();
    const colorPickerButton = page.locator('.pubwave-toolbar__button[aria-label*="color" i]');
    const isVisible = await colorPickerButton.isVisible().catch(() => false);
    expect(isVisible).toBe(true);
  });

});
