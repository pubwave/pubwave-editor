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
import { safeRequestAnimationFrame } from '../core/ssr';

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
 * Only matches title and aliases, not description
 */
function filterCommands(commands: SlashCommand[], query: string): SlashCommand[] {
  if (!query) return commands;

  const lowerQuery = query.toLowerCase();
  return commands.filter((cmd) => {
    // Match title (must start with query or contain as word)
    const titleLower = cmd.title.toLowerCase();
    const matchTitle = titleLower.startsWith(lowerQuery) || titleLower.includes(` ${lowerQuery}`);
    
    // Match aliases (must start with query)
    const matchAlias = cmd.aliases?.some((a) => a.toLowerCase().startsWith(lowerQuery)) ?? false;
    
    // Only match title or aliases, not description
    return matchTitle || matchAlias;
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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const selectedItemRef = React.useRef<HTMLButtonElement | null>(null);

  // Auto-select first item when items change and there are filtered results
  useEffect(() => {
    if (items.length > 0 && query.length > 0) {
      // If there's a query and matching items, select the first one
      setSelectedIndex(0);
    } else if (items.length === 0) {
      // If no items, clear selection
      setSelectedIndex(-1);
    } else {
      // If no query but items exist, don't auto-select
      setSelectedIndex(-1);
    }
  }, [items, query]);

  // Scroll selected item into view when selection changes
  // Ensure top and bottom content remains visible
  useEffect(() => {
    if (selectedIndex >= 0 && selectedItemRef.current && menuRef.current) {
      const menu = menuRef.current;
      const selectedItem = selectedItemRef.current;
      
      const menuScrollTop = menu.scrollTop;
      const menuClientHeight = menu.clientHeight;
      const menuScrollHeight = menu.scrollHeight;
      const itemOffsetTop = selectedItem.offsetTop;
      const itemHeight = selectedItem.offsetHeight;
      
      // Find first group and first item for top visibility check
      const firstGroup = menu.querySelector('.pubwave-slash-menu__group') as HTMLElement | null;
      const firstItem = menu.querySelector('.pubwave-slash-menu__item') as HTMLElement | null;
      const lastItem = Array.from(menu.querySelectorAll('.pubwave-slash-menu__item')).pop() as HTMLElement | null;
      
      // Calculate item position relative to visible area
      const itemTopRelative = itemOffsetTop - menuScrollTop;
      const itemBottomRelative = itemTopRelative + itemHeight;
      
      // Check if we need to scroll
      let targetScrollTop = menuScrollTop;
      
      // If item is above visible area, scroll up but ensure first group/item remains visible
      if (itemTopRelative < 0) {
        targetScrollTop = itemOffsetTop - 4; // 4px padding from top
        // Ensure first group is still visible (must be at or above scrollTop)
        if (firstGroup && targetScrollTop > firstGroup.offsetTop) {
          targetScrollTop = Math.max(0, firstGroup.offsetTop);
        }
        // Ensure first item is still visible (must be at or above scrollTop + small padding)
        if (firstItem && targetScrollTop > firstItem.offsetTop - 2) {
          targetScrollTop = Math.max(0, firstItem.offsetTop - 2);
        }
      }
      // If item is below visible area, scroll down but ensure last item remains visible
      else if (itemBottomRelative > menuClientHeight) {
        targetScrollTop = itemOffsetTop - menuClientHeight + itemHeight + 4; // 4px padding from bottom
        // Ensure last item is still visible (with some padding at bottom)
        if (lastItem) {
          const lastItemBottom = lastItem.offsetTop + lastItem.offsetHeight;
          const maxScrollTop = lastItemBottom - menuClientHeight + 2; // 2px padding from bottom
          if (targetScrollTop > maxScrollTop) {
            targetScrollTop = maxScrollTop;
          }
        }
        // Don't scroll beyond maximum
        targetScrollTop = Math.min(menuScrollHeight - menuClientHeight, targetScrollTop);
      }
      // If item is already visible, don't scroll to preserve top/bottom visibility
      
      // Only update scroll if it changed
      if (Math.abs(targetScrollTop - menuScrollTop) > 0.5) {
        menu.scrollTop = targetScrollTop;
      }
    }
  }, [selectedIndex]);

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
      if (flatItems.length === 0) {
        return false; // No items, let default behavior handle it (allow Enter to create new line)
      }

      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => {
          if (prev < 0) {
            return flatItems.length - 1;
          }
          if (prev <= 0) {
            return 0; // Stop at top
          }
          return prev - 1;
        });
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => {
          if (prev < 0) {
            return 0;
          }
          if (prev >= flatItems.length - 1) {
            return flatItems.length - 1; // Stop at bottom
          }
          return prev + 1;
        });
        return true;
      }

      if (event.key === 'Enter') {
        // Only handle Enter if an item is selected
        if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
          selectItem(selectedIndex);
          return true;
        }
        // If no item is selected, allow default behavior (create new line)
        return false;
      }

      return false;
    },
  }));

  // Don't render if no items
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="pubwave-slash-menu" ref={menuRef} style={menuStyle}>
      <div style={{ padding: '4px 0' }}>
        {(() => {
          let globalIndex = 0;
          const groupOrder = ['basic', 'list', 'media', 'advanced'];
          
          return groupOrder.map((group) => {
            const groupItems = groupedItems[group];
            if (!groupItems || groupItems.length === 0) return null;

            return (
              <div key={group} className="pubwave-slash-menu__group" style={groupContainerStyle}>
                <div className="pubwave-slash-menu__group-label" style={groupLabelStyle}>
                  {groupLabels[group] || group}
                </div>
                {groupItems.map((item) => {
                  const currentIndex = globalIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      ref={isSelected ? selectedItemRef : null}
                      className={`pubwave-slash-menu__item ${isSelected ? 'pubwave-slash-menu__item--selected' : ''}`}
                      style={{
                        ...itemStyle,
                        backgroundColor: isSelected
                          ? '#f3f4f6'
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
        })()}
      </div>
    </div>
  );
});

// Styles
const menuStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: `1px solid #e5e7eb`,
  borderRadius: '8px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  maxHeight: '280px',
  overflowY: 'auto',
  minWidth: '240px',
  maxWidth: '300px',
  padding: '4px',
  display: 'flex',
  flexDirection: 'column',
};

const groupContainerStyle: React.CSSProperties = {
  marginBottom: '0',
};

const groupLabelStyle: React.CSSProperties = {
  padding: '8px 12px 4px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const itemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
  padding: '8px 12px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  borderRadius: '6px',
  transition: `background-color 0.1s ease`,
  fontSize: '14px',
  color: '#1a1a1a',
};

const iconStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  color: '#4b5563',
  flexShrink: 0,
};

const titleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 400,
  color: '#1a1a1a',
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
            // For task list, handle specially
            if (props.id === 'taskList') {
              if (editor.isActive('taskList')) {
                // If already in task list, toggle it off
                editor.chain().focus().deleteRange(range).toggleTaskList().run();
              } else {
                // Delete range and toggle task list
                editor.chain().focus().deleteRange(range).toggleTaskList().run();
                
                // Use requestAnimationFrame to ensure DOM is updated, then focus the paragraph
                safeRequestAnimationFrame(() => {
                  safeRequestAnimationFrame(() => {
                    const { state } = editor.view;
                    const { $from } = state.selection;
                    
                    // Find the task list node and the first paragraph inside it
                    let paragraphPos = -1;
                    
                    // Search from current position backwards to find the taskList node
                    for (let depth = $from.depth; depth >= 0; depth--) {
                      const node = $from.node(depth);
                      if (node.type.name === 'taskList') {
                        const taskListStart = $from.start(depth);
                        const taskListEnd = $from.end(depth);
                        
                        // Search for the first paragraph inside the task list
                        state.doc.nodesBetween(taskListStart, taskListEnd, (node, pos) => {
                          if (node.type.name === 'paragraph' && paragraphPos === -1) {
                            paragraphPos = pos + 1; // +1 to position inside the paragraph
                            return false; // Stop searching after finding first paragraph
                          }
                        });
                        break;
                      }
                    }
                    
                    // If found, set cursor position and ensure it's visible
                    if (paragraphPos !== -1 && paragraphPos < state.doc.content.size) {
                      // Set selection using Tiptap
                      editor.chain().setTextSelection(paragraphPos).run();
                      
                      // Use another requestAnimationFrame to ensure selection is set before focusing
                      safeRequestAnimationFrame(() => {
                        // Focus the editor
                        editor.commands.focus();
                        
                        // Directly manipulate DOM to ensure cursor is visible
                        const editorDom = editor.view.dom as HTMLElement;
                        const paragraph = editorDom.querySelector('ul[data-type="taskList"] li p.pubwave-editor__paragraph');
                        
                        if (paragraph && editorDom) {
                          // Focus the editor DOM element
                          editorDom.focus();
                          
                          // Get the selection and range
                          const selection = window.getSelection();
                          if (!selection) return;
                          
                          const range = document.createRange();
                          const br = paragraph.querySelector('br.ProseMirror-trailingBreak');
                          
                          if (br) {
                            // For empty paragraph with <br>, set cursor after the <br>
                            range.setStartAfter(br);
                            range.setEndAfter(br);
                          } else {
                            // For paragraph with content, set at start
                            if (paragraph.firstChild && paragraph.firstChild.nodeType === Node.TEXT_NODE) {
                              range.setStart(paragraph.firstChild, 0);
                              range.setEnd(paragraph.firstChild, 0);
                            } else {
                              range.setStart(paragraph, 0);
                              range.setEnd(paragraph, 0);
                            }
                          }
                          
                          // Apply the selection
                          selection.removeAllRanges();
                          selection.addRange(range);
                        }
                      });
                    } else {
                      // Fallback: just focus the editor
                      editor.commands.focus();
                    }
                  });
                });
              }
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
                  zIndex: tokens.zIndex.dropdown,
                  arrow: false,
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
                    // Ensure z-index is set correctly
                    const box = instance.popper.querySelector('.tippy-box') as HTMLElement;
                    if (box) {
                      box.style.zIndex = String(tokens.zIndex.dropdown);
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
                // If no items found, hide the menu
                if (props.items.length === 0) {
                  popup[0]?.hide();
                  return;
                }

                component.updateProps({
                  ...props,
                  query: props.query,
                  editor: props.editor,
                });

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

export default SlashMenuList;
