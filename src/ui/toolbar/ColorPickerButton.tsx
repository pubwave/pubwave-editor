/**
 * Color Picker Button Component
 *
 * Button that opens a color picker dropdown for text and background colors.
 */

import React, { useRef } from 'react';
import type { Editor } from '@tiptap/core';
import { ColorPicker } from '../ColorPicker';
import { ToolbarButton } from './ToolbarButton';
import { ColorIcon } from './icons';
import { getLabelWithShortcut } from '../a11y';
import { useLocale } from '../LocaleContext';

export interface ColorPickerButtonProps {
  editor: Editor;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function ColorPickerButton({ editor, isOpen, onToggle, onClose }: ColorPickerButtonProps): React.ReactElement {
  const locale = useLocale();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get current colors to show in icon
  const getCurrentTextColor = (): string | null => {
    try {
      const attrs = editor.getAttributes('textColor');
      return attrs?.color || null;
    } catch {
      return null;
    }
  };

  const getCurrentBackgroundColor = (): string | null => {
    try {
      // First check if backgroundColor mark is active in the selection
      if (!editor.isActive('backgroundColor')) {
        return null;
      }
      const attrs = editor.getAttributes('backgroundColor');
      return attrs?.backgroundColor || null;
    } catch {
      return null;
    }
  };

  const currentTextColor = getCurrentTextColor();
  const currentBackgroundColor = getCurrentBackgroundColor();
  const hasColor = currentTextColor || currentBackgroundColor;

  // Use current text color for icon, or get theme text color from computed style
  const getThemeTextColor = (): string => {
    if (typeof window === 'undefined') return '#1f2937'; // SSR fallback
    const editor = document.querySelector('.pubwave-editor');
    if (editor) {
      const computed = window.getComputedStyle(editor);
      return computed.getPropertyValue('--pubwave-text').trim() || '#1f2937';
    }
    return '#1f2937';
  };
  const iconTextColor = currentTextColor || getThemeTextColor();
  // Use current background color for icon if it exists, otherwise transparent (default)
  const iconBackgroundColor = currentBackgroundColor;

  return (
    <div style={{ position: 'relative' }}>
      <ToolbarButton
        ref={buttonRef}
        active={!!hasColor}
        onClick={onToggle}
        data-tooltip={getLabelWithShortcut(locale.toolbar.textColor)}
        data-testid="toolbar-colorPicker"
        aria-label={locale.aria.colorPickerButton}
      >
        <ColorIcon textColor={iconTextColor} backgroundColor={iconBackgroundColor} />
      </ToolbarButton>
      {isOpen && (
        <ColorPicker
          editor={editor}
          onClose={onClose}
          buttonRef={buttonRef}
        />
      )}
    </div>
  );
}

