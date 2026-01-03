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
  public readonly page: Page;
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

  /**
   * Get content as text
   */
  async getContentText(): Promise<string> {
    const api = await this.getEditorAPI();
    if (!api) return '';
    return await this.page.evaluate(() => {
      const win = window as any;
      return win.pubwaveEditor?.getText() ?? '';
    });
  }

  /**
   * Get editor API from window
   */
  async getEditorAPI(): Promise<any> {
    return this.page.evaluate(() => {
      const win = window as unknown as { pubwaveEditor?: any };
      return win.pubwaveEditor ?? null;
    });
  }

  /**
   * Get editor state
   */
  async getEditorState(): Promise<any> {
    const api = await this.getEditorAPI();
    if (!api) return null;
    return await this.page.evaluate(() => {
      const win = window as any;
      return win.pubwaveEditor?.getState() ?? null;
    });
  }

  /**
   * Clear content via API
   */
  async clearContent(): Promise<void> {
    await this.page.evaluate(() => {
      const win = window as any;
      if (win.pubwaveEditor) {
        win.pubwaveEditor.setContent({ type: 'doc', content: [] });
      }
    });
    await this.page.waitForTimeout(300);
  }

  /**
   * Double click to select a word
   */
  async doubleClickWord(): Promise<void> {
    const content = this.getContent();
    await content.click();
    const box = await content.boundingBox();
    if (box) {
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { clickCount: 2 });
    }
    await this.page.waitForTimeout(200);
  }

  /**
   * Triple click to select a line
   */
  async tripleClickLine(): Promise<void> {
    const content = this.getContent();
    await content.click();
    const box = await content.boundingBox();
    if (box) {
      await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { clickCount: 3 });
    }
    await this.page.waitForTimeout(200);
  }

  /**
   * Hover over a block to reveal drag handle
   */
  async hoverBlock(index: number): Promise<void> {
    const block = this.page.locator('.pubwave-block, .pubwave-editor__content > p, .pubwave-editor__content > h1, .pubwave-editor__content > h2, .pubwave-editor__content > h3').nth(index);
    await block.waitFor({ state: 'visible', timeout: 5000 });
    await block.hover();
    await this.page.waitForTimeout(500);
  }
}

/**
 * Navigate to the editor example page
 */
export async function navigateToEditor(
  page: Page,
  path = '/',
  clearContent = true
): Promise<EditorTestHelper> {
  await page.addInitScript(() => {
    (window as any).__TESTING__ = true;
  });
  await page.goto(path);
  const helper = new EditorTestHelper(page);
  await helper.waitForReady();
  
  await page.waitForFunction(
    () => {
      const win = window as any;
      return win.pubwaveEditor != null;
    },
    { timeout: 5000 }
  );
  
  if (clearContent) {
    await helper.clearContent();
    const text = await helper.getContentText();
    if (text.trim().length > 0) {
      await helper.clearContent();
      await page.waitForTimeout(300);
    }
  }
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
