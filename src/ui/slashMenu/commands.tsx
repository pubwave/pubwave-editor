/**
 * SlashMenu Commands
 *
 * Command definitions and filtering logic for the SlashMenu.
 */

import React from 'react';
import type { Editor } from '@tiptap/core';
import { safeRequestAnimationFrame } from '../../core/util';
import type { ImageUploadConfig } from '../../types/editor';
import type { EditorLocale } from '../../i18n';
import {
  TextIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  BulletListIcon,
  OrderedListIcon,
  TaskListIcon,
  QuoteIcon,
  CodeBlockIcon,
  DividerIcon,
  ImageIcon,
} from '../toolbar/icons';
import { LayoutTwoIcon, LayoutThreeIcon } from '../blocks/LayoutIcons';
import { handleImageUpload } from './imageUpload';

/**
 * Helper function to insert a layout node
 */
function insertLayout(editor: Editor, columns: 2 | 3) {
  const { state, dispatch } = editor.view;

  // Create the layout node with empty columns
  const layoutType = state.schema.nodes.layout;
  const layoutColumnNodeType = state.schema.nodes.layoutColumn;

  if (!layoutType || !layoutColumnNodeType) {
    console.warn('Layout node type not found in schema');
    return;
  }

  // Create empty paragraph nodes for each column
  const paragraphNodeType = state.schema.nodes.paragraph;
  if (!paragraphNodeType) {
    console.warn('Paragraph node type not found in schema');
    return;
  }
  const columnsContent = Array.from({ length: columns }, () =>
    layoutColumnNodeType.create(null, paragraphNodeType.create())
  );

  // Create the layout node
  const layoutNode = layoutType.create({ columns }, columnsContent);

  // Insert the layout node
  const transaction = state.tr.replaceSelectionWith(layoutNode);
  dispatch(transaction);

  // Focus the first column
  const layoutPos = transaction.selection.$from.before();
  editor
    .chain()
    .focus()
    .setTextSelection(layoutPos + 2)
    .run();
}

/**
 * Command item definition
 */
export interface SlashCommand {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  aliases?: string[];
  group: 'basic' | 'list' | 'media' | 'advanced' | 'layout';
  action: (editor: Editor) => void;
}

/**
 * Create default slash commands with image upload config and locale
 */
