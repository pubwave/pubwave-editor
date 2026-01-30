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

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { SuggestionKeyDownProps } from '@tiptap/suggestion';
import type { SlashCommand } from './slashMenu/commands';
import { useScrollIntoView } from './slashMenu/useScrollIntoView';
import {
  menuStyle,
  groupContainerStyle,
  groupLabelStyle,
  itemStyle,
  iconStyle,
  titleStyle,
} from './slashMenu/styles';

/**
 * Slash Menu Component Props
 */
export interface SlashMenuListProps {
  items: SlashCommand[];
  command: (item: SlashCommand) => void;
  editor: Editor;
  query?: string;
  groupLabels?: Record<string, string>;
}

/**
 * Slash Menu List Component
 */
export const SlashMenuList = React.forwardRef<
  { onKeyDown: (props: SuggestionKeyDownProps) => boolean },
  SlashMenuListProps
>(function SlashMenuList({ items, command, query = '', groupLabels: groupLabelsProp }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement | null>(null);

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

  // Use scroll hook to handle scrolling
  useScrollIntoView(selectedIndex, menuRef, selectedItemRef);

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

  // Use groupLabels from props or fallback to defaults
  const groupLabels = groupLabelsProp || {
    basic: 'Style',
    list: 'Lists',
    media: 'Media',
    advanced: 'Advanced',
    layout: 'Layout',
  };

  // Don't render if no items
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="pubwave-slash-menu" ref={menuRef} style={menuStyle} data-testid="slash-menu">
      <div style={{ padding: 'var(--pubwave-spacing-1, 4px) 0' }}>
        {(() => {
          let globalIndex = 0;
          const groupOrder = ['basic', 'list', 'media', 'advanced', 'layout'];

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
                          ? 'var(--pubwave-hover-bg, #f3f4f6)'
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

// Re-export types and functions for backward compatibility
export type { SlashCommand } from './slashMenu/commands';
export { defaultSlashCommands, createDefaultSlashCommands, filterCommands } from './slashMenu/commands';
export { createSlashCommandsExtension } from './slashMenu/extension';

export default SlashMenuList;
