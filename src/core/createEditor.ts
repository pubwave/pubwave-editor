/**
 * Editor Creation Factory
 *
 * Provides the main factory function for creating and managing editor instances.
 * This is the primary entry point for programmatic editor creation.
 */

import { Editor, EditorOptions } from '@tiptap/core';
import { createExtensions } from './extensions';
import type { EditorConfig } from '../types/editor';
import { canUseDOM } from './util';

/**
 * Create a new editor instance
 *
 * This factory function creates a configured Tiptap editor with all necessary
 * extensions and settings based on the provided configuration.
 *
 * @param config - Editor configuration options
 * @returns A configured Tiptap Editor instance
 * @throws Error if called in a non-browser environment without proper guards
 */
export function createEditor(config: EditorConfig = {}): Editor {
  if (!canUseDOM) {
    throw new Error(
      'createEditor() cannot be called server-side. ' +
        'Ensure this function is only called in client-side code (e.g., useEffect, event handlers).'
    );
  }

  const {
    content,
    editable = true,
    placeholder,
    autofocus = false,
    onUpdate,
    onSelectionUpdate,
    onFocus,
    onBlur,
    onCreate,
    onDestroy,
  } = config;

  // Create extensions with configuration
  const extensions = createExtensions({
    placeholder,
    headingLevels: [1, 2, 3],
    linkOpenInNewTab: true,
    linkOpenOnClick: true,
  });

  // Build Tiptap editor options
  const editorOptions: Partial<EditorOptions> = {
    extensions,
    content,
    editable,
    autofocus,
    editorProps: {
      attributes: {
        class: 'pubwave-editor__content',
        'data-placeholder': placeholder ?? 'Start writing...',
      },
    },
    onUpdate: onUpdate
      ? ({ editor }) => {
          onUpdate({ editor });
        }
      : undefined,
    onSelectionUpdate: onSelectionUpdate
      ? ({ editor }) => {
          onSelectionUpdate({ editor });
        }
      : undefined,
    onFocus: onFocus
      ? ({ editor }) => {
          onFocus({ editor });
        }
      : undefined,
    onBlur: onBlur
      ? ({ editor }) => {
          onBlur({ editor });
        }
      : undefined,
    onCreate: onCreate
      ? ({ editor }) => {
          onCreate({ editor });
        }
      : undefined,
    onDestroy: onDestroy
      ? () => {
          onDestroy();
        }
      : undefined,
  };

  // Create and return the editor instance
  return new Editor(editorOptions);
}

/**
 * Destroy an editor instance and clean up resources
 *
 * @param editor - The editor instance to destroy
 */
export function destroyEditor(editor: Editor | null): void {
  if (editor && !editor.isDestroyed) {
    editor.destroy();
  }
}

/**
 * Check if an editor instance is in a valid state
 *
 * @param editor - The editor instance to check
 * @returns true if the editor exists and is not destroyed
 */
export function isEditorValid(editor: Editor | null): editor is Editor {
  return editor !== null && !editor.isDestroyed;
}
