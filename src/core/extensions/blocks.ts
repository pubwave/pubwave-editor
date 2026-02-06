/**
 * Core Block Extensions
 *
 * Defines and configures the core block-level nodes supported by the editor.
 * These are the fundamental building blocks for content structure.
 *
 * Constitution 4.1.1: Block Node Types
 * - Paragraph, Heading, Lists, Quote, Code Block, Divider, etc.
 */

import type { AnyExtension } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import HardBreak from '@tiptap/extension-hard-break';
import { Chart } from './chart';
import { Layout, LayoutColumn } from './layout';
import type { ImageUploadConfig } from '../../types/editor';
import { createImageExtension } from './image';
import { TextAlign } from './textAlign';

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
export function createBlockExtensions(
  config: BlockExtensionsConfig = {}
): AnyExtension[] {
  const {
    headingLevels = [1, 2, 3],
    imageUpload,
    enableChart = true,
    enableLayout = true,
  } = config;

  const extensions: AnyExtension[] = [
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
    TextAlign.configure({
      types: ['paragraph', 'heading'],
      alignments: ['left', 'center', 'right'],
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

    // Table
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'pubwave-editor__table',
      },
    }),
    TableRow.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__table-row',
      },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__table-header',
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: 'pubwave-editor__table-cell',
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
    createImageExtension(imageUpload),
  ];

  if (enableChart) {
    extensions.push(
      Chart.configure({
        HTMLAttributes: {
          class: 'pubwave-editor__chart',
        },
      })
    );
  }

  if (enableLayout) {
    extensions.push(
      Layout.configure({
        HTMLAttributes: {
          class: 'pubwave-editor__layout',
        },
      }),
      LayoutColumn.configure({
        HTMLAttributes: {
          class: 'pubwave-editor__layout-column',
        },
      })
    );
  }

  return extensions;
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
  TABLE: 'table',
  TABLE_ROW: 'tableRow',
  TABLE_HEADER: 'tableHeader',
  TABLE_CELL: 'tableCell',
  BLOCKQUOTE: 'blockquote',
  CODE_BLOCK: 'codeBlock',
  HORIZONTAL_RULE: 'horizontalRule',
  IMAGE: 'image',
  CHART: 'chart',
  LAYOUT: 'layout',
  LAYOUT_COLUMN: 'layoutColumn',
  DOCUMENT: 'doc',
  TEXT: 'text',
} as const;

export type BlockTypeKey = keyof typeof BLOCK_TYPES;
export type BlockTypeValue = (typeof BLOCK_TYPES)[BlockTypeKey];
