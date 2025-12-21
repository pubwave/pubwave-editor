/**
 * Focus Management Utilities
 *
 * Provides predictable focus restoration after common operations.
 * Ensures a stable, non-jarring editing experience per constitution requirements.
 */

import type { Editor } from '@tiptap/core';
import { safeRequestAnimationFrame } from '../core/ssr';

/**
 * Focus position options
 */
export type FocusPosition = 'start' | 'end' | 'preserve' | number;

/**
 * Check if editor is valid for focus operations
 */
function isValidEditor(editor: Editor | null | undefined): editor is Editor {
  return Boolean(editor && !editor.isDestroyed);
}

/**
 * Focus the editor at a specific position
 */
export function focusAt(editor: Editor, position: FocusPosition): void {
  if (!isValidEditor(editor)) return;

  safeRequestAnimationFrame(() => {
    if (!isValidEditor(editor)) return;

    switch (position) {
      case 'start':
        editor.commands.focus('start');
        break;
      case 'end':
        editor.commands.focus('end');
        break;
      case 'preserve':
        // Focus without changing selection
        editor.commands.focus();
        break;
      default:
        // Focus at specific position
        if (typeof position === 'number') {
          editor.commands.setTextSelection(position);
          editor.commands.focus();
        }
    }
  });
}

/**
 * Restore focus after a DOM operation
 *
 * Use this after operations that might cause focus loss:
 * - Modal/dialog interactions
 * - Toolbar button clicks
 * - Context menu actions
 */
export function restoreFocus(editor: Editor): void {
  if (!isValidEditor(editor)) return;

  // Use RAF to ensure DOM has settled
  safeRequestAnimationFrame(() => {
    if (!isValidEditor(editor)) return;

    // If editor is not focused, focus it
    if (!editor.isFocused) {
      editor.commands.focus();
    }
  });
}

/**
 * Focus the editor after a click event
 *
 * Handles edge cases where clicking on toolbar/UI elements
 * should restore focus to the editor
 */
export function focusAfterClick(
  editor: Editor,
  event: React.MouseEvent
): void {
  if (!isValidEditor(editor)) return;

  // Prevent default to avoid losing focus
  event.preventDefault();

  // Restore focus after the click event bubbles
  safeRequestAnimationFrame(() => {
    if (!isValidEditor(editor)) return;
    editor.commands.focus();
  });
}

/**
 * Keep focus within the editor
 *
 * Prevents focus from escaping during common operations
 */
export function maintainFocus(editor: Editor): () => void {
  if (!isValidEditor(editor)) {
    return function noOp(): void {
      // No-op when editor is invalid
    };
  }

  const handleFocusOut = (event: FocusEvent): void => {
    const relatedTarget = event.relatedTarget as HTMLElement | null;

    // If focus is moving outside the editor container, restore it
    if (relatedTarget) {
      const editorElement = editor.view.dom.closest('.pubwave-editor');
      if (editorElement && !editorElement.contains(relatedTarget)) {
        // Check if focus is moving to a toolbar or other editor UI
        const isEditorUI = relatedTarget.closest(
          '.pubwave-toolbar, .pubwave-menu, .pubwave-dialog'
        );

        if (!isEditorUI) {
          // Focus has left the editor area completely
          // Don't restore - user intentionally clicked elsewhere
        }
      }
    }
  };

  const editorElement = editor.view.dom;
  editorElement.addEventListener('focusout', handleFocusOut);

  return () => {
    editorElement.removeEventListener('focusout', handleFocusOut);
  };
}

/**
 * Save and restore selection state
 *
 * Useful for operations that need to temporarily change selection
 * then restore it (e.g., inserting content at cursor)
 */
export interface SavedSelection {
  from: number;
  to: number;
  empty: boolean;
}

export function saveSelection(editor: Editor): SavedSelection | null {
  if (!isValidEditor(editor)) return null;

  const { from, to, empty } = editor.state.selection;
  return { from, to, empty };
}

export function restoreSelection(
  editor: Editor,
  savedSelection: SavedSelection | null
): void {
  if (!isValidEditor(editor) || !savedSelection) return;

  const { from, to } = savedSelection;
  const docSize = editor.state.doc.content.size;

  // Clamp positions to valid range
  const safeFrom = Math.min(from, docSize);
  const safeTo = Math.min(to, docSize);

  editor.commands.setTextSelection({ from: safeFrom, to: safeTo });
}

/**
 * Handle focus for selection clear
 *
 * When selection is cleared (e.g., clicking in empty space),
 * ensure cursor is placed at a sensible position
 */
export function handleSelectionClear(editor: Editor): void {
  if (!isValidEditor(editor)) return;

  const { selection } = editor.state;

  // If selection is at a valid position, just focus
  if (selection.$anchor.pos > 0) {
    editor.commands.focus();
    return;
  }

  // If cursor is at invalid position, move to end
  editor.commands.focus('end');
}

/**
 * Create a focus trap within the editor UI
 *
 * Useful for modals/dialogs that should trap focus
 */
export function createFocusTrap(
  container: HTMLElement
): { activate: () => void; deactivate: () => void } {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  };

  return {
    activate(): void {
      container.addEventListener('keydown', handleKeyDown);
      firstElement?.focus();
    },
    deactivate(): void {
      container.removeEventListener('keydown', handleKeyDown);
    },
  };
}
