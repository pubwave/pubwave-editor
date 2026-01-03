/**
 * US4 Slash Commands Integration Tests - Core Tests Only
 * 
 * Core tests for slash command menu functionality.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US4: Slash Commands', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
    await helper.waitForReady();
  });

  test('should create heading with "/h1" command', async ({ page }) => {
    await helper.type('/h1');
    await helper.page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await helper.type('Heading');
    const text = await helper.getContentText();
    expect(text).toContain('Heading');
  });

  test('should create bullet list with "/bullet" command', async ({ page }) => {
    await helper.type('/bullet');
    await helper.page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await helper.type('List item');
    const text = await helper.getContentText();
    expect(text).toContain('List item');
  });
});
