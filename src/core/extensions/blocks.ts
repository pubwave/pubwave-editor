/**
 * Core Block Extensions
 *
 * Defines and configures the core block-level nodes supported by the editor.
 * These are the fundamental building blocks for content structure.
 *
 * Constitution 4.1.1: Block Node Types
 * - Paragraph, Heading, Lists, Quote, Code Block, Divider, etc.
 */

import { Extension } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import HardBreak from '@tiptap/extension-hard-break';
import Image from '@tiptap/extension-image';
import { Chart } from './chart';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { ImageUploadConfig } from '../../types/editor';

export interface BlockExtensionsConfig {
  /**
   * Heading levels to support
   * @default [1, 2, 3]
   */
  headingLevels?: (1 | 2 | 3 | 4 | 5 | 6)[];

  /**
   * Image upload configuration
   */
  imageUpload?: ImageUploadConfig;
}

/**
 * Create the core block extensions
 *
 * This includes:
 * - Document: Root node
 * - Paragraph: Default text block
 * - Text: Inline text node
 * - Heading: H1-H6 heading blocks
 * - BulletList / OrderedList / TaskList: List types
 * - Blockquote: Quote blocks
 * - CodeBlock: Code snippets
 * - HorizontalRule: Divider
 */
/**
 * Upload image file and return URL
 * Uses custom handler if provided, otherwise converts to base64
 */
async function uploadImage(
  file: File,
  config?: ImageUploadConfig
): Promise<string> {
  const maxSize = config?.maxSize ?? 10 * 1024 * 1024; // 10MB default
  if (file.size > maxSize) {
    throw new Error(`Image file is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
  }

  // If custom handler is provided, use it
  if (config?.handler) {
    try {
      return await config.handler(file);
    } catch (error) {
      console.warn('Custom image upload failed, falling back to base64:', error);
      // Fall through to base64 conversion
    }
  }

  // Default: convert to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        resolve(src);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    reader.readAsDataURL(file);
  });
}

export function createBlockExtensions(
  config: BlockExtensionsConfig = {}
): Extension[] {
  const { headingLevels = [1, 2, 3], imageUpload } = config;

  return [
    // Document structure (required)
    Document,
    Paragraph.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__paragraph',
      },
    }),
    Text,
    HardBreak,

    // Headings
    Heading.configure({
      levels: headingLevels,
      HTMLAttributes: {
        class: 'pubwave-editor__heading',
      },
    }),

    // Lists
    BulletList.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__bullet-list',
      },
    }),
    OrderedList.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__ordered-list',
      },
    }),
    ListItem.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__list-item',
      },
    }),

    // Task list
    TaskList.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__task-list',
      },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: {
        class: 'pubwave-editor__task-item',
      },
    }),

    // Quote
    Blockquote.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__blockquote',
      },
    }),

    // Code block
    CodeBlock.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__code-block',
      },
    }),

    // Divider
    HorizontalRule.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__divider',
      },
    }),

    // Image with paste support
    Image.extend({
      addProseMirrorPlugins() {
        return [
          new Plugin({
            key: new PluginKey('imagePasteHandler'),
            props: {
              handlePaste: (view, event) => {
                const items = Array.from(event.clipboardData?.items || []);
                
                for (const item of items) {
                  if (item.type.indexOf('image') === 0) {
                    event.preventDefault();
                    
                    const file = item.getAsFile();
                    if (file) {
                      // Upload image (uses custom handler or base64)
                      uploadImage(file, imageUpload)
                        .then((src) => {
                          const { state, dispatch } = view;
                          const imageNodeType = state.schema.nodes.image;
                          
                          if (imageNodeType) {
                            const imageNode = imageNodeType.create({
                              src,
                            });
                            
                            const transaction = state.tr.replaceSelectionWith(imageNode);
                            dispatch(transaction);
                          }
                        })
                        .catch((error) => {
                          console.error('Failed to upload image:', error);
                        });
                      
                      return true;
                    }
                  }
                }
                
                return false;
              },
            },
          }),
        ];
      },
    }).configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: 'pubwave-editor__image',
      },
    }),

    // Chart with Chart.js
    Chart.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__chart',
      },
    }),
  ] as Extension[];
}

/**
 * Block type identifiers
 */
export const BLOCK_TYPES = {
  PARAGRAPH: 'paragraph',
  HEADING: 'heading',
  BULLET_LIST: 'bulletList',
  ORDERED_LIST: 'orderedList',
  TASK_LIST: 'taskList',
  TASK_ITEM: 'taskItem',
  LIST_ITEM: 'listItem',
  BLOCKQUOTE: 'blockquote',
  CODE_BLOCK: 'codeBlock',
  HORIZONTAL_RULE: 'horizontalRule',
  IMAGE: 'image',
  CHART: 'chart',
  DOCUMENT: 'doc',
  TEXT: 'text',
} as const;

export type BlockTypeKey = keyof typeof BLOCK_TYPES;
export type BlockTypeValue = (typeof BLOCK_TYPES)[BlockTypeKey];
