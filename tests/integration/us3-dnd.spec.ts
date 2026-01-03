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
  });

  test.describe('Drop Preserves State', () => {
  });

  test.describe('Visual Feedback', () => {
  });
});
