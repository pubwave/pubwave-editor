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

import { forwardRef, useImperativeHandle, useCallback, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';

import { createExtensions } from '../core/extensions';
import type { EditorTheme, EditorAPI, ImageUploadConfig } from '../types/editor';
import { getReadOnlyClassName } from './readOnlyGuards';
import { ariaLabels } from './a11y';
import { BubbleToolbar } from './BubbleToolbar';
import { BlockHandle } from './dnd/BlockHandle';
import { DropIndicatorOverlay } from './dnd/DropIndicatorOverlay';
import { LocaleProvider } from './LocaleContext';
import { getLocale } from '../i18n';

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
   * Image upload configuration
   * If not provided, images will be converted to base64 by default
   */
  imageUpload?: ImageUploadConfig;

  /**
   * Additional CSS class for the container
   */
  className?: string;

  /**
   * Editor container width
   * Can be a CSS value like '100%', '1200px', '90vw', etc.
   * @default '100%'
   */
  width?: string;

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
      placeholder,
      theme,
      autofocus = false,
      imageUpload,
      onChange,
      onSelectionChange,
      onFocus,
      onBlur,
      onReady,
      className,
      width,
      'data-testid': testId = 'pubwave-editor',
    } = props;

    // Get locale from theme or use default (needed for extensions)
    const locale = getLocale(theme?.locale);
    
    // Get placeholder from prop or locale data (prioritize locale for i18n)
    // Only use locale.placeholder if placeholder prop is not provided
    const placeholderText = placeholder ?? locale.placeholder ?? 'Start writing...';

    // Create Tiptap editor instance
    const editor = useEditor({
      extensions: createExtensions({
        placeholder: placeholderText,
        headingLevels: [1, 2, 3],
        linkOpenInNewTab: true,
        linkOpenOnClick: true,
        imageUpload,
        locale: theme?.locale,
      }),
      content,
      editable,
      autofocus,
      // Set immediatelyRender to false for SSR compatibility
      // This prevents hydration mismatches in Next.js and other SSR frameworks
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: `pubwave-editor__content ${theme?.contentClassName ?? ''}`.trim(),
          'data-placeholder': placeholderText,
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

    // Track if component has mounted (for SSR hydration)
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Update data-placeholder attribute when locale changes
    useEffect(() => {
      if (!editor?.view?.dom) return;
      
      const editorElement = editor.view.dom as HTMLElement;
      if (editorElement) {
        editorElement.setAttribute('data-placeholder', placeholderText);
      }
    }, [editor, placeholderText, theme?.locale]);

    // Build class names
    const containerClassName = [
      'pubwave-editor',
      theme?.classNamePrefix ?? '',
      theme?.containerClassName ?? '',
      editor ? getReadOnlyClassName(editor) : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Build CSS variables from theme colors
    const themeStyles: React.CSSProperties & Record<string, string> = {
      position: 'relative',
      overflow: 'visible',
    };

    // Apply width if provided (use CSS variable for better override capability)
    if (width) {
      themeStyles['--pubwave-container-width'] = width;
      themeStyles.width = width;
      // If width is set, also set max-width to the same value to override CSS default
      // This ensures width takes effect even when max-width would otherwise limit it
      themeStyles['--pubwave-container-max-width'] = width;
      themeStyles.maxWidth = width;
    }

    if (theme?.colors) {
      const { colors } = theme;
      // Determine if text is light (dark theme) or dark (light theme) for hover color
      // Light text colors typically start with 'f' (high hex values) or 'e' (very light)
      const textColor = colors.text || '#1f2937';
      const normalizedColor = textColor.toLowerCase().trim();
      // Check if it's a light color by examining the hex values
      // Light colors have high RGB values (f, e, d, c, b, a in hex)
      const isLightText = 
        normalizedColor.startsWith('#f') || 
        normalizedColor.startsWith('#e') ||
        normalizedColor.includes('f1') || 
        normalizedColor.includes('f3') || 
        normalizedColor.includes('f0') || 
        normalizedColor.includes('fdf') || 
        normalizedColor.includes('ffb') ||
        normalizedColor.includes('ffc') ||
        normalizedColor.includes('ffd') ||
        normalizedColor.includes('ffe') ||
        normalizedColor.includes('fff') ||
        normalizedColor.includes('e0') || 
        normalizedColor.includes('e5') ||
        normalizedColor.includes('ecf') ||
        normalizedColor.includes('eef');
      
      // If background is a gradient, apply it directly; otherwise use CSS variable
      if (colors.background) {
        if (colors.background.includes('gradient')) {
          themeStyles.background = colors.background;
          // For gradient backgrounds, we need to set surface color for dropdowns
          // Use a semi-transparent white/black overlay based on text color brightness
          if (isLightText) {
            // Light text means dark background, use dark surface for dropdowns
            themeStyles['--pubwave-surface'] = 'rgba(38, 38, 38, 0.95)';
            themeStyles['--pubwave-bg'] = '#1a1a1a';
          } else {
            // Dark text means light background, use white surface
            themeStyles['--pubwave-surface'] = 'rgba(255, 255, 255, 0.95)';
            themeStyles['--pubwave-bg'] = '#ffffff';
          }
        } else {
          themeStyles['--pubwave-bg'] = colors.background;
          themeStyles['--pubwave-surface'] = colors.background;
        }
      }
      if (colors.text) {
        themeStyles['--pubwave-text'] = colors.text;
      }
      if (colors.textMuted) {
        themeStyles['--pubwave-text-muted'] = colors.textMuted;
      }
      if (colors.border) {
        themeStyles['--pubwave-border'] = colors.border;
      }
      if (colors.primary) {
        themeStyles['--pubwave-primary'] = colors.primary;
      }
      // Only set linkColor if explicitly provided, otherwise CSS will use primary as fallback
      if (colors.linkColor) {
        themeStyles['--pubwave-link-color'] = colors.linkColor;
      }
      // Set hover color based on text color brightness
      // If text is light (dark theme), use light hover; if text is dark (light theme), use dark hover
      if (isLightText) {
        // Light text means dark background, use light hover
        themeStyles['--pubwave-hover'] = 'rgba(255, 255, 255, 0.1)';
      } else {
        // Dark text means light background, use dark hover
        themeStyles['--pubwave-hover'] = 'rgba(0, 0, 0, 0.05)';
      }
    }

    // Apply background image if provided
    if (theme?.backgroundImage) {
      const bgImage = theme.backgroundImage;
      const options = theme.backgroundImageOptions || {};
      
      // Build background-image CSS value
      // Support both URL strings and full CSS background-image values
      if (bgImage.startsWith('url(') || bgImage.includes('gradient') || bgImage.includes('linear-gradient') || bgImage.includes('radial-gradient')) {
        // Already a valid CSS background-image value
        themeStyles.backgroundImage = bgImage;
      } else {
        // Assume it's a URL string, wrap it in url()
        themeStyles.backgroundImage = `url(${bgImage})`;
      }

      // Apply background image options
      if (options.repeat !== undefined) {
        themeStyles.backgroundRepeat = options.repeat;
      } else {
        themeStyles.backgroundRepeat = 'no-repeat';
      }

      if (options.position !== undefined) {
        themeStyles.backgroundPosition = options.position;
      } else {
        themeStyles.backgroundPosition = 'center';
      }

      if (options.size !== undefined) {
        themeStyles.backgroundSize = options.size;
      } else {
        themeStyles.backgroundSize = 'cover';
      }

      if (options.attachment !== undefined) {
        themeStyles.backgroundAttachment = options.attachment;
      } else {
        themeStyles.backgroundAttachment = 'scroll';
      }
    }

    // During SSR or before hydration, render a placeholder that matches the expected structure
    if (!isMounted || !editor) {
      return (
        <LocaleProvider value={{ locale }}>
          <div
            className={containerClassName}
            data-testid={testId}
            role="application"
            aria-label={ariaLabels.editor}
            style={themeStyles}
          />
        </LocaleProvider>
      );
    }

    return (
      <LocaleProvider value={{ locale }}>
        <div
          className={containerClassName}
          data-testid={testId}
          role="application"
          aria-label={ariaLabels.editor}
          style={themeStyles}
        >
          <EditorContent editor={editor} />
          {/* Bubble toolbar - appears only on non-empty text selection (US2) */}
          {editable && <BubbleToolbar editor={editor} />}
          {/* Block handles - + and drag grip appear on block hover (US3) */}
          {editable && <BlockHandle editor={editor} />}
          {/* Drop indicator - appears during drag (US4) */}
          {editable && <DropIndicatorOverlay editor={editor} />}
        </div>
      </LocaleProvider>
    );
  }
);

// Default export for convenience
export default PubwaveEditor;
