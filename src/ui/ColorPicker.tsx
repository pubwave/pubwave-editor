/**
 * Color Picker Component
 *
 * A color picker with:
 * - Recently used colors
 * - Text color options
 * - Background color options
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { tokens, dropdownSectionHeaderStyle } from './theme';
import { PositionedDropdown } from './PositionedDropdown';
import { useLocale } from './LocaleContext';

export interface ColorPickerProps {
  editor: Editor;
  onClose?: () => void;
  buttonRef?: React.RefObject<HTMLElement>;
}

// Color palettes based on the image description
const TEXT_COLORS = [
  { name: 'Default', value: null, color: '#1f2937' }, // Black
  { name: 'Gray', value: '#6b7280', color: '#6b7280' },
  { name: 'Brown', value: '#92400e', color: '#92400e' },
  { name: 'Orange', value: '#ea580c', color: '#ea580c' },
  { name: 'Orange Dark', value: '#c2410c', color: '#c2410c' },
  { name: 'Green', value: '#16a34a', color: '#16a34a' },
  { name: 'Blue', value: '#2563eb', color: '#2563eb' },
  { name: 'Purple', value: '#9333ea', color: '#9333ea' },
  { name: 'Pink', value: '#ec4899', color: '#ec4899' },
  { name: 'Red', value: '#dc2626', color: '#dc2626' },
];

const BACKGROUND_COLORS = [
  { name: 'Default', value: null, color: '#ffffff' }, // White
  { name: 'Gray', value: '#f3f4f6', color: '#f3f4f6' },
  { name: 'Peach', value: '#fed7aa', color: '#fed7aa' },
  { name: 'Orange', value: '#fdba74', color: '#fdba74' },
  { name: 'Yellow', value: '#fde047', color: '#fde047' },
  { name: 'Green', value: '#86efac', color: '#86efac' },
  { name: 'Blue', value: '#93c5fd', color: '#93c5fd' },
  { name: 'Purple', value: '#c084fc', color: '#c084fc' },
  { name: 'Pink', value: '#f9a8d4', color: '#f9a8d4' },
  { name: 'Red', value: '#fca5a5', color: '#fca5a5' },
];

// Storage key for recent colors
const RECENT_COLORS_STORAGE_KEY = 'pubwave-editor-recent-colors';
const MAX_RECENT_COLORS = 5;

// Load recent colors from localStorage
function loadRecentColors(): Array<{ type: 'text' | 'background'; value: string }> {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_COLORS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

// Save recent colors to localStorage
function saveRecentColors(colors: Array<{ type: 'text' | 'background'; value: string }>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RECENT_COLORS_STORAGE_KEY, JSON.stringify(colors));
  } catch {
    // Ignore storage errors
  }
}

export function ColorPicker({ editor, onClose, buttonRef }: ColorPickerProps): React.ReactElement {
  const locale = useLocale();
  const [recentColors, setRecentColors] = useState<Array<{ type: 'text' | 'background'; value: string }>>([]);
  const pickerRef = useRef<HTMLDivElement>(null);
  const tippyInstancesRef = useRef<TippyInstance[]>([]);

  // Load recent colors from localStorage after mount (SSR-safe)
  useEffect(() => {
    const loaded = loadRecentColors();
    if (loaded.length > 0) {
      setRecentColors(loaded);
    }
  }, []);

  // Get current colors from selection
  const getCurrentTextColor = (): string | null => {
    try {
      const attrs = editor.getAttributes('textColor');
      return attrs?.color || null;
    } catch {
      // If mark is not active, getAttributes might throw or return empty
      return null;
    }
  };

  const getCurrentBackgroundColor = (): string | null => {
    try {
      const attrs = editor.getAttributes('backgroundColor');
      return attrs?.backgroundColor || null;
    } catch {
      // If mark is not active, getAttributes might throw or return empty
      return null;
    }
  };

  const currentTextColor = getCurrentTextColor();
  const currentBackgroundColor = getCurrentBackgroundColor();

  // Handle text color selection
  const handleTextColorSelect = (color: string | null): void => {
    if (color === null) {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
      // Add to recent colors and save to localStorage
      setRecentColors((prev) => {
        const newRecent = [{ type: 'text' as const, value: color }, ...prev.filter((c) => !(c.type === 'text' && c.value === color))];
        const limited = newRecent.slice(0, MAX_RECENT_COLORS);
        saveRecentColors(limited);
        return limited;
      });
    }
    // Don't close on selection - only close on outside click
  };

  // Handle background color selection
  const handleBackgroundColorSelect = (color: string | null): void => {
    if (color === null) {
      editor.chain().focus().unsetBackgroundColor().run();
    } else {
      editor.chain().focus().setBackgroundColor(color).run();
      // Add to recent colors and save to localStorage
      setRecentColors((prev) => {
        const newRecent = [{ type: 'background' as const, value: color }, ...prev.filter((c) => !(c.type === 'background' && c.value === color))];
        const limited = newRecent.slice(0, MAX_RECENT_COLORS);
        saveRecentColors(limited);
        return limited;
      });
    }
    // Don't close on selection - only close on outside click
  };


  // Initialize tooltips for all color buttons
  useEffect(() => {
    if (!pickerRef.current) return;

    // Clean up previous instances
    tippyInstancesRef.current.forEach((instance) => instance.destroy());
    tippyInstancesRef.current = [];

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      if (!pickerRef.current) return;

      // Find all buttons with data-tooltip attribute
      const buttons = pickerRef.current.querySelectorAll<HTMLElement>('[data-tooltip]');
      
      buttons.forEach((button) => {
        const tooltipText = button.getAttribute('data-tooltip');
        if (tooltipText) {
          const instance = tippy(button, {
            content: tooltipText,
            placement: 'top',
            delay: [300, 0],
            duration: [200, 150],
            theme: 'light-border',
          });
          tippyInstancesRef.current.push(instance);
        }
      });
    });

    // Cleanup on unmount
    return () => {
      tippyInstancesRef.current.forEach((instance) => instance.destroy());
      tippyInstancesRef.current = [];
    };
  }, [recentColors, currentTextColor, currentBackgroundColor, locale]);


  return (
    <PositionedDropdown
      isOpen={true}
      buttonRef={buttonRef!}
      align="center"
      margin={8}
      onClickOutside={() => onClose?.()}
      className="pubwave-color-picker"
      data-testid="color-picker"
      style={{
        backgroundColor: 'var(--pubwave-bg, #ffffff)',
        border: '1px solid var(--pubwave-border, #e5e7eb)',
        borderRadius: 'var(--pubwave-radius-lg, 8px)',
        boxShadow: 'var(--pubwave-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))',
        padding: '12px',
        minWidth: '240px',
        zIndex: tokens.zIndex.dropdown + 1,
      }}
    >
      <div ref={pickerRef}>
      {/* Recently used colors */}
      {recentColors.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              ...dropdownSectionHeaderStyle,
              paddingLeft: 0,
              paddingRight: 0,
              marginBottom: '8px',
            }}
          >
            {locale.toolbar.recentlyUsed}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {recentColors.map((recent, index) => (
              <button
                key={`${recent.type}-${recent.value}-${index}`}
                type="button"
                onClick={() => {
                  if (recent.type === 'text') {
                    handleTextColorSelect(recent.value);
                  } else {
                    handleBackgroundColorSelect(recent.value);
                  }
                }}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                  border: '1px solid var(--pubwave-border, #e5e7eb)',
                  backgroundColor: recent.type === 'background' ? recent.value : '#ffffff',
                  cursor: 'pointer',
                  padding: recent.type === 'text' ? '4px' : 0,
                  display: recent.type === 'text' ? 'flex' : 'block',
                  alignItems: recent.type === 'text' ? 'center' : 'normal',
                  justifyContent: recent.type === 'text' ? 'center' : 'normal',
                }}
                data-tooltip={recent.type === 'text' ? `${recent.value} text` : `${recent.value} background`}
              >
                {recent.type === 'text' && (
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: recent.value,
                      lineHeight: 1,
                    }}
                  >
                    A
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text color section */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            ...dropdownSectionHeaderStyle,
            paddingLeft: 0,
            paddingRight: 0,
            marginBottom: '8px',
          }}
        >
          {locale.toolbar.textColor}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {TEXT_COLORS.map((colorOption) => {
            const isActive = currentTextColor === colorOption.value;
            return (
              <button
                key={colorOption.name}
                type="button"
                onClick={() => handleTextColorSelect(colorOption.value)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '4px',
                  border: isActive ? '2px solid var(--pubwave-primary, #3b82f6)' : '1px solid var(--pubwave-border, #e5e7eb)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                data-tooltip={colorOption.value ? `${colorOption.name} text` : 'Default text'}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: colorOption.color,
                  }}
                >
                  A
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Background color section */}
      <div>
        <div
          style={{
            ...dropdownSectionHeaderStyle,
            paddingLeft: 0,
            paddingRight: 0,
            marginBottom: '8px',
          }}
        >
          {locale.toolbar.backgroundColor}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {BACKGROUND_COLORS.map((colorOption) => {
            const isActive = currentBackgroundColor === colorOption.value;
            return (
              <button
                key={colorOption.name}
                type="button"
                onClick={() => handleBackgroundColorSelect(colorOption.value)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '4px',
                  border: isActive ? '2px solid var(--pubwave-primary, #3b82f6)' : '1px solid var(--pubwave-border, #e5e7eb)',
                  backgroundColor: colorOption.color,
                  cursor: 'pointer',
                  padding: 0,
                }}
                data-tooltip={colorOption.value ? `${colorOption.name} background` : 'Default background'}
              />
            );
          })}
        </div>
      </div>
      </div>
    </PositionedDropdown>
  );
}

