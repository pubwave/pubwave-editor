/**
 * Default Toolbar Content
 *
 * Default toolbar content with basic formatting buttons.
 */

import React, { useState, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import { getLabelWithShortcut, keyboardShortcuts } from '../a11y';
import { useLocale } from '../LocaleContext';
import type { SelectionState } from '../../core/selection';
import { ToolbarButton, ToolbarDivider } from './ToolbarButton';
import { TurnIntoButton } from './TurnIntoButton';
import { LinkButton } from './LinkButton';
import { ColorPickerButton } from './ColorPickerButton';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikeIcon,
  CodeIcon,
} from './icons';

export interface DefaultToolbarContentProps {
  editor: Editor;
  selectionState: SelectionState | null;
}

export function DefaultToolbarContent({
  editor,
  selectionState,
}: DefaultToolbarContentProps): React.ReactElement {
  const locale = useLocale();
  // Manage dropdown state centrally - only one can be open at a time
  const [openDropdown, setOpenDropdown] = useState<'turnInto' | 'link' | 'colorPicker' | null>(null);

  const handleBold = useCallback((): void => {
    setOpenDropdown(null); // Close any open dropdown
    editor.chain().focus().toggleBold().run();
  }, [editor]);

  const handleItalic = useCallback((): void => {
    setOpenDropdown(null); // Close any open dropdown
    editor.chain().focus().toggleItalic().run();
  }, [editor]);

  const handleUnderline = useCallback((): void => {
    setOpenDropdown(null); // Close any open dropdown
    editor.chain().focus().toggleUnderline().run();
  }, [editor]);

  const handleStrike = useCallback((): void => {
    setOpenDropdown(null); // Close any open dropdown
    editor.chain().focus().toggleStrike().run();
  }, [editor]);

  const handleCode = useCallback((): void => {
    setOpenDropdown(null); // Close any open dropdown
    editor.chain().focus().toggleCode().run();
  }, [editor]);

  const handleTurnIntoToggle = useCallback((): void => {
    setOpenDropdown((prev) => (prev === 'turnInto' ? null : 'turnInto'));
  }, []);

  const handleLinkToggle = useCallback((): void => {
    setOpenDropdown((prev) => (prev === 'link' ? null : 'link'));
  }, []);

  const handleColorPickerToggle = useCallback((): void => {
    setOpenDropdown((prev) => (prev === 'colorPicker' ? null : 'colorPicker'));
  }, []);

  const isBold = selectionState?.isBold ?? false;
  const isItalic = selectionState?.isItalic ?? false;
  const isUnderline = selectionState?.isUnderline ?? false;
  const isStrike = selectionState?.isStrike ?? false;
  const isCode = selectionState?.isCode ?? false;

  return (
    <>
      <TurnIntoButton 
        editor={editor} 
        isOpen={openDropdown === 'turnInto'}
        onToggle={handleTurnIntoToggle}
        onClose={() => setOpenDropdown(null)}
      />
      <ToolbarDivider />
      <ToolbarButton
        active={isBold}
        onClick={handleBold}
        data-tooltip={getLabelWithShortcut(locale.toolbar.bold, keyboardShortcuts.bold)}
        data-testid="toolbar-bold"
        aria-label={locale.aria.boldButton}
      >
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton
        active={isItalic}
        onClick={handleItalic}
        data-tooltip={getLabelWithShortcut(locale.toolbar.italic, keyboardShortcuts.italic)}
        data-testid="toolbar-italic"
        aria-label={locale.aria.italicButton}
      >
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton
        active={isUnderline}
        onClick={handleUnderline}
        data-tooltip={getLabelWithShortcut(locale.toolbar.underline, keyboardShortcuts.underline)}
        data-testid="toolbar-underline"
        aria-label={locale.aria.underlineButton}
      >
        <UnderlineIcon />
      </ToolbarButton>
      <ToolbarButton
        active={isStrike}
        onClick={handleStrike}
        data-tooltip={getLabelWithShortcut(locale.toolbar.strike, keyboardShortcuts.strike)}
        data-testid="toolbar-strike"
        aria-label={locale.aria.strikeButton}
      >
        <StrikeIcon />
      </ToolbarButton>
      <ToolbarButton
        active={isCode}
        onClick={handleCode}
        data-tooltip={getLabelWithShortcut(locale.toolbar.code, keyboardShortcuts.code)}
        data-testid="toolbar-code"
        aria-label={locale.aria.codeButton}
      >
        <CodeIcon />
      </ToolbarButton>
      <ToolbarDivider />
      <LinkButton 
        editor={editor} 
        isOpen={openDropdown === 'link'}
        onToggle={handleLinkToggle}
        onClose={() => setOpenDropdown(null)}
        selectionState={selectionState}
      />
      <ColorPickerButton 
        editor={editor} 
        isOpen={openDropdown === 'colorPicker'}
        onToggle={handleColorPickerToggle}
        onClose={() => setOpenDropdown(null)}
      />
    </>
  );
}

