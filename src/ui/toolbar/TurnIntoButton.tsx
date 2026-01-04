/**
 * Turn Into Button Component
 *
 * Allows converting the current block to different block types.
 */

import React, { useRef, useCallback, useMemo } from 'react';
import type { Editor } from '@tiptap/core';
import { cn, tokens, dropdownSectionHeaderStyle } from '../theme';
import { getLabelWithShortcut } from '../a11y';
import { useLocale } from '../LocaleContext';
import { PositionedDropdown } from '../PositionedDropdown';
import { ToolbarButton } from './ToolbarButton';
import {
  TextIcon,
  H1Icon,
  H2Icon,
  H3Icon,
  BulletListIcon,
  OrderedListIcon,
  ChevronDownIcon,
} from './icons';

export interface TurnIntoButtonProps {
  editor: Editor;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export interface BlockTypeOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

export function TurnIntoButton({ editor, isOpen, onToggle, onClose }: TurnIntoButtonProps): React.ReactElement {
  const locale = useLocale();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get current block type
  const getCurrentBlockType = useCallback((): string => {
    if (editor.isActive('heading', { level: 1 })) return 'heading1';
    if (editor.isActive('heading', { level: 2 })) return 'heading2';
    if (editor.isActive('heading', { level: 3 })) return 'heading3';
    if (editor.isActive('bulletList')) return 'bulletList';
    if (editor.isActive('orderedList')) return 'orderedList';
    if (editor.isActive('taskList')) return 'taskList';
    if (editor.isActive('blockquote')) return 'blockquote';
    if (editor.isActive('codeBlock')) return 'codeBlock';
    return 'paragraph';
  }, [editor]);

  // Block type options
  const blockOptions: BlockTypeOption[] = useMemo(
    () => [
      {
        id: 'paragraph',
        label: locale.toolbar.blockTypes.text,
        icon: <TextIcon />,
        action: (ed) => ed.chain().focus().setParagraph().run(),
        isActive: (ed) => ed.isActive('paragraph'),
      },
      {
        id: 'heading1',
        label: locale.toolbar.blockTypes.heading1,
        icon: <H1Icon />,
        action: (ed) => ed.chain().focus().setHeading({ level: 1 }).run(),
        isActive: (ed) => ed.isActive('heading', { level: 1 }),
      },
      {
        id: 'heading2',
        label: locale.toolbar.blockTypes.heading2,
        icon: <H2Icon />,
        action: (ed) => ed.chain().focus().setHeading({ level: 2 }).run(),
        isActive: (ed) => ed.isActive('heading', { level: 2 }),
      },
      {
        id: 'heading3',
        label: locale.toolbar.blockTypes.heading3,
        icon: <H3Icon />,
        action: (ed) => ed.chain().focus().setHeading({ level: 3 }).run(),
        isActive: (ed) => ed.isActive('heading', { level: 3 }),
      },
      {
        id: 'bulletList',
        label: locale.toolbar.blockTypes.bulletedList,
        icon: <BulletListIcon />,
        action: (ed) => ed.chain().focus().toggleBulletList().run(),
        isActive: (ed) => ed.isActive('bulletList'),
      },
      {
        id: 'orderedList',
        label: locale.toolbar.blockTypes.numberedList,
        icon: <OrderedListIcon />,
        action: (ed) => ed.chain().focus().toggleOrderedList().run(),
        isActive: (ed) => ed.isActive('orderedList'),
      },
    ],
    [locale]
  );

  const currentBlockType = getCurrentBlockType();
  const currentOption = blockOptions.find((opt) => opt.id === currentBlockType);

  const handleOptionClick = useCallback(
    (option: BlockTypeOption) => {
      option.action(editor);
      onClose();
      // Clear selection to close toolbar after switching block type
      setTimeout(() => {
        editor.chain().blur().run();
      }, 0);
    },
    [editor, onClose]
  );

  // Get short label for button (use locale block types)
  const getShortLabel = (label: string): string => {
    if (label === locale.toolbar.blockTypes.heading1) return locale.toolbar.blockTypes.heading1;
    if (label === locale.toolbar.blockTypes.heading2) return locale.toolbar.blockTypes.heading2;
    if (label === locale.toolbar.blockTypes.heading3) return locale.toolbar.blockTypes.heading3;
    if (label === locale.toolbar.blockTypes.bulletedList) return locale.toolbar.blockTypes.bulletedList;
    if (label === locale.toolbar.blockTypes.numberedList) return locale.toolbar.blockTypes.numberedList;
    return locale.toolbar.blockTypes.text;
  };

  return (
    <div style={{ position: 'relative' }}>
      <ToolbarButton
        ref={buttonRef}
        active={isOpen}
        onClick={onToggle}
        data-tooltip={getLabelWithShortcut(locale.toolbar.turnInto)}
        data-testid="toolbar-turnInto"
        aria-label={locale.aria.turnIntoButton}
        style={{ width: 'auto', minWidth: 'auto', padding: '0 8px', height: 'var(--pubwave-button-height, 28px)' }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 500 }}>
            {currentOption ? getShortLabel(currentOption.label) : locale.toolbar.blockTypes.text}
          </span>
          <ChevronDownIcon />
        </span>
      </ToolbarButton>

      <PositionedDropdown
        isOpen={isOpen}
        buttonRef={buttonRef}
        align="left"
        margin={8}
        onClickOutside={() => onClose()}
        className="pubwave-turn-into-dropdown"
        data-testid="turn-into-dropdown"
        style={{
          backgroundColor: 'var(--pubwave-surface, var(--pubwave-bg))',
          border: '1px solid var(--pubwave-border)',
          borderRadius: 'var(--pubwave-radius-lg, 8px)',
          boxShadow: 'var(--pubwave-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
          padding: 'var(--pubwave-spacing-1, 4px)',
          minWidth: '240px',
          zIndex: tokens.zIndex.dropdown + 1,
        }}
      >
        <div style={dropdownSectionHeaderStyle}>
          {locale.toolbar.turnInto}
        </div>
        {blockOptions.map((option) => {
          const active = option.isActive(editor);
          return (
            <button
              key={option.id}
              type="button"
              className={cn(
                'pubwave-toolbar__turn-into-option',
                active && 'pubwave-toolbar__turn-into-option--active'
              )}
              onClick={() => handleOptionClick(option)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--pubwave-spacing-2, 8px)',
                padding: 'var(--pubwave-spacing-2, 8px) var(--pubwave-spacing-3, 12px)',
                border: 'none',
                backgroundColor: active
                  ? 'var(--pubwave-primary-faded)'
                  : 'transparent',
                color: active
                  ? 'var(--pubwave-primary)'
                  : 'var(--pubwave-text)',
                cursor: 'pointer',
                fontSize: 'var(--pubwave-font-size-base, 14px)',
                textAlign: 'left',
                borderRadius: 'var(--pubwave-border-radius-sm, 0.25rem)',
                transition: 'background-color 0.1s ease',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '18px',
                  height: '18px',
                  flexShrink: 0,
                }}
              >
                {option.icon}
              </span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </PositionedDropdown>
    </div>
  );
}

