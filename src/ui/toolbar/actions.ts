/**
 * Toolbar Actions
 *
 * Action handlers for the bubble toolbar, wired to the command layer.
 * Each action preserves focus and provides feedback for accessibility.
 */

import type { Editor } from '@tiptap/core';
import { restoreFocus } from '../focus';

/**
 * Action result for feedback
 */
export interface ActionResult {
  success: boolean;
  message?: string;
}

/**
 * Check if editor is valid for operations
 */
function isEditorReady(editor: Editor): boolean {
  return !editor.isDestroyed;
}

/**
 * Toggle bold mark on selection
 */
export function toggleBold(editor: Editor): ActionResult {
  if (!isEditorReady(editor)) {
    return { success: false, message: 'Editor not available' };
  }

  const success = editor.chain().focus().toggleBold().run();
  restoreFocus(editor);

  return {
    success,
    message: success ? 'Bold toggled' : 'Could not toggle bold',
  };
}

/**
 * Toggle italic mark on selection
 */
export function toggleItalic(editor: Editor): ActionResult {
  if (!isEditorReady(editor)) {
    return { success: false, message: 'Editor not available' };
  }

  const success = editor.chain().focus().toggleItalic().run();
  restoreFocus(editor);

  return {
    success,
    message: success ? 'Italic toggled' : 'Could not toggle italic',
  };
}

/**
 * Set a link on the selection
 */
export function setLink(editor: Editor, href: string): ActionResult {
  if (!isEditorReady(editor)) {
    return { success: false, message: 'Editor not available' };
  }

  if (!href.trim()) {
    return { success: false, message: 'URL is required' };
  }

  // Normalize URL (add protocol if missing)
  let normalizedHref = href.trim();
  if (!/^https?:\/\//i.test(normalizedHref) && !normalizedHref.startsWith('/')) {
    normalizedHref = `https://${normalizedHref}`;
  }

  const success = editor
    .chain()
    .focus()
    .setLink({ href: normalizedHref })
    .run();

  restoreFocus(editor);

  return {
    success,
    message: success ? 'Link added' : 'Could not add link',
  };
}

/**
 * Remove link from selection
 */
export function removeLink(editor: Editor): ActionResult {
  if (!isEditorReady(editor)) {
    return { success: false, message: 'Editor not available' };
  }

  const success = editor.chain().focus().unsetLink().run();
  restoreFocus(editor);

  return {
    success,
    message: success ? 'Link removed' : 'Could not remove link',
  };
}

/**
 * Toggle link - prompts for URL if adding, removes if already linked
 */
export function toggleLink(
  editor: Editor,
  promptFn: (message: string) => string | null = window.prompt.bind(window)
): ActionResult {
  if (!isEditorReady(editor)) {
    return { success: false, message: 'Editor not available' };
  }

  // Check if current selection has a link using editor API
  const hasLink = editor.isActive('link');

  if (hasLink) {
    return removeLink(editor);
  }

  // Prompt for URL
  const url = promptFn('Enter URL:');

  if (!url) {
    restoreFocus(editor);
    return { success: false, message: 'Link cancelled' };
  }

  return setLink(editor, url);
}

/**
 * Set heading level
 */
export function setHeading(editor: Editor, level: 1 | 2 | 3): ActionResult {
  if (!isEditorReady(editor)) {
    return { success: false, message: 'Editor not available' };
  }

  const success = editor.chain().focus().setHeading({ level }).run();
  restoreFocus(editor);

  const levelStr = String(level);
  return {
    success,
    message: success ? `Heading ${levelStr} applied` : 'Could not set heading',
  };
}

/**
 * Set paragraph (remove heading)
 */
export function setParagraph(editor: Editor): ActionResult {
  if (!isEditorReady(editor)) {
    return { success: false, message: 'Editor not available' };
  }

  const success = editor.chain().focus().setParagraph().run();
  restoreFocus(editor);

  return {
    success,
    message: success ? 'Paragraph applied' : 'Could not set paragraph',
  };
}

/**
 * Action factory for creating toolbar action handlers
 * Returns a function that can be used as onClick handler
 */
export function createActionHandler(
  editor: Editor,
  action: (editor: Editor) => ActionResult,
  onResult?: (result: ActionResult) => void
): () => void {
  return (): void => {
    const result = action(editor);
    onResult?.(result);
  };
}

/**
 * Toolbar action descriptors for dynamic toolbar generation
 */
export interface ToolbarActionDescriptor {
  id: string;
  label: string;
  shortcut?: string;
  icon: string;
  action: (editor: Editor) => ActionResult;
  isActive: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

/**
 * Default toolbar actions
 */
export const defaultToolbarActions: ToolbarActionDescriptor[] = [
  {
    id: 'bold',
    label: 'Bold',
    shortcut: 'Cmd+B',
    icon: 'bold',
    action: toggleBold,
    isActive: (editor) => editor.isActive('bold'),
  },
  {
    id: 'italic',
    label: 'Italic',
    shortcut: 'Cmd+I',
    icon: 'italic',
    action: toggleItalic,
    isActive: (editor) => editor.isActive('italic'),
  },
  {
    id: 'link',
    label: 'Link',
    shortcut: 'Cmd+K',
    icon: 'link',
    action: (editor) => toggleLink(editor),
    isActive: (editor) => editor.isActive('link'),
  },
];
