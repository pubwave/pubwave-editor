/**
 * Core Mark Extensions
 *
 * Defines and configures the core inline formatting marks supported by the editor.
 * Marks are used for text-level formatting like bold, italic, and links.
 *
 * Constitution 4.5.1: Inline Formats
 * - Bold, Italic, Underline, Strikethrough, Inline Code, Link
 */

import { Extension, Mark, mergeAttributes } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import Link from '@tiptap/extension-link';
import { TextColor, BackgroundColor } from './color';

const TagMark = Mark.create({
  name: 'tag',
  inclusive: false,
  priority: 900,

  addAttributes() {
    return {
      tone: {
        default: 'primary',
        parseHTML: (element) => element.getAttribute('data-tag-tone') ?? 'primary',
      },
      variant: {
        default: 'soft',
        parseHTML: (element) =>
          element.getAttribute('data-tag-variant') ?? 'soft',
      },
      size: {
        default: 'md',
        parseHTML: (element) => element.getAttribute('data-tag-size') ?? 'md',
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-tag-bg'),
      },
      textColor: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-tag-text'),
      },
      borderColor: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-tag-border'),
      },
      spacing: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-tag-spacing'),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="tag"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const {
      tone = 'primary',
      variant = 'soft',
      size = 'md',
      backgroundColor = null,
      textColor = null,
      borderColor = null,
      spacing = null,
      ...rest
    } = HTMLAttributes;

    return [
      'span',
      mergeAttributes(
        {
          'data-type': 'tag',
          'data-tag-tone': tone,
          'data-tag-variant': variant,
          'data-tag-size': size,
          'data-tag-bg': backgroundColor,
          'data-tag-text': textColor,
          'data-tag-border': borderColor,
          'data-tag-spacing': spacing,
          class: [
            'pubwave-tag',
            'pubwave-editor__mark--tag',
            `pubwave-tag--${variant}`,
            `pubwave-tag--${size}`,
            `pubwave-tag--${tone}`,
          ].join(' '),
          style: [
            backgroundColor
              ? `--pubwave-tag-custom-bg:${backgroundColor}`
              : '',
            textColor ? `--pubwave-tag-custom-text:${textColor}` : '',
            borderColor ? `--pubwave-tag-custom-border:${borderColor}` : '',
            backgroundColor ? `background-color:${backgroundColor}` : '',
            textColor ? `color:${textColor}` : '',
            borderColor ? `border-color:${borderColor}` : '',
            spacing ? `--pubwave-tag-spacing:${spacing}` : '',
            spacing ? `margin-right:${spacing}` : '',
            spacing ? `margin-inline-end:${spacing}` : '',
          ]
            .filter(Boolean)
            .join(';'),
        },
        rest
      ),
      0,
    ];
  },
});

export interface MarkExtensionsConfig {
  /**
   * Whether links should open in a new tab
   * @default true
   */
  linkOpenInNewTab?: boolean;

  /**
   * Whether to open links on click (within editor)
   * @default true - links open on click
   */
  linkOpenOnClick?: boolean;
}

/**
 * Create the core mark extensions
 *
 * This includes:
 * - Bold: Strong emphasis
 * - Italic: Emphasis
 * - Underline: Underlined text
 * - Strike: Strikethrough text
 * - Code: Inline code
 * - Link: Hyperlinks with customizable behavior
 */
export function createMarkExtensions(
  config: MarkExtensionsConfig = {}
): Extension[] {
  const { linkOpenInNewTab = true, linkOpenOnClick = true } = config;

  return [
    // Text formatting marks
    Bold.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__mark--bold',
      },
    }),

    Italic.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__mark--italic',
      },
    }),

    Underline.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__mark--underline',
      },
    }),

    Strike.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__mark--strike',
      },
    }),

    Code.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__mark--code',
      },
    }),

    // Link mark
    Link.configure({
      openOnClick: linkOpenOnClick,
      HTMLAttributes: {
        class: 'pubwave-editor__mark--link',
        rel: linkOpenInNewTab ? 'noopener noreferrer' : undefined,
        target: linkOpenInNewTab ? '_blank' : undefined,
      },
      validate: (href) => {
        // Basic URL validation
        try {
          new URL(href);
          return true;
        } catch {
          // Relative URLs are also valid
          return href.startsWith('/') || href.startsWith('#');
        }
      },
    }),

    TagMark,

    // Color marks
    TextColor.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__mark--text-color',
      },
    }),
    BackgroundColor.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__mark--background-color',
      },
    }),
  ] as Extension[];
}

/**
 * Mark type identifiers
 */
export const MARK_TYPES = {
  BOLD: 'bold',
  ITALIC: 'italic',
  UNDERLINE: 'underline',
  STRIKE: 'strike',
  CODE: 'code',
  LINK: 'link',
  TAG: 'tag',
} as const;

export type MarkTypeKey = keyof typeof MARK_TYPES;
export type MarkTypeValue = (typeof MARK_TYPES)[MarkTypeKey];
