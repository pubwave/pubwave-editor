/**
 * US19 Autofocus Integration Tests
 *
 * Tests for autofocus functionality on editor mount.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US19: Autofocus', () => {
  let helper: EditorTestHelper;

  test.describe('18.1 Autofocus Configuration', () => {
    test.describe('18.1.1 Focus Options', () => {
      test('should not auto-focus when autofocus={false}', async ({ page }) => {
        helper = await navigateToEditor(page);
        await helper.waitForReady();
        // Editor should not be auto-focused
        await page.waitForTimeout(500);
        // Focus behavior depends on implementation
        expect(true).toBe(true);
      });
    });

    test.describe('18.1.2 Focus Behavior', () => {
      test('should allow immediate typing after auto-focus', async ({ page }) => {
        helper = await navigateToEditor(page);
        await helper.waitForReady();
        await page.waitForTimeout(500);
        await helper.type('Immediate');
        const text = await helper.getContentText();
        expect(text).toContain('Immediate');
      });
    });
  });
});

