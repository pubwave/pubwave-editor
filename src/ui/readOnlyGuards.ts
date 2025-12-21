/**
 * Read-Only Mode Guards
 *
 * Provides utilities and guards for handling read-only mode.
 * When the editor is in read-only mode, all editing affordances should be hidden.
 */

import type { Editor } from '@tiptap/core';

/**
 * Check if the editor is in read-only mode
 */
export function isReadOnly(editor: Editor | null): boolean {
  if (!editor) return true;
  return !editor.isEditable;
}

/**
 * Check if the editor is editable (inverse of read-only)
 */
export function isEditable(editor: Editor | null): boolean {
  if (!editor) return false;
  return editor.isEditable;
}

/**
 * Guard function for UI components
 * Returns true if the component should be rendered (editable mode)
 */
export function shouldRenderEditUI(editor: Editor | null): boolean {
  return isEditable(editor);
}

/**
 * Guard function for toolbar visibility
 * Returns true if toolbar should potentially be visible
 * (Still depends on selection state)
 */
export function shouldAllowToolbar(editor: Editor | null): boolean {
  return isEditable(editor);
}

/**
 * Guard function for drag handles
 * Returns true if drag handles should be visible
 */
export function shouldShowDragHandle(editor: Editor | null): boolean {
  return isEditable(editor);
}

/**
 * Guard function for any interactive element
 * Returns true if interactive elements should be enabled
 */
export function shouldAllowInteraction(editor: Editor | null): boolean {
  return isEditable(editor);
}

/**
 * CSS class helper for read-only state
 */
export function getReadOnlyClassName(editor: Editor | null): string {
  return isReadOnly(editor) ? 'pubwave-editor--readonly' : '';
}

/**
 * Props helper for read-only mode
 * Returns props that should be applied to interactive elements
 */
export function getReadOnlyProps(editor: Editor | null): {
  'aria-disabled': boolean;
  tabIndex: number;
} {
  const readOnly = isReadOnly(editor);
  return {
    'aria-disabled': readOnly,
    tabIndex: readOnly ? -1 : 0,
  };
}

/**
 * Event handler guard
 * Wraps an event handler to prevent execution in read-only mode
 */
export function guardHandler<T extends (...args: unknown[]) => void>(
  editor: Editor | null,
  handler: T
): T | (() => void) {
  if (isReadOnly(editor)) {
    return () => {
      // No-op in read-only mode
    };
  }
  return handler;
}
