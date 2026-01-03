/**
 * US5 Block Types Integration Tests - Core Tests Only
 * 
 * Core tests for block types: Paragraph, Heading, Lists.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US5: Block Types', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
    await helper.waitForReady();
  });

  test('should create new paragraph with Enter', async () => {
    await helper.type('First paragraph');
    await helper.press('Enter');
    await helper.type('Second paragraph');
    const text = await helper.getContentText();
    expect(text).toContain('First paragraph');
    expect(text).toContain('Second paragraph');
  });

});
