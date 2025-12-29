/**
 * PubwaveEditor React Component
 *
 * The main React component for rendering the Pubwave Editor.
 * This is the primary entry point for React applications.
 *
 * FR-008 Compliance (No Persistent Clutter):
 * - BubbleToolbar: appears only on non-empty text selection
 * - DragHandle: appears only on block hover
 * - DropIndicator: appears only during active drag
 * - Toast: auto-dismisses after display duration
 *
 * All UI elements are contextual - no always-visible toolbars or controls
 * that would contradict the minimal, content-first design intent.
 */

import { forwardRef, useImperativeHandle, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';

import { createExtensions } from '../core/extensions';
import { canUseDOM } from '../core/ssr';
import type { EditorTheme, EditorAPI } from '../types/editor';
import { getReadOnlyClassName } from './readOnlyGuards';
import { ariaLabels } from './a11y';
import { BubbleToolbar } from './BubbleToolbar';
import { BlockHandle } from './dnd/BlockHandle';

/**
 * Props for the PubwaveEditor component
 */
export interface PubwaveEditorProps {
  /**
   * Initial content in Tiptap JSON format
   */
  content?: JSONContent;

  /**
   * Whether the editor is in read-only mode
   * @default false
   */
  editable?: boolean;

  /**
   * Placeholder text shown when the editor is empty
   */
  placeholder?: string;

  /**
   * Theme configuration
   */
  theme?: EditorTheme;

  /**
   * Enable autofocus on mount
   * @default false
   */
  autofocus?: boolean | 'start' | 'end';

  /**
   * Callback when content changes
   */
  onChange?: (content: JSONContent) => void;

  /**
   * Callback when selection changes
   */
  onSelectionChange?: () => void;

  /**
   * Callback when editor gains focus
   */
  onFocus?: () => void;

  /**
   * Callback when editor loses focus
   */
  onBlur?: () => void;

  /**
   * Callback when editor is ready
   */
  onReady?: (api: EditorAPI) => void;

  /**
   * Additional CSS class for the container
   */
  className?: string;

  /**
   * Test ID for testing
   */
  'data-testid'?: string;
}

/**
 * PubwaveEditor Component
 *
 * A Notion-level block editor with:
 * - Premium writing experience
 * - Selection-only formatting toolbar
 * - Block drag & drop
 * - Full theme customization via CSS tokens
 */
export const PubwaveEditor = forwardRef<EditorAPI | null, PubwaveEditorProps>(
  function PubwaveEditor(props, ref) {
    const {
      content,
      editable = true,
      placeholder = 'Start writing...',
      theme,
      autofocus = false,
      onChange,
      onSelectionChange,
      onFocus,
      onBlur,
      onReady,
      className,
      'data-testid': testId = 'pubwave-editor',
    } = props;

    // Create Tiptap editor instance
    const editor = useEditor({
      extensions: createExtensions({
        placeholder,
        headingLevels: [1, 2, 3],
        linkOpenInNewTab: true,
      }),
      content,
      editable,
      autofocus,
      editorProps: {
        attributes: {
          class: `pubwave-editor__content ${theme?.contentClassName ?? ''}`.trim(),
          'data-placeholder': placeholder,
        },
      },
      onUpdate: ({ editor }) => {
        onChange?.(editor.getJSON());
      },
      onSelectionUpdate: () => {
        onSelectionChange?.();
      },
      onFocus: () => {
        onFocus?.();
      },
      onBlur: () => {
        onBlur?.();
      },
      onCreate: ({ editor }) => {
        // Build the public API
        const api = createEditorAPI(editor);
        onReady?.(api);
      },
    });

    // Create the public API
    const createEditorAPI = useCallback(
      (tiptapEditor: typeof editor): EditorAPI => ({
        getState: () => ({
          selection: {
            hasSelection: !tiptapEditor?.state.selection.empty,
            isMultiBlock: false,
            from: tiptapEditor?.state.selection.from ?? 0,
            to: tiptapEditor?.state.selection.to ?? 0,
            isEmpty: tiptapEditor?.state.selection.empty ?? true,
          },
          marks: {
            isBold: tiptapEditor?.isActive('bold') ?? false,
            isItalic: tiptapEditor?.isActive('italic') ?? false,
            isLink: tiptapEditor?.isActive('link') ?? false,
            linkHref: tiptapEditor
              ? (tiptapEditor.getAttributes('link') as { href?: string }).href
              : undefined,
          },
          isFocused: tiptapEditor?.isFocused ?? false,
          isEditable: tiptapEditor?.isEditable ?? false,
          isEmpty: tiptapEditor?.isEmpty ?? true,
          characterCount: 0, // Character count requires extension, not included by default
        }),
        getJSON: () => tiptapEditor?.getJSON() ?? { type: 'doc', content: [] },
        getHTML: () => tiptapEditor?.getHTML() ?? '',
        getText: () => tiptapEditor?.getText() ?? '',
        setContent: (newContent) => tiptapEditor?.commands.setContent(newContent),
        clearContent: () => tiptapEditor?.commands.clearContent(),
        setEditable: (value) => tiptapEditor?.setEditable(value),
        focus: (position) => {
          if (position === 'start') {
            tiptapEditor?.commands.focus('start');
          } else if (position === 'end') {
            tiptapEditor?.commands.focus('end');
          } else {
            tiptapEditor?.commands.focus();
          }
        },
        blur: () => tiptapEditor?.commands.blur(),
        toggleBold: () => tiptapEditor?.chain().focus().toggleBold().run(),
        toggleItalic: () => tiptapEditor?.chain().focus().toggleItalic().run(),
        setLink: (href) => {
          if (href) {
            tiptapEditor?.chain().focus().setLink({ href }).run();
          } else {
            tiptapEditor?.chain().focus().unsetLink().run();
          }
        },
        destroy: () => tiptapEditor?.destroy(),
        tiptapEditor: tiptapEditor ?? null,
      }),
      []
    );

    // Expose API via ref
    useImperativeHandle<EditorAPI | null, EditorAPI | null>(
      ref,
      () => (editor ? createEditorAPI(editor) : null),
      [editor, createEditorAPI]
    );

    // Don't render anything server-side
    if (!canUseDOM) {
      return null;
    }

    // Build class names
    const containerClassName = [
      'pubwave-editor',
      theme?.classNamePrefix ?? '',
      theme?.containerClassName ?? '',
      getReadOnlyClassName(editor),
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        className={containerClassName}
        data-testid={testId}
        role="application"
        aria-label={ariaLabels.editor}
        style={{ position: 'relative', overflow: 'visible' }}
      >
        <EditorContent editor={editor} />
        {/* Bubble toolbar - appears only on non-empty text selection (US2) */}
        {editor && editable && <BubbleToolbar editor={editor} />}
        {/* Block handles - + and drag grip appear on block hover (US3) */}
        {editor && editable && <BlockHandle editor={editor} />}
      </div>
    );
  }
);

// Default export for convenience
export default PubwaveEditor;
