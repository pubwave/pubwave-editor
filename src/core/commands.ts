/**
 * Command Layer
 *
 * Provides wrappers around Tiptap commands for use by UI components.
 * These commands are the primary interface for triggering editor actions.
 */

import type { Editor, ChainedCommands } from '@tiptap/core';

/**
 * Command result indicating success/failure
 */
export interface CommandResult {
  success: boolean;
  message?: string;
}

// =============================================================================
// Text Formatting Commands
// =============================================================================

/**
 * Toggle bold formatting on the current selection
 */
export function toggleBold(editor: Editor): boolean {
  return editor.chain().focus().toggleBold().run();
}

/**
 * Toggle italic formatting on the current selection
 */
export function toggleItalic(editor: Editor): boolean {
  return editor.chain().focus().toggleItalic().run();
}

/**
 * Set a link on the current selection
 */
export function setLink(editor: Editor, href: string): boolean {
  if (!href) {
    return editor.chain().focus().unsetLink().run();
  }
  return editor.chain().focus().setLink({ href }).run();
}

/**
 * Remove link from the current selection
 */
export function unsetLink(editor: Editor): boolean {
  return editor.chain().focus().unsetLink().run();
}

// =============================================================================
// Block Commands
// =============================================================================

/**
 * Set the current block to a paragraph
 */
export function setParagraph(editor: Editor): boolean {
  return editor.chain().focus().setParagraph().run();
}

/**
 * Set the current block to a heading
 */
export function setHeading(
  editor: Editor,
  level: 1 | 2 | 3 | 4 | 5 | 6
): boolean {
  return editor.chain().focus().setHeading({ level }).run();
}

/**
 * Toggle heading for the current block
 */
export function toggleHeading(
  editor: Editor,
  level: 1 | 2 | 3 | 4 | 5 | 6
): boolean {
  return editor.chain().focus().toggleHeading({ level }).run();
}

// =============================================================================
// History Commands
// =============================================================================

/**
 * Undo the last action
 */
export function undo(editor: Editor): boolean {
  return editor.chain().focus().undo().run();
}

/**
 * Redo the last undone action
 */
export function redo(editor: Editor): boolean {
  return editor.chain().focus().redo().run();
}

// =============================================================================
// Selection & Focus Commands
// =============================================================================

/**
 * Focus the editor
 */
export function focusEditor(
  editor: Editor,
  position?: 'start' | 'end' | 'all' | number
): boolean {
  return editor.chain().focus(position).run();
}

/**
 * Select all content
 */
export function selectAll(editor: Editor): boolean {
  return editor.chain().focus().selectAll().run();
}

/**
 * Clear all formatting from the selection
 */
export function clearFormatting(editor: Editor): boolean {
  return editor.chain().focus().unsetAllMarks().run();
}

// =============================================================================
// Utility Commands
// =============================================================================

/**
 * Create a chainable command sequence
 * This is useful for complex operations that need to be atomic
 */
export function createChain(editor: Editor): ChainedCommands {
  return editor.chain();
}

/**
 * Check if a command can be executed
 * Useful for determining button enabled/disabled state
 */
export function canExecute(
  editor: Editor,
  command: keyof Editor['commands']
): boolean {
  const can = editor.can();
  const chain = can.chain().focus();
  const commandFn = (chain as Record<string, unknown>)[command];
  if (typeof commandFn !== 'function') {
    return false;
  }
  const result: unknown = (commandFn as () => unknown)();
  if (
    typeof result === 'object' &&
    result !== null &&
    'run' in result &&
    typeof (result as { run: unknown }).run === 'function'
  ) {
    return ((result as { run: () => boolean }).run)();
  }
  return false;
}

/**
 * Check if a mark is currently active
 */
export function isMarkActive(editor: Editor, markType: string): boolean {
  return editor.isActive(markType);
}

/**
 * Check if a node type is currently active
 */
export function isNodeActive(
  editor: Editor,
  nodeType: string,
  attrs?: Record<string, unknown>
): boolean {
  return editor.isActive(nodeType, attrs);
}

/**
 * Get current marks at the selection
 */
export function getActiveMarks(editor: Editor): string[] {
  const marks: string[] = [];
  if (editor.isActive('bold')) marks.push('bold');
  if (editor.isActive('italic')) marks.push('italic');
  if (editor.isActive('link')) marks.push('link');
  return marks;
}

/**
 * Get the current link href if selection is inside a link
 */
export function getActiveLinkHref(editor: Editor): string | null {
  const attrs = editor.getAttributes('link') as { href?: string };
  return attrs.href ?? null;
}
