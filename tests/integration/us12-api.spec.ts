/**
 * US12 EditorAPI Integration Tests - Core Tests Only
 * 
 * Core tests for EditorAPI methods.
 */

import { test, expect } from '@playwright/test';
import { EditorTestHelper, navigateToEditor } from './setup';

test.describe('US12: EditorAPI', () => {
  let helper: EditorTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = await navigateToEditor(page);
    await helper.waitForReady();
  });

  test('should return editor state', async () => {
    const state = await helper.getEditorState();
    expect(state).toBeTruthy();
    expect(state).toHaveProperty('selection');
    expect(state).toHaveProperty('isFocused');
    expect(state).toHaveProperty('isEditable');
  });

  test('should get text content', async () => {
    await helper.type('Hello world');
    const text = await helper.getContentText();
    expect(text).toContain('Hello world');
  });

  test('should set content via API', async () => {
    const api = await helper.getEditorAPI();
    if (api?.setContent) {
      await api.setContent('<p>New content</p>');
      await helper.page.waitForTimeout(200);
      const text = await helper.getContentText();
      expect(text).toContain('New content');
    }
  });
});