export function createDefaultSlashCommands(
  imageUploadConfig?: ImageUploadConfig,
  locale?: EditorLocale
): SlashCommand[] {
  const localeData = locale || {
    slashMenu: {
      groups: {
        basic: 'Basic',
        list: 'Lists',
        media: 'Media',
        advanced: 'Advanced',
        layout: 'Layout',
      },
      commands: {
        paragraph: { title: 'Text', description: 'Plain text block' },
        heading1: { title: 'Heading 1', description: 'Large section heading' },
        heading2: { title: 'Heading 2', description: 'Medium section heading' },
        heading3: { title: 'Heading 3', description: 'Small section heading' },
        bulletList: {
          title: 'Bullet List',
          description: 'Create a bulleted list',
        },
        orderedList: {
          title: 'Numbered List',
          description: 'Create a numbered list',
        },
        taskList: {
          title: 'To-do list',
          description: 'Create a todo list with checkboxes',
        },
        image: { title: 'Image', description: 'Upload or paste an image' },
        blockquote: {
          title: 'Blockquote',
          description: 'Create a quote block',
        },
        codeBlock: { title: 'Code', description: 'Create a code snippet' },
        horizontalRule: {
          title: 'Divider',
          description: 'Create a horizontal line',
        },
        layoutTwoColumn: {
          title: 'Two Column Layout',
          description: 'Split content into two side-by-side columns',
        },
        layoutThreeColumn: {
          title: 'Three Column Layout',
          description: 'Split content into three side-by-side columns',
        },
      },
    },
    toolbar: {} as any,
    aria: {} as any,
    placeholder: '',
    linkPlaceholder: '',
  };

  const cmd = localeData.slashMenu.commands;
  return [
    // Basic blocks - Style group
    {
      id: 'paragraph',
      title: cmd.paragraph.title,
      description: cmd.paragraph.description,
      icon: <TextIcon />,
      aliases: ['p', 'text', 'paragraph'],
      group: 'basic',
      action: (editor) => editor.chain().focus().setParagraph().run(),
    },
    {
      id: 'heading1',
      title: cmd.heading1.title,
      description: cmd.heading1.description,
      icon: <H1Icon />,
      aliases: ['h1', 'title'],
      group: 'basic',
      action: (editor) =>
        editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      id: 'heading2',
      title: cmd.heading2.title,
      description: cmd.heading2.description,
      icon: <H2Icon />,
      aliases: ['h2', 'subtitle'],
      group: 'basic',
      action: (editor) =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      id: 'heading3',
      title: cmd.heading3.title,
      description: cmd.heading3.description,
      icon: <H3Icon />,
      aliases: ['h3'],
      group: 'basic',
      action: (editor) =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    // Lists
    {
      id: 'bulletList',
      title: cmd.bulletList.title,
      description: cmd.bulletList.description,
      icon: <BulletListIcon />,
      aliases: ['ul', 'bullet', 'unordered', '-'],
      group: 'list',
      action: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'orderedList',
      title: cmd.orderedList.title,
      description: cmd.orderedList.description,
      icon: <OrderedListIcon />,
      aliases: ['ol', 'numbered', 'ordered', '1.'],
      group: 'list',
      action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      id: 'taskList',
      title: cmd.taskList.title,
      description: cmd.taskList.description,
      icon: <TaskListIcon />,
      aliases: ['todo', 'task', 'checkbox', '[]'],
      group: 'list',
      action: (editor) => editor.chain().focus().toggleTaskList().run(),
    },
    // Media
    {
      id: 'image',
      title: cmd.image.title,
      description: cmd.image.description,
      icon: <ImageIcon />,
      aliases: ['img', 'picture', 'photo', 'pic'],
      group: 'media',
      action: (editor) => {
        // Create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        const accept = imageUploadConfig?.accept ?? ['image/*'];
        input.accept = accept.join(',');
        input.style.display = 'none';

        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            handleImageUpload(editor, file, imageUploadConfig);
          }
          // Clean up
          document.body.removeChild(input);
        };

        // Append to body and trigger click
        document.body.appendChild(input);
        input.click();
      },
    },
    // Advanced
    {
      id: 'blockquote',
      title: cmd.blockquote.title,
      description: cmd.blockquote.description,
      icon: <QuoteIcon />,
      aliases: ['quote', 'blockquote', '>'],
      group: 'advanced',
      action: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      id: 'codeBlock',
      title: cmd.codeBlock.title,
      description: cmd.codeBlock.description,
      icon: <CodeBlockIcon />,
      aliases: ['code', 'pre', 'snippet', '```'],
      group: 'advanced',
      action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      id: 'horizontalRule',
      title: cmd.horizontalRule.title,
      description: cmd.horizontalRule.description,
      icon: <DividerIcon />,
      aliases: ['hr', 'divider', 'line', '---'],
      group: 'advanced',
      action: (editor) => {
        // Set horizontal rule first
        editor.chain().focus().setHorizontalRule().run();

        // Then insert paragraph after the divider using requestAnimationFrame
        // This ensures the divider is fully inserted in the DOM first
        safeRequestAnimationFrame(() => {
          const { state } = editor.view;
          const { $from } = state.selection;

          // Find the horizontal rule node near the current cursor position
          // (this should be the one we just inserted)
          let hrPos = -1;
          const cursorPos = $from.pos;

          // Search for horizontalRule node closest to cursor
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'horizontalRule') {
              const distance = Math.abs(pos - cursorPos);
              // Find the closest hr to cursor position (should be the one we just inserted)
              if (hrPos === -1 || Math.abs(hrPos - cursorPos) > distance) {
                hrPos = pos;
              }
            }
          });

          if (hrPos !== -1) {
            // Get the position after the hr node
            const hrNode = state.doc.nodeAt(hrPos);
            if (hrNode) {
              const afterHrPos = hrPos + hrNode.nodeSize;
              // Insert paragraph and set cursor
              editor
                .chain()
                .setTextSelection(afterHrPos)
                .insertContent({ type: 'paragraph' })
                .focus()
                .run();
            }
          } else {
            // Fallback: create paragraph near current position
            editor.chain().focus().createParagraphNear().run();
          }
        });
      },
    },
    // Layout
    {
      id: 'layoutTwoColumn',
      title: cmd.layoutTwoColumn?.title ?? 'Two Column Layout',
      description:
        cmd.layoutTwoColumn?.description ??
        'Split content into two side-by-side columns',
      icon: <LayoutTwoIcon />,
      aliases: ['layout2', 'two columns', '2 col', 'columns'],
      group: 'layout',
      action: (editor) => insertLayout(editor, 2),
    },
    {
      id: 'layoutThreeColumn',
      title: cmd.layoutThreeColumn?.title ?? 'Three Column Layout',
      description:
        cmd.layoutThreeColumn?.description ??
        'Split content into three side-by-side columns',
      icon: <LayoutThreeIcon />,
      aliases: ['layout3', 'three columns', '3 col'],
      group: 'layout',
      action: (editor) => insertLayout(editor, 3),
    },
  ];
}

/**
 * Default slash commands (without image upload config, uses base64)
 * Note: This is deprecated, use createDefaultSlashCommands with locale instead
 */
export const defaultSlashCommands: SlashCommand[] =
  createDefaultSlashCommands();

/**
 * Filter commands by query
 * Only matches title and aliases, not description
 */
export function filterCommands(
  commands: SlashCommand[],
  query: string
): SlashCommand[] {
  if (!query) return commands;

  const lowerQuery = query.toLowerCase();
  return commands.filter((cmd) => {
    // Match title (must start with query or contain as word)
    const titleLower = cmd.title.toLowerCase();
    const matchTitle =
      titleLower.startsWith(lowerQuery) ||
      titleLower.includes(` ${lowerQuery}`);

    // Match aliases (must start with query)
    const matchAlias =
      cmd.aliases?.some((a) => a.toLowerCase().startsWith(lowerQuery)) ?? false;

    // Only match title or aliases, not description
    return matchTitle || matchAlias;
  });
}
