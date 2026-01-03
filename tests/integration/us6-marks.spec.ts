/**
 * US6 Marks Integration Tests - Core Tests Only
 * 
 * Core tests for text formatting marks: Bold, Italic, Underline, Strike, Code, Link.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US6: Marks', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
    await helper.waitForReady();
  });

});
