/**
 * Playwright Integration Test Setup
 *
 * This module provides utilities for integration testing the editor
 * with Playwright, enabling realistic browser-based interaction tests.
 */

import { Page, Locator } from '@playwright/test';

/**
 * Editor test utilities
 */
export class EditorTestHelper {
  private page: Page;
  private editorSelector: string;

  constructor(page: Page, editorSelector = '[data-testid="pubwave-editor"]') {
    this.page = page;
    this.editorSelector = editorSelector;
  }

  /**
   * Get the editor container locator
   */
  getEditor(): Locator {
    return this.page.locator(this.editorSelector);
  }

  /**
   * Get the editor content area
   */
  getContent(): Locator {
    return this.page.locator(`${this.editorSelector} .ProseMirror`);
  }

  /**
   * Get the bubble toolbar
   */
  getToolbar(): Locator {
    return this.page.locator('[data-testid="bubble-toolbar"]');
  }

  /**
   * Get a specific toolbar button
   */
  getToolbarButton(action: 'bold' | 'italic' | 'link'): Locator {
    return this.page.locator(`[data-testid="toolbar-${action}"]`);
  }

  /**
   * Get a drag handle for a block
   */
  getDragHandle(blockIndex: number): Locator {
    return this.page
      .locator('[data-testid="drag-handle"]')
      .nth(blockIndex);
  }

  /**
   * Type text into the editor
   */
  async type(text: string): Promise<void> {
    await this.getContent().click();
    await this.page.keyboard.type(text);
  }

  /**
   * Press a key or key combination
   */
  async press(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Select text in the editor
   */
  async selectText(start: number, end: number): Promise<void> {
    const content = this.getContent();
    await content.click();

    // Triple-click to select all, then use keyboard to position
    await this.page.keyboard.press('Control+a');
    await this.page.keyboard.press('Home');

    // Move to start position
    for (let i = 0; i < start; i++) {
      await this.page.keyboard.press('ArrowRight');
    }

    // Select to end position
    for (let i = start; i < end; i++) {
      await this.page.keyboard.press('Shift+ArrowRight');
    }
  }

  /**
   * Select all content
   */
  async selectAll(): Promise<void> {
    await this.getContent().click();
    // Use Meta+a on Mac, Control+a on other platforms
    const isMac = process.platform === 'darwin';
    await this.page.keyboard.press(isMac ? 'Meta+a' : 'Control+a');
  }

  /**
   * Clear selection by pressing arrow key
   */
  async clearSelection(): Promise<void> {
    await this.page.keyboard.press('ArrowRight');
  }

  /**
   * Check if toolbar is visible
   */
  async isToolbarVisible(): Promise<boolean> {
    return this.getToolbar().isVisible();
  }

  /**
   * Wait for toolbar to become visible
   */
  async waitForToolbar(timeout = 5000): Promise<void> {
    await this.page.locator('.pubwave-toolbar.pubwave-toolbar--visible')
      .waitFor({ state: 'visible', timeout });
  }

  /**
   * Click a toolbar button
   */
  async clickToolbarButton(action: 'bold' | 'italic' | 'link'): Promise<void> {
    await this.getToolbarButton(action).click();
  }

  /**
   * Drag a block to a new position
   */
  async dragBlock(
    fromIndex: number,
    toIndex: number
  ): Promise<void> {
    const sourceHandle = this.getDragHandle(fromIndex);
    const targetHandle = this.getDragHandle(toIndex);

    const sourceBounds = await sourceHandle.boundingBox();
    const targetBounds = await targetHandle.boundingBox();

    if (!sourceBounds || !targetBounds) {
      throw new Error('Could not find drag handles');
    }

    // Perform drag operation
    await this.page.mouse.move(
      sourceBounds.x + sourceBounds.width / 2,
      sourceBounds.y + sourceBounds.height / 2
    );
    await this.page.mouse.down();
    await this.page.mouse.move(
      targetBounds.x + targetBounds.width / 2,
      targetBounds.y + targetBounds.height / 2,
      { steps: 10 }
    );
    await this.page.mouse.up();
  }

  /**
   * Cancel a drag operation with Escape
   */
  async cancelDrag(): Promise<void> {
    await this.page.keyboard.press('Escape');
  }

  /**
   * Wait for editor to be ready
   */
  async waitForReady(): Promise<void> {
    await this.getContent().waitFor({ state: 'visible' });
  }

  /**
   * Get the current content as JSON
   */
  async getContentJSON(): Promise<unknown> {
    return this.page.evaluate(() => {
      // Access editor instance from window (set up in example apps)
      const win = window as unknown as { pubwaveEditor?: { getJSON: () => unknown } };
      return win.pubwaveEditor?.getJSON() ?? null;
    });
  }

  /**
   * Check if a mark is active
   */
  async isMarkActive(mark: 'bold' | 'italic' | 'link'): Promise<boolean> {
    const button = this.getToolbarButton(mark);
    const isActive = await button.getAttribute('data-active');
    return isActive === 'true';
  }
}

/**
 * Navigate to the editor example page
 */
export async function navigateToEditor(
  page: Page,
  path = '/'
): Promise<EditorTestHelper> {
  await page.goto(path);
  const helper = new EditorTestHelper(page);
  await helper.waitForReady();
  return helper;
}

/**
 * Common test assertions
 */
export const assertions = {
  /**
   * Assert toolbar is hidden (for empty selection)
   */
  async toolbarHidden(helper: EditorTestHelper): Promise<void> {
    const isVisible = await helper.isToolbarVisible();
    if (isVisible) {
      throw new Error('Expected toolbar to be hidden, but it was visible');
    }
  },

  /**
   * Assert toolbar is visible (for non-empty selection)
   */
  async toolbarVisible(helper: EditorTestHelper): Promise<void> {
    const isVisible = await helper.isToolbarVisible();
    if (!isVisible) {
      throw new Error('Expected toolbar to be visible, but it was hidden');
    }
  },
};
