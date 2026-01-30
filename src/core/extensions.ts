/**
 * Extensions Registry
 *
 * Composes and exports the Tiptap extensions used by the editor.
 * This provides a centralized place for extension configuration.
 */

import { Extension, type AnyExtension } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import History from '@tiptap/extension-history';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';

import type {
  BlockType,
  MarkType,
  EditorLocale as EditorLocaleCode,
} from '../types/editor';
import {
  createBlockExtensions,
  type BlockExtensionsConfig,
} from './extensions/blocks';
import type { ImageUploadConfig } from '../types/editor';
import {
  createMarkExtensions,
  type MarkExtensionsConfig,
} from './extensions/marks';
import {
  createSlashCommandsExtension,
  createDefaultSlashCommands,
  type SlashCommand,
} from '../ui/SlashMenu';
import { createDndPlugin } from './plugins/dnd';
import { createEditorBehaviorsPlugin } from './plugins/editorBehaviors';
import { getLocale } from '../i18n';

/**
 * Supported block types
 */
export const SUPPORTED_BLOCKS: readonly BlockType[] = [
  'paragraph',
  'heading',
  'bulletList',
  'orderedList',
  'taskList',
  'table',
  'blockquote',
  'codeBlock',
  'horizontalRule',
  'image',
  'chart',
  'layout',
] as const;

/**
 * Supported mark types
 */
export const SUPPORTED_MARKS: readonly MarkType[] = [
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'link',
] as const;

/**
 * Configuration for creating the extension set
 */
export interface ExtensionConfig
  extends BlockExtensionsConfig, MarkExtensionsConfig {
  /**
   * Placeholder text for empty editor
   */
  placeholder?: string;

  /**
   * Undo/redo history depth
   * @default 100
   */
  historyDepth?: number;

  /**
   * Enable slash commands menu
   * @default true
   */
  enableSlashCommands?: boolean;

  /**
   * Custom slash commands (merged with defaults)
   */
  slashCommands?: SlashCommand[];

  /**
   * Image upload configuration
   */
  imageUpload?: ImageUploadConfig;

  /**
   * Locale for internationalization
   */
  locale?: EditorLocaleCode;
}

/**
 * Create the core extension set for the editor
 *
 * This composes all block, mark, and feature extensions into a single array.
 */
export function createExtensions(config: ExtensionConfig = {}): AnyExtension[] {
  const {
    placeholder: placeholderProp,
    historyDepth = 100,
    headingLevels,
    linkOpenInNewTab,
    linkOpenOnClick,
    enableChart,
    enableLayout,
    enableSlashCommands = true,
    slashCommands,
    imageUpload,
    locale,
  } = config;

  // Get placeholder from prop or locale data
  const localeData = locale ? getLocale(locale) : null;
  const placeholder =
    placeholderProp ??
    localeData?.placeholder ??
    'Write,type "/" for commands...';

  const extensions: AnyExtension[] = [
    // Block extensions (document structure + block types)
    ...createBlockExtensions({
      headingLevels,
      imageUpload,
      enableChart,
      enableLayout,
    }),

    // Mark extensions (inline formatting)
    ...createMarkExtensions({ linkOpenInNewTab, linkOpenOnClick }),

    // Editor features
    Placeholder.configure({
      placeholder,
      emptyEditorClass: 'pubwave-editor--empty',
      emptyNodeClass: 'pubwave-editor__node--empty',
    }),
    History.configure({
      depth: historyDepth,
    }),
    Dropcursor.configure({
      color: 'var(--pubwave-dropcursor-color, #3b82f6)',
      width: 2,
    }),
    Gapcursor,

    // Drag and drop plugin
    Extension.create({
      name: 'dragAndDrop',
      addProseMirrorPlugins() {
        // Pass editor instance to the plugin
        return [createDndPlugin(this.editor)];
      },
    }),
    Extension.create({
      name: 'editorBehaviors',
      addProseMirrorPlugins() {
        return [createEditorBehaviorsPlugin()];
      },
    }),
  ];

  // Slash commands (optional)
  if (enableSlashCommands) {
    const slashLocale = locale ? getLocale(locale) : getLocale('en');
    const baseCommands = createDefaultSlashCommands(imageUpload, slashLocale);
    let commands = slashCommands
      ? [...baseCommands, ...slashCommands]
      : baseCommands;
    if (enableChart === false) {
      commands = commands.filter((command) => command.id !== 'chart');
    }
    if (enableLayout === false) {
      commands = commands.filter((command) => command.group !== 'layout');
    }
    extensions.push(
      createSlashCommandsExtension(commands, imageUpload, slashLocale)
    );
  }

  return extensions as Extension[];
}

/**
 * Get the default extensions with standard configuration
 */
export function getDefaultExtensions(): AnyExtension[] {
  return createExtensions();
}
