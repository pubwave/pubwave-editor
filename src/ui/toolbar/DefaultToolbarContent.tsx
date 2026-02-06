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
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
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

  const handleAlignLeft = useCallback((): void => {
    setOpenDropdown(null);
    editor.chain().focus().setTextAlign('left').run();
  }, [editor]);

  const handleAlignCenter = useCallback((): void => {
    setOpenDropdown(null);
    editor.chain().focus().setTextAlign('center').run();
  }, [editor]);

  const handleAlignRight = useCallback((): void => {
    setOpenDropdown(null);
    editor.chain().focus().setTextAlign('right').run();
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
  const isAlignLeft =
    editor.isActive('paragraph', { textAlign: 'left' }) ||
    editor.isActive('heading', { textAlign: 'left' });
  const isAlignCenter =
    editor.isActive('paragraph', { textAlign: 'center' }) ||
    editor.isActive('heading', { textAlign: 'center' });
  const isAlignRight =
    editor.isActive('paragraph', { textAlign: 'right' }) ||
    editor.isActive('heading', { textAlign: 'right' });

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
      <ToolbarButton
        active={isAlignLeft}
        onClick={handleAlignLeft}
        data-tooltip="Align Left"
        data-testid="toolbar-align-left"
        aria-label="Align left"
      >
        <AlignLeftIcon />
      </ToolbarButton>
      <ToolbarButton
        active={isAlignCenter}
        onClick={handleAlignCenter}
        data-tooltip="Align Center"
        data-testid="toolbar-align-center"
        aria-label="Align center"
      >
        <AlignCenterIcon />
      </ToolbarButton>
      <ToolbarButton
        active={isAlignRight}
        onClick={handleAlignRight}
        data-tooltip="Align Right"
        data-testid="toolbar-align-right"
        aria-label="Align right"
      >
        <AlignRightIcon />
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
