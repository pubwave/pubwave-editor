/**
 * Editor configuration and public types
 *
 * These types define the public API surface for consumers of the library.
 * All types here should be stable and well-documented.
 */

import type { Editor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';

/**
 * Supported block types in the editor
 */
export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'bulletList'
  | 'orderedList'
  | 'taskList'
  | 'table'
  | 'blockquote'
  | 'codeBlock'
  | 'horizontalRule'
  | 'image'
  | 'chart'
  | 'layout';

/**
 * Supported mark types for inline formatting
 */
export type MarkType =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'link';

/**
 * Theme configuration using CSS custom property tokens
 * All colors must be CSS custom properties, never hard-coded values
 */
/**
 * Locale for internationalization
 * @default 'en'
 */
export type EditorLocale =
  | 'en'
  | 'zh'
  | 'zh-CN'
  | 'ja'
  | 'ko'
  | 'fr'
  | 'de'
  | 'es'
  | 'pt';

export interface EditorTheme {
  /**
   * CSS class name prefix for styling hooks
   * @default 'pubwave-editor'
   */
  classNamePrefix?: string;

  /**
   * Locale for internationalization
   * @default 'en'
   */
  locale?: EditorLocale;

  /**
   * Additional CSS classes to apply to the editor container
   */
  containerClassName?: string;

  /**
   * Additional CSS classes to apply to the content area
   */
  contentClassName?: string;

  /**
   * Color theme configuration
   * Colors will be applied as CSS custom properties to the editor container
   * If not provided, default theme colors will be used
   */
  colors?: {
    /**
     * Editor background color
     */
    background?: string;

    /**
     * Primary text color
     */
    text?: string;

    /**
     * Muted/secondary text color (e.g., for placeholders)
     */
    textMuted?: string;

    /**
     * Border color
     */
    border?: string;

    /**
     * Primary color (for links, buttons, etc.)
     */
    primary?: string;

    /**
     * Link color (if not provided, will use primary color)
     * Useful for dark themes where a brighter link color is needed for visibility
     */
    linkColor?: string;
  };

  /**
   * Background image configuration
   * Can be a URL string or CSS background-image value
   * If provided, will be applied as the editor container background image
   * Background image will be layered on top of background color
   */
  backgroundImage?: string;

  /**
   * Background image options
   * Controls how the background image is displayed
   */
  backgroundImageOptions?: {
    /**
     * Background image repeat behavior
     * @default 'no-repeat'
     */
    repeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';

    /**
     * Background image position
     * @default 'center'
     */
    position?: string;

    /**
     * Background image size
     * @default 'cover'
     */
    size?: 'cover' | 'contain' | string;

    /**
     * Background image attachment
     * @default 'scroll'
     */
    attachment?: 'scroll' | 'fixed' | 'local';
  };
}

/**
 * Image upload handler function
 * Should return a Promise that resolves to the image URL
 * If the function throws or rejects, the editor will fall back to base64
 */
export type ImageUploadHandler = (file: File) => Promise<string>;

/**
 * Image upload configuration
 */
export interface ImageUploadConfig {
  /**
   * Custom image upload handler
   * If provided, images will be uploaded using this function
   * If not provided, images will be converted to base64 (default)
   */
  handler?: ImageUploadHandler;

  /**
   * Maximum file size in bytes
   * @default 10MB (10 * 1024 * 1024)
   */
  maxSize?: number;

  /**
   * Accepted file types
   * @default ['image/*']
   */
  accept?: string[];
}

/**
 * Configuration options for creating an editor instance
 */
export interface EditorConfig {
  /**
   * Initial content in Tiptap JSON format
   */
  content?: JSONContent;

  /**
   * Whether the editor is in read-only mode
   * When true, all editing affordances are hidden
   * @default false
   */
  editable?: boolean;

  /**
   * Placeholder text shown when the editor is empty
   */
  placeholder?: string;

  /**
   * Theme configuration for styling
   */
  theme?: EditorTheme;

  /**
   * Enable autofocus on mount
   * - true: Focus at the end
   * - 'start': Focus at the beginning
   * - 'end': Focus at the end
   * - false: No autofocus
   * @default false
   */
  autofocus?: boolean | 'start' | 'end';

  /**
   * Image upload configuration
   * If not provided, images will be converted to base64 by default
   */
  imageUpload?: ImageUploadConfig;

  /**
   * Enable chart block support
   * @default true
   */
  enableChart?: boolean;

  /**
   * Enable multi-column layout blocks
   * @default true
   */
  enableLayout?: boolean;

  /**
   * Callback fired when the editor content changes
   */
  onUpdate?: (props: { editor: Editor }) => void;

  /**
   * Callback fired when the selection changes
   */
  onSelectionUpdate?: (props: { editor: Editor }) => void;

  /**
   * Callback fired when the editor gains focus
   */
  onFocus?: (props: { editor: Editor }) => void;

  /**
   * Callback fired when the editor loses focus
   */
  onBlur?: (props: { editor: Editor }) => void;

  /**
   * Callback fired when the editor is ready
   */
  onCreate?: (props: { editor: Editor }) => void;

  /**
   * Callback fired before the editor is destroyed
   */
  onDestroy?: () => void;
}

/**
 * Current selection state derived from the editor
 */
export interface SelectionState {
  /**
   * Whether there is a non-empty text selection
   */
  hasSelection: boolean;

  /**
   * Whether the selection spans multiple blocks
   */
  isMultiBlock: boolean;

  /**
   * Start position of the selection
   */
  from: number;

  /**
   * End position of the selection
   */
  to: number;

  /**
   * Whether the selection is empty (cursor only)
   */
  isEmpty: boolean;
}

/**
 * Mark state for the current selection
 */
export interface MarkState {
  /**
   * Whether bold is active at the current selection
   */
  isBold: boolean;

  /**
   * Whether italic is active at the current selection
   */
  isItalic: boolean;

  /**
   * Whether a link is active at the current selection
   */
  isLink: boolean;

  /**
   * The href of the active link, if any
   */
  linkHref?: string;
}

/**
 * Complete editor state exposed to consumers
 */
export interface EditorState {
  /**
   * Current selection state
   */
  selection: SelectionState;

  /**
   * Current mark state for the selection
   */
  marks: MarkState;

  /**
   * Whether the editor is currently focused
   */
  isFocused: boolean;

  /**
   * Whether the editor is in read-only mode
   */
  isEditable: boolean;

  /**
   * Whether the editor content is empty
   */
  isEmpty: boolean;

  /**
   * Current character count
   */
  characterCount: number;
}

/**
 * Public API exposed by the editor
 */
export interface EditorAPI {
  /**
   * Get the current editor state
   */
  getState: () => EditorState;

  /**
   * Get the content as JSON
   */
  getJSON: () => JSONContent;

  /**
   * Get the content as HTML
   */
  getHTML: () => string;

  /**
   * Get the content as plain text
   */
  getText: () => string;

  /**
   * Set new content
   */
  setContent: (content: JSONContent) => void;

  /**
   * Clear all content
   */
  clearContent: () => void;

  /**
   * Set editable state
   */
  setEditable: (editable: boolean) => void;

  /**
   * Focus the editor
   */
  focus: (position?: 'start' | 'end') => void;

  /**
   * Blur the editor
   */
  blur: () => void;

  /**
   * Toggle bold mark
   */
  toggleBold: () => void;

  /**
   * Toggle italic mark
   */
  toggleItalic: () => void;

  /**
   * Set or remove a link
   */
  setLink: (href: string | null) => void;

  /**
   * Destroy the editor instance
   */
  destroy: () => void;

  /**
   * Access the underlying Tiptap editor instance
   * Use with caution - this is an escape hatch
   */
  readonly tiptapEditor: Editor | null;
}
