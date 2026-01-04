/**
 * SlashMenu Extension
 *
 * Tiptap extension for the SlashMenu command system.
 */

import type { Editor, Range } from '@tiptap/core';
import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { tokens } from '../theme';
import type { ImageUploadConfig } from '../../types/editor';
import type { EditorLocale } from '../../i18n';
import type { SlashCommand } from './commands';
import { filterCommands, defaultSlashCommands, createDefaultSlashCommands } from './commands';
import { SlashMenuList } from '../SlashMenu';

/**
 * Create the Slash Commands Extension
 */
export function createSlashCommandsExtension(
  commands: SlashCommand[] = defaultSlashCommands,
  imageUploadConfig?: ImageUploadConfig,
  locale?: EditorLocale
) {
  // If imageUploadConfig or locale is provided, recreate commands with the config
  const finalCommands = imageUploadConfig || locale
    ? createDefaultSlashCommands(imageUploadConfig, locale)
    : commands;

  // Get group labels from locale or use defaults
  const groupLabels = locale?.slashMenu?.groups || {
    basic: 'Style',
    list: 'Lists',
    media: 'Media',
    advanced: 'Advanced',
  };

  return Extension.create({
    name: 'slashCommands',

    addOptions() {
      return {
        suggestion: {
          char: '/',
          command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashCommand }) => {
            // For to-do lists, we simply toggle the list logic
            // If we are appending to an existing list, the cursor naturally moves to the new item
            // If we are creating a new list, the cursor stays formatting the current line
            if (props.id === 'taskList') {
              editor.chain().focus().deleteRange(range).toggleTaskList().run();
              return;
            }

            // For other commands, delete range and execute action
            editor.chain().focus().deleteRange(range).run();
            props.action(editor);
          },
        } as Partial<SuggestionProps>,
      };
    },

    addProseMirrorPlugins() {
      const editor = this.editor;
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,
          // Disable slash commands in code blocks
          allowed: ({ state, range }: { state: any; range: Range }) => {
            try {
              // Use editor instance to check if we're in a code block
              if (editor.isActive('codeBlock')) {
                return false;
              }
              // Also check the position where "/" was typed as a fallback
              const $pos = state.doc.resolve(range.from);
              // Check if we're inside a code block by walking up the node tree
              for (let d = $pos.depth; d >= 1; d--) {
                const node = $pos.node(d);
                if (node.type.name === 'codeBlock') {
                  return false;
                }
              }
              return true;
            } catch (e) {
              // If resolution fails, allow by default
              return true;
            }
          },
          items: ({ query }: { query: string }) => filterCommands(finalCommands, query),
          render: () => {
            let component: ReactRenderer<
              { onKeyDown: (props: SuggestionKeyDownProps) => boolean },
              {
                items: SlashCommand[];
                command: (item: SlashCommand) => void;
                editor: Editor;
                query?: string;
                groupLabels?: Record<string, string>;
              }
            >;
            let popup: TippyInstance[];

            return {
              onStart: (props: SuggestionProps) => {
                // Check if we're in a code block - if so, don't show the menu
                if (this.editor.isActive('codeBlock')) {
                  return;
                }

                component = new ReactRenderer(SlashMenuList, {
                  props: {
                    ...props,
                    query: props.query,
                    editor: this.editor,
                    groupLabels,
                  },
                  editor: this.editor,
                });

                if (!props.clientRect) return;

                popup = tippy('body', {
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: 'manual',
                  placement: 'bottom-start',
                  offset: [0, 8],
                  zIndex: tokens.zIndex.dropdown,
                  arrow: false,
                  // Disable animations to prevent black block flash
                  duration: [0, 0],
                  animation: false,
                  popperOptions: {
                    modifiers: [
                      {
                        name: 'preventOverflow',
                        options: {
                          boundary: 'viewport',
                          padding: 8,
                          altAxis: true,
                        },
                      },
                      {
                        name: 'flip',
                        options: {
                          fallbackPlacements: ['top-start', 'bottom-end', 'top'],
                        },
                      },
                    ],
                  },
                  onShow(instance) {
                    // Ensure z-index is set correctly and background is transparent
                    const box = instance.popper.querySelector('.tippy-box') as HTMLElement;
                    if (box) {
                      box.style.zIndex = String(tokens.zIndex.dropdown);
                      // Ensure background is transparent to prevent black block flash
                      box.style.backgroundColor = 'transparent';
                      box.style.background = 'transparent';
                      box.style.border = 'none';
                    }

                    // Dynamically adjust max height based on available space
                    const menu = instance.popper.querySelector('.pubwave-slash-menu') as HTMLElement;
                    if (menu) {
                      const proseMirror = document.querySelector('.ProseMirror') as HTMLElement;
                      if (proseMirror) {
                        const menuRect = menu.getBoundingClientRect();
                        const proseMirrorRect = proseMirror.getBoundingClientRect();

                        // Calculate available space from menu top to editor bottom
                        const availableSpace = proseMirrorRect.bottom - menuRect.top - 16;

                        // Set max height to available space, but clamp between 200px and 280px
                        const calculatedMaxHeight = Math.max(200, Math.min(280, availableSpace));
                        menu.style.maxHeight = `${calculatedMaxHeight}px`;
                      }
                    }
                  },
                });
              },

              onUpdate(props: SuggestionProps) {
                // Always update component props, even when items.length === 0
                // This ensures onKeyDown sees the correct empty state
                component.updateProps({
                  ...props,
                  query: props.query,
                  editor: props.editor,
                  groupLabels,
                });

                // If no items found, immediately hide and destroy the menu to prevent black block flash
                if (props.items.length === 0) {
                  // Hide immediately without animation
                  if (popup[0]) {
                    popup[0].hide();
                    // Force hide by setting opacity to 0 immediately
                    const box = popup[0].popper.querySelector('.tippy-box') as HTMLElement;
                    if (box) {
                      box.style.opacity = '0';
                      box.style.pointerEvents = 'none';
                    }
                  }
                  return;
                }

                if (!props.clientRect) return;

                popup[0]?.setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });

                // Ensure menu is shown if it was hidden
                if (!popup[0]?.state.isVisible) {
                  popup[0]?.show();
                }
              },

              onKeyDown(props: SuggestionKeyDownProps) {
                if (props.event.key === 'Escape') {
                  popup[0]?.hide();
                  return true;
                }

                return component.ref?.onKeyDown(props) ?? false;
              },

              onExit() {
                popup[0]?.destroy();
                component.destroy();
              },
            };
          },
        }),
      ];
    },
  });
}

