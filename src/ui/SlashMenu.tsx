/**
 * Slash Menu Component
 *
 * A command menu triggered by typing "/" in the editor.
 * Provides quick access to block types, formatting, and actions.
 *
 * Constitution requirement (4.2):
 * - MUST trigger on "/" in editable text blocks
 * - MUST support keyboard navigation
 * - MUST filter by command name, alias, description
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Editor, Range } from '@tiptap/core';
import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { tokens } from './theme';

/**
 * Command item definition
 */
export interface SlashCommand {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  aliases?: string[];
  group: 'basic' | 'list' | 'media' | 'advanced';
  action: (editor: Editor) => void;
}

/**
 * Default slash commands
 */
export const defaultSlashCommands: SlashCommand[] = [
  // Basic blocks - Style group
  {
    id: 'paragraph',
    title: 'Text',
    description: 'Plain text block',
    icon: <TextIcon />,
    aliases: ['p', 'text', 'paragraph'],
    group: 'basic',
    action: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: 'heading1',
    title: 'Heading 1',
    description: 'Large section heading',
    icon: <H1Icon />,
    aliases: ['h1', 'title'],
    group: 'basic',
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'heading2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: <H2Icon />,
    aliases: ['h2', 'subtitle'],
    group: 'basic',
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'heading3',
    title: 'Heading 3',
    description: 'Small section heading',
    icon: <H3Icon />,
    aliases: ['h3'],
    group: 'basic',
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  // Lists
  {
    id: 'bulletList',
    title: 'Bullet List',
    description: 'Create a bulleted list',
    icon: <BulletListIcon />,
    aliases: ['ul', 'bullet', 'unordered', '-'],
    group: 'list',
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'orderedList',
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: <OrderedListIcon />,
    aliases: ['ol', 'numbered', 'ordered', '1.'],
    group: 'list',
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'taskList',
    title: 'To-do list',
    description: 'Create a todo list with checkboxes',
    icon: <TaskListIcon />,
    aliases: ['todo', 'task', 'checkbox', '[]'],
    group: 'list',
    action: (editor) => editor.chain().focus().toggleTaskList().run(),
  },
  // Advanced
  {
    id: 'blockquote',
    title: 'Blockquote',
    description: 'Create a quote block',
    icon: <QuoteIcon />,
    aliases: ['quote', 'blockquote', '>'],
    group: 'advanced',
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'codeBlock',
    title: 'Code',
    description: 'Create a code snippet',
    icon: <CodeBlockIcon />,
    aliases: ['code', 'pre', 'snippet', '```'],
    group: 'advanced',
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'horizontalRule',
    title: 'Divider',
    description: 'Create a horizontal line',
    icon: <DividerIcon />,
    aliases: ['hr', 'divider', 'line', '---'],
    group: 'advanced',
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
];

/**
 * Group labels - Simple names like Notion
 */
const groupLabels: Record<string, string> = {
  basic: 'Style',
  list: 'Lists',
  media: 'Media',
  advanced: 'Advanced',
};

/**
 * Filter commands by query
 */
function filterCommands(commands: SlashCommand[], query: string): SlashCommand[] {
  if (!query) return commands;

  const lowerQuery = query.toLowerCase();
  return commands.filter((cmd) => {
    const matchTitle = cmd.title.toLowerCase().includes(lowerQuery);
    const matchDesc = cmd.description.toLowerCase().includes(lowerQuery);
    const matchAlias = cmd.aliases?.some((a) => a.toLowerCase().includes(lowerQuery));
    return matchTitle || matchDesc || matchAlias;
  });
}

/**
 * Slash Menu Component Props
 */
interface SlashMenuListProps {
  items: SlashCommand[];
  command: (item: SlashCommand) => void;
  editor: Editor;
  query?: string;
}

/**
 * Slash Menu List Component
 */
export const SlashMenuList = React.forwardRef<
  { onKeyDown: (props: SuggestionKeyDownProps) => boolean },
  SlashMenuListProps
>(function SlashMenuList({ items, command, query = '' }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  // Group items
  const groupedItems = useMemo(() => {
    const groups: Record<string, SlashCommand[]> = {};
    for (const item of items) {
      const group = groups[item.group] ?? [];
      group.push(item);
      groups[item.group] = group;
    }
    return groups;
  }, [items]);

  // Flat list for keyboard navigation
  const flatItems = items;

  const selectItem = useCallback(
    (index: number) => {
      const item = flatItems[index];
      if (item) {
        command(item);
      }
    },
    [flatItems, command]
  );

  // Expose keyboard handler
  React.useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev <= 0 ? flatItems.length - 1 : prev - 1));
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev >= flatItems.length - 1 ? 0 : prev + 1));
        return true;
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="pubwave-slash-menu" style={menuStyle}>
      {/* Filter input display */}
      <div className="pubwave-slash-menu__filter" style={filterStyle}>
        <span style={{ color: tokens.colors.primary }}>/</span>
        <span style={{ color: tokens.colors.textMuted }}>
          {query || 'Filter...'}
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '12px 16px', color: tokens.colors.textMuted }}>
          No commands found
        </div>
      ) : (
        (() => {
          let globalIndex = 0;
          const groupOrder = ['basic', 'list', 'media', 'advanced'];
          
          return groupOrder.map((group) => {
            const groupItems = groupedItems[group];
            if (!groupItems || groupItems.length === 0) return null;

            return (
              <div key={group} className="pubwave-slash-menu__group">
                <div className="pubwave-slash-menu__group-label" style={groupLabelStyle}>
                  {groupLabels[group] || group}
                </div>
                {groupItems.map((item) => {
                  const currentIndex = globalIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      className={`pubwave-slash-menu__item ${isSelected ? 'pubwave-slash-menu__item--selected' : ''}`}
                      style={{
                        ...itemStyle,
                        backgroundColor: isSelected
                          ? `var(--pubwave-menu-selected-bg, ${tokens.colors.hover})`
                          : 'transparent',
                      }}
                      onClick={() => selectItem(currentIndex)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      <span className="pubwave-slash-menu__item-icon" style={iconStyle}>
                        {item.icon}
                      </span>
                      <span className="pubwave-slash-menu__item-title" style={titleStyle}>
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          });
        })()
      )}
    </div>
  );
});

// Styles
const menuStyle: React.CSSProperties = {
  backgroundColor: `var(--pubwave-menu-bg, ${tokens.colors.surface})`,
  border: `1px solid var(--pubwave-menu-border, ${tokens.colors.border})`,
  borderRadius: tokens.borderRadius.lg,
  boxShadow: tokens.shadow.popup,
  maxHeight: '400px',
  overflowY: 'auto',
  minWidth: '220px',
};

const filterStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  padding: '8px 12px',
  margin: '4px 8px 8px',
  backgroundColor: `var(--pubwave-filter-bg, ${tokens.colors.hover})`,
  borderRadius: tokens.borderRadius.md,
  fontSize: '14px',
};

