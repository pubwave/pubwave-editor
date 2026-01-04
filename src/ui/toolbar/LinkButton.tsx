/**
 * Link Button Component
 *
 * Button that opens a dropdown for adding/editing/removing links.
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { tokens } from '../theme';
import { getLabelWithShortcut } from '../a11y';
import { useLocale } from '../LocaleContext';
import { PositionedDropdown } from '../PositionedDropdown';
import { safeRequestAnimationFrame, isMobileDevice } from '../../core/util';
import { saveSelection, restoreSelection, type SavedSelection } from '../focus';
import type { SelectionState } from '../../core/selection';
import { ToolbarButton } from './ToolbarButton';
import { LinkIcon, ExternalLinkIcon, CheckIcon, ClearIcon } from './icons';

export interface LinkButtonProps {
  editor: Editor;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  selectionState: SelectionState | null;
}

export function LinkButton({ editor, isOpen, onToggle, onClose, selectionState }: LinkButtonProps): React.ReactElement {
  const locale = useLocale();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tippyInstancesRef = useRef<TippyInstance[]>([]);
  const savedSelectionRef = useRef<SavedSelection | null>(null);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const hasLink = selectionState?.hasLink ?? false;
  const currentLinkHref = selectionState?.linkHref ?? null;

  // Initialize link URL when dropdown opens and save selection
  useEffect(() => {
    if (isOpen) {
      // Save selection state before opening dropdown
      savedSelectionRef.current = saveSelection(editor);
      
      if (currentLinkHref) {
        setLinkUrl(currentLinkHref);
      } else {
        setLinkUrl('');
      }
      // Focus input after a short delay to ensure dropdown is rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      // Clear saved selection when dropdown closes
      savedSelectionRef.current = null;
    }
  }, [isOpen, currentLinkHref, editor]);

  // Initialize tooltips for dropdown buttons
  useEffect(() => {
    // Don't initialize tooltips on mobile devices
    if (isMobileDevice()) {
      return;
    }

    if (!isOpen) {
      // Clean up tooltips when dropdown is closed
      tippyInstancesRef.current.forEach((instance) => instance.destroy());
      tippyInstancesRef.current = [];
      return;
    }

    // Clean up previous instances
    tippyInstancesRef.current.forEach((instance) => instance.destroy());
    tippyInstancesRef.current = [];

    // Use requestAnimationFrame to ensure dropdown and conditional buttons are rendered
    safeRequestAnimationFrame(() => {
      safeRequestAnimationFrame(() => {
        if (!dropdownRef.current) return;

        // Find all buttons with data-tooltip attribute in the dropdown
        const buttons = dropdownRef.current.querySelectorAll<HTMLElement>('[data-tooltip]');
        
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
    });

    // Cleanup on unmount or when dropdown closes
    return () => {
      tippyInstancesRef.current.forEach((instance) => instance.destroy());
      tippyInstancesRef.current = [];
    };
  }, [isOpen, locale, linkUrl, currentLinkHref]);

  const handleSubmit = useCallback((e?: React.FormEvent): void => {
    e?.preventDefault();
    if (!linkUrl.trim()) {
      // If empty, remove link
      // First restore selection if we have a saved one
      if (savedSelectionRef.current) {
        restoreSelection(editor, savedSelectionRef.current);
      }
      // Then remove the link
      editor.chain().focus().unsetLink().run();
      // Restore selection again after operation
      if (savedSelectionRef.current) {
        safeRequestAnimationFrame(() => {
          safeRequestAnimationFrame(() => {
            restoreSelection(editor, savedSelectionRef.current);
          });
        });
      }
      onClose();
      return;
    }

    // Normalize URL (add protocol if missing)
    let normalizedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl) && !normalizedUrl.startsWith('/') && !normalizedUrl.startsWith('#')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // First restore selection if we have a saved one
    if (savedSelectionRef.current) {
      restoreSelection(editor, savedSelectionRef.current);
    }
    // Then set the link
    editor.chain().focus().setLink({ href: normalizedUrl }).run();
    // Restore selection again after operation
    if (savedSelectionRef.current) {
      safeRequestAnimationFrame(() => {
        safeRequestAnimationFrame(() => {
          restoreSelection(editor, savedSelectionRef.current);
        });
      });
    }
    onClose();
  }, [editor, linkUrl, onClose]);

  const handleOpenLink = useCallback((): void => {
    const urlToOpen = linkUrl.trim() || currentLinkHref;
    if (urlToOpen) {
      // Normalize URL if needed
      let normalizedUrl = urlToOpen;
      if (!/^https?:\/\//i.test(normalizedUrl) && !normalizedUrl.startsWith('/') && !normalizedUrl.startsWith('#')) {
        normalizedUrl = `https://${normalizedUrl}`;
      }
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
    }
  }, [linkUrl, currentLinkHref]);

  const handleClear = useCallback((): void => {
    setLinkUrl('');
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      editor.chain().focus().run();
    }
  }, [handleSubmit, onClose, editor]);

  return (
    <div style={{ position: 'relative' }}>
      <ToolbarButton
        ref={buttonRef}
        active={hasLink}
        onClick={onToggle}
        data-tooltip={getLabelWithShortcut(locale.toolbar.link)}
        data-testid="toolbar-link"
        aria-label={locale.aria.linkButton}
      >
        <LinkIcon />
      </ToolbarButton>

      <PositionedDropdown
        isOpen={isOpen}
        buttonRef={buttonRef}
        align="left"
        margin={8}
        onClickOutside={() => onClose()}
        className="pubwave-link-dropdown"
        style={{
          backgroundColor: 'var(--pubwave-surface, var(--pubwave-bg))',
          border: '1px solid var(--pubwave-border)',
          borderRadius: 'var(--pubwave-radius-lg, 8px)',
          boxShadow: 'var(--pubwave-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
          padding: 'var(--pubwave-spacing-2, 8px)',
          minWidth: '280px',
          zIndex: tokens.zIndex.dropdown + 1,
        }}
      >
        <div ref={dropdownRef}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                ref={inputRef}
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={locale.linkPlaceholder}
                data-testid="link-input"
                aria-label={locale.aria.linkUrlInput}
                style={{
                  flex: 1,
                  padding: '6px 100px 6px 8px',
                  border: '1px solid var(--pubwave-border)',
                  borderRadius: 'var(--pubwave-radius-sm, 4px)',
                  fontSize: 'var(--pubwave-font-size-base, 14px)',
                  backgroundColor: 'var(--pubwave-bg)',
                  color: 'var(--pubwave-text)',
                  outline: 'none',
                }}
              />
              <div style={{ position: 'absolute', right: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  data-tooltip={locale.toolbar.confirmLink}
                  data-testid="link-confirm-button"
                  aria-label={locale.aria.linkConfirmButton}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    padding: 0,
                    border: 'none',
                    borderRadius: 'var(--pubwave-radius-sm, 4px)',
                    backgroundColor: 'transparent',
                    color: 'var(--pubwave-text)',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--pubwave-hover, rgba(0, 0, 0, 0.05))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <CheckIcon />
                </button>
                {(linkUrl.trim() || currentLinkHref) && (
                  <button
                    type="button"
                    onClick={handleOpenLink}
                    data-tooltip={locale.toolbar.openLink}
                    data-testid="link-open-button"
                    aria-label={locale.aria.linkOpenButton}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      padding: 0,
                      border: 'none',
                      borderRadius: 'var(--pubwave-radius-sm, 4px)',
                      backgroundColor: 'transparent',
                      color: 'var(--pubwave-text)',
                      cursor: 'pointer',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--pubwave-hover, rgba(0, 0, 0, 0.05))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <ExternalLinkIcon />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClear}
                  data-tooltip={locale.toolbar.clearLink}
                  data-testid="link-clear-button"
                  aria-label={locale.aria.linkClearButton}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    padding: 0,
                    border: 'none',
                    borderRadius: 'var(--pubwave-radius-sm, 4px)',
                    backgroundColor: 'transparent',
                    color: 'var(--pubwave-text)',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--pubwave-hover, rgba(0, 0, 0, 0.05))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ClearIcon />
                </button>
              </div>
            </div>
          </form>
        </div>
      </PositionedDropdown>
    </div>
  );
}

