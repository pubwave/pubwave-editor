/**
 * Core Mark Extensions
 *
 * Defines and configures the core inline formatting marks supported by the editor.
 * Marks are used for text-level formatting like bold, italic, and links.
 *
 * Constitution 4.5.1: Inline Formats
 * - Bold, Italic, Underline, Strikethrough, Inline Code, Link
 */

import { Extension } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import Link from '@tiptap/extension-link';
import { TextColor, BackgroundColor } from './color';

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
} as const;

export type MarkTypeKey = keyof typeof MARK_TYPES;
export type MarkTypeValue = (typeof MARK_TYPES)[MarkTypeKey];