const groupLabelStyle: React.CSSProperties = {
  padding: '8px 12px 4px',
  fontSize: '11px',
  fontWeight: 500,
  color: tokens.colors.textMuted,
};

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  padding: '6px 12px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  transition: `background-color ${tokens.transition.fast}`,
};

const iconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  color: tokens.colors.textMuted,
  flexShrink: 0,
};

const titleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 400,
  color: `var(--pubwave-menu-text, ${tokens.colors.text})`,
};

// Icons
function TextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
  );
}

function H1Icon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h8M4 18V6M12 18V6M17 10l3-2v12" />
    </svg>
  );
}

function H2Icon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h8M4 18V6M12 18V6M21 18h-5c0-2.5 5-2.5 5-5 0-1.5-1-3-3-3s-3 1.5-3 3" />
    </svg>
  );
}

function H3Icon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h8M4 18V6M12 18V6M17 12h3M17 18c2.5 0 4-1 4-3s-1.5-3-4-3" />
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <text x="3" y="8" fontSize="8" fill="currentColor" stroke="none">1</text>
      <text x="3" y="14" fontSize="8" fill="currentColor" stroke="none">2</text>
      <text x="3" y="20" fontSize="8" fill="currentColor" stroke="none">3</text>
    </svg>
  );
}

function TaskListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="4" height="4" rx="0.5" />
      <rect x="3" y="14" width="4" height="4" rx="0.5" />
      <path d="M4 16l1.5 1.5L7 15" />
      <line x1="10" y1="7" x2="21" y2="7" />
      <line x1="10" y1="16" x2="21" y2="16" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h4" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h4" />
    </svg>
  );
}

function CodeBlockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16,18 22,12 16,6" />
      <polyline points="8,6 2,12 8,18" />
    </svg>
  );
}

function DividerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}

/**
 * Create the Slash Commands Extension
 */
export function createSlashCommandsExtension(commands: SlashCommand[] = defaultSlashCommands) {
  return Extension.create({
    name: 'slashCommands',

    addOptions() {
      return {
        suggestion: {
          char: '/',
          command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashCommand }) => {
            // Delete the "/" trigger and query text, then execute the command
            editor.chain().focus().deleteRange(range).run();
            props.action(editor);
          },
        } as Partial<SuggestionProps>,
      };
    },

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,
          items: ({ query }: { query: string }) => filterCommands(commands, query),
          render: () => {
            let component: ReactRenderer<
              { onKeyDown: (props: SuggestionKeyDownProps) => boolean },
              SlashMenuListProps
            >;
            let popup: TippyInstance[];

            return {
              onStart: (props: SuggestionProps) => {
                component = new ReactRenderer(SlashMenuList, {
                  props: {
                    ...props,
                    query: props.query,
                    editor: this.editor,
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
                });
              },

              onUpdate(props: SuggestionProps) {
                component.updateProps({
                  ...props,
                  query: props.query,
                  editor: props.editor,
                });

                if (!props.clientRect) return;

                popup[0]?.setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
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

export default SlashMenuList;
