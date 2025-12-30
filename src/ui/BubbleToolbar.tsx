/**
 * Bubble Toolbar Component
 *
 * A contextual floating toolbar that appears when text is selected.
 * Follows the constitution requirement: toolbar visibility is purely selection-driven,
 * never on cursor-only state.
 *
 * Key behaviors:
 * - Appears only when text is selected (non-empty selection)
 * - Hidden immediately when selection is cleared
 * - Positioned near the selection without flicker
 * - Reflects current mark state (bold/italic/link active)
 */

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import type { Editor } from '@tiptap/core';
import { cn, tokens } from './theme';
import { ariaLabels, getLabelWithShortcut, keyboardShortcuts } from './a11y';
import { getSelectionState, shouldShowToolbar } from '../core/selection';
import type { SelectionState } from '../core/selection';
import { safeRequestAnimationFrame } from '../core/ssr';

/**
 * Toolbar position calculated relative to viewport
 */
export interface ToolbarPosition {
  top: number;
  left: number;
  visible: boolean;
}

export interface BubbleToolbarProps {
  /** The Tiptap editor instance */
  editor: Editor;
  /** Additional CSS class names */
  className?: string;
  /** Custom toolbar content (renders default if not provided) */
  children?: React.ReactNode;
  /** Callback when toolbar visibility changes */
  onVisibilityChange?: (visible: boolean) => void;
}

/**
 * Default offset from selection bounds
 */
const TOOLBAR_OFFSET = 8;

/**
 * Check if editor is valid for operations
 */
function isEditorReady(editor: Editor): boolean {
  return !editor.isDestroyed;
}

/**
 * Calculate toolbar position based on selection coordinates
 */
function calculatePosition(
  editor: Editor,
  toolbarEl: HTMLElement | null
): ToolbarPosition {
  if (!toolbarEl) {
    return { top: 0, left: 0, visible: false };
  }

  const { view } = editor;
  const { from, to } = view.state.selection;

  // Get the coordinates of the selection
  const start = view.coordsAtPos(from);
  const end = view.coordsAtPos(to);

  // Calculate selection bounds
  const selectionTop = Math.min(start.top, end.top);
  const selectionLeft = Math.min(start.left, end.left);
  const selectionRight = Math.max(start.right, end.right);

  // Get toolbar dimensions
  const toolbarRect = toolbarEl.getBoundingClientRect();
  const toolbarWidth = toolbarRect.width;
  const toolbarHeight = toolbarRect.height;

  // Position above the selection, centered
  const centerX = (selectionLeft + selectionRight) / 2;
  let left = centerX - toolbarWidth / 2;
  let top = selectionTop - toolbarHeight - TOOLBAR_OFFSET;

  // Clamp to viewport bounds
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 8;

  // Keep toolbar within horizontal viewport
  if (left < padding) {
    left = padding;
  } else if (left + toolbarWidth > viewportWidth - padding) {
    left = viewportWidth - toolbarWidth - padding;
  }

  // If toolbar would be above viewport, show below selection
  if (top < padding) {
    const selectionBottom = Math.max(start.bottom, end.bottom);
    top = selectionBottom + TOOLBAR_OFFSET;
  }

  // Keep toolbar within vertical viewport
  if (top + toolbarHeight > viewportHeight - padding) {
    top = viewportHeight - toolbarHeight - padding;
  }

  return { top, left, visible: true };
}

/**
 * BubbleToolbar - Selection-driven floating toolbar
 */
export function BubbleToolbar({
  editor,
  className,
  children,
  onVisibilityChange,
}: BubbleToolbarProps): React.ReactElement | null {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const lastMouseUpTimeRef = useRef(0);
  const mouseDownInEditorRef = useRef(false);
  const [position, setPosition] = useState<ToolbarPosition>({
    top: 0,
    left: 0,
    visible: false,
  });
  const [selectionState, setSelectionState] = useState<SelectionState | null>(
    null
  );
  const [allowShow, setAllowShow] = useState(false);

  // Track whether toolbar should be visible
  const shouldShow = useMemo(() => {
    if (!isEditorReady(editor)) return false;
    // Only show if mouse is up and we allow showing
    if (isMouseDownRef.current || !allowShow) return false;
    // Depend on selectionState to trigger recalculation
    void selectionState;
    return shouldShowToolbar(editor);
  }, [editor, selectionState, allowShow]);

  // Update selection state when editor selection changes
  const updateSelectionState = useCallback((): void => {
    if (!isEditorReady(editor)) return;

    const newState = getSelectionState(editor);
    setSelectionState(newState);
  }, [editor]);

  // Update position when selection changes
  const updatePosition = useCallback((): void => {
    if (!shouldShow || !toolbarRef.current) {
      setPosition((prev) => ({ ...prev, visible: false }));
      return;
    }

    safeRequestAnimationFrame(() => {
      if (!isEditorReady(editor)) return;

      const newPosition = calculatePosition(editor, toolbarRef.current);
      setPosition(newPosition);
    });
  }, [editor, shouldShow]);

  // Track mouse down/up events
  useEffect(() => {
    if (!isEditorReady(editor)) return;

    const editorElement = editor.view.dom;
    const editorContainer = editorElement.closest('.pubwave-editor') as HTMLElement | null;

    const handleMouseDown = (e: MouseEvent): void => {
      // Check if mouse down is inside toolbar - if so, don't hide it
      const target = e.target as HTMLElement | null;
      const toolbarElement = toolbarRef.current;
      if (toolbarElement && target && toolbarElement.contains(target)) {
        // Click is inside toolbar, don't hide it
        isMouseDownRef.current = false;
        return;
      }

      // Check if mouse down is inside editor
      if (editorContainer && target && editorContainer.contains(target)) {
        mouseDownInEditorRef.current = true;
      } else {
        mouseDownInEditorRef.current = false;
      }
      
      isMouseDownRef.current = true;
      setAllowShow(false); // Hide toolbar immediately when mouse is pressed
    };

    const handleMouseUp = (e: MouseEvent): void => {
      const now = Date.now();
      const timeSinceLastUp = now - lastMouseUpTimeRef.current;
      const isDoubleClick = timeSinceLastUp < 300;
      lastMouseUpTimeRef.current = now;

      // Check if mouse up is inside toolbar - if so, don't process it
      const target = e.target as HTMLElement | null;
      const toolbarElement = toolbarRef.current;
      if (toolbarElement && target && toolbarElement.contains(target)) {
        // Click is inside toolbar, keep it visible
        isMouseDownRef.current = false;
        return;
      }

      isMouseDownRef.current = false;

      // Only check selection if mouse was down in editor
      if (!mouseDownInEditorRef.current) {
        setAllowShow(false);
        return;
      }

      // After mouse up, wait a bit for selection to complete, then check
      // For double-click, wait a bit longer to ensure the selection from double-click is finalized
      const delay = isDoubleClick ? 100 : 10;
      setTimeout(() => {
        if (!isEditorReady(editor)) return;
        
        // Check if there's actual selected content (even after double-click)
        if (shouldShowToolbar(editor)) {
          updateSelectionState();
          setAllowShow(true);
          safeRequestAnimationFrame(() => {
            updatePosition();
          });
        } else {
          setAllowShow(false);
          setPosition((prev) => ({ ...prev, visible: false }));
        }
      }, delay);
    };

    // Listen to mouse events on document
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor, updateSelectionState, updatePosition]);

  // Subscribe to editor updates (only when mouse is up)
  useEffect(() => {
    if (!isEditorReady(editor)) return;

    // Initial state
    updateSelectionState();

    // Listen for selection and transaction updates
    const handleUpdate = (): void => {
      // Only update if mouse is not pressed and we allow showing
      if (!isMouseDownRef.current && allowShow) {
        updateSelectionState();
      }
    };

    const handleSelectionUpdate = (): void => {
      // Only update if mouse is not pressed and we allow showing
      if (!isMouseDownRef.current && allowShow) {
        updateSelectionState();
        // Delay position update to ensure DOM is ready
        safeRequestAnimationFrame(() => {
          updatePosition();
        });
      }
    };

    const handleBlur = (): void => {
      // Don't hide toolbar if focus moved to toolbar
      // Use setTimeout to check if focus is now on toolbar
      setTimeout(() => {
        const activeElement = document.activeElement;
        const toolbarElement = toolbarRef.current;
        if (toolbarElement && activeElement && toolbarElement.contains(activeElement)) {
          // Focus is on toolbar, don't hide it
          return;
        }
        // Hide toolbar when editor loses focus
        setAllowShow(false);
        handleUpdate();
      }, 0);
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleSelectionUpdate);
    editor.on('focus', handleSelectionUpdate);
    editor.on('blur', handleBlur);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleSelectionUpdate);
      editor.off('focus', handleSelectionUpdate);
      editor.off('blur', handleBlur);
    };
  }, [editor, updateSelectionState, updatePosition, allowShow]);

  // Update position when shouldShow changes
  useEffect(() => {
    updatePosition();
    onVisibilityChange?.(shouldShow);
  }, [shouldShow, updatePosition, onVisibilityChange]);

  // Handle window resize and scroll
  useEffect(() => {
    if (!shouldShow) return;

    const handleReposition = (): void => {
      updatePosition();
    };

    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [shouldShow, updatePosition]);

  // Don't render anything if editor is not ready
  if (!isEditorReady(editor)) {
    return null;
  }

  // Render toolbar (hidden initially for position calculation)
  return (
    <div
      ref={toolbarRef}
      className={cn(
        'pubwave-toolbar',
        shouldShow && position.visible
          ? 'pubwave-toolbar--visible'
          : 'pubwave-toolbar--hidden',
        className
      )}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: tokens.zIndex.toolbar,
        opacity: shouldShow && position.visible ? 1 : 0,
        pointerEvents: shouldShow && position.visible ? 'auto' : 'none',
        transform:
          shouldShow && position.visible
            ? 'translateY(0)'
            : 'translateY(4px)',
        transition: `opacity ${tokens.transition.fast}, transform ${tokens.transition.fast}`,
      }}
      role="toolbar"
      aria-label={ariaLabels.toolbar}
      aria-hidden={!shouldShow || !position.visible}
    >
      <div
        className="pubwave-toolbar__content"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          padding: 'var(--pubwave-spacing-1, 4px)',
          backgroundColor: 'var(--pubwave-bg, #ffffff)',
          border: `1px solid var(--pubwave-border, #e5e7eb)`,
          borderRadius: 'var(--pubwave-radius-lg, 8px)',
          boxShadow: 'var(--pubwave-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
        }}
      >
        {children ?? (
          <DefaultToolbarContent
            editor={editor}
            selectionState={selectionState}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Default toolbar content with basic formatting buttons
 */
interface DefaultToolbarContentProps {
  editor: Editor;
  selectionState: SelectionState | null;
}

function DefaultToolbarContent({
  editor,
  selectionState,
}: DefaultToolbarContentProps): React.ReactElement {
  const handleBold = useCallback((): void => {
    editor.chain().focus().toggleBold().run();
  }, [editor]);

  const handleItalic = useCallback((): void => {
    editor.chain().focus().toggleItalic().run();
  }, [editor]);

  const handleUnderline = useCallback((): void => {
    editor.chain().focus().toggleUnderline().run();
  }, [editor]);

  const handleStrike = useCallback((): void => {
    editor.chain().focus().toggleStrike().run();
  }, [editor]);

  const handleCode = useCallback((): void => {
    editor.chain().focus().toggleCode().run();
  }, [editor]);

  const handleLink = useCallback((): void => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else if (selectionState?.hasLink) {
      editor.chain().focus().unsetLink().run();
    }
  }, [editor, selectionState]);

  const isBold = selectionState?.isBold ?? false;
  const isItalic = selectionState?.isItalic ?? false;
  const isUnderline = selectionState?.isUnderline ?? false;
  const isStrike = selectionState?.isStrike ?? false;
  const isCode = selectionState?.isCode ?? false;
  const hasLink = selectionState?.hasLink ?? false;

  return (
    <>
      <ToolbarButton
        active={isBold}
        onClick={handleBold}
        title={getLabelWithShortcut('Bold', keyboardShortcuts.bold)}
        aria-label={ariaLabels.boldButton}
      >
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton
        active={isItalic}
        onClick={handleItalic}
        title={getLabelWithShortcut('Italic', keyboardShortcuts.italic)}
        aria-label={ariaLabels.italicButton}
      >
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton
        active={isUnderline}
        onClick={handleUnderline}
        title="Underline (⌘U)"
        aria-label="Toggle underline"
      >
        <UnderlineIcon />
      </ToolbarButton>
      <ToolbarButton
        active={isStrike}
        onClick={handleStrike}
        title="Strikethrough (⌘⇧X)"
        aria-label="Toggle strikethrough"
      >
        <StrikeIcon />
      </ToolbarButton>
      <ToolbarButton
        active={isCode}
        onClick={handleCode}
        title="Inline Code (⌘E)"
        aria-label="Toggle inline code"
      >
        <CodeIcon />
      </ToolbarButton>
      <ToolbarDivider />
      <ToolbarButton
        active={hasLink}
        onClick={handleLink}
        title={getLabelWithShortcut('Link', keyboardShortcuts.link)}
        aria-label={ariaLabels.linkButton}
      >
        <LinkIcon />
      </ToolbarButton>
    </>
  );
}

/**
 * Toolbar button component
 */
interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
  'aria-label': string;
  children: React.ReactNode;
}

function ToolbarButton({
  active = false,
  disabled = false,
  onClick,
  title,
  'aria-label': ariaLabel,
  children,
}: ToolbarButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      className={cn(
        'pubwave-toolbar__button',
        active && 'pubwave-toolbar__button--active',
        disabled && 'pubwave-toolbar__button--disabled'
      )}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 'var(--pubwave-button-width, 28px)',
        height: 'var(--pubwave-button-height, 28px)',
        padding: 0,
        border: 'none',
        borderRadius: 'var(--pubwave-radius-sm, 4px)',
        backgroundColor: 'transparent',
        color: active ? 'var(--pubwave-primary, #3b82f6)' : 'var(--pubwave-text-secondary, #374151)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'color 0.1s ease, background-color 0.1s ease',
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={active}
      onMouseDown={(e) => {
        // Prevent toolbar from hiding when clicking buttons
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'var(--pubwave-hover-bg, #f3f4f6)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </button>
  );
}

/**
 * Toolbar divider
 */
function ToolbarDivider(): React.ReactElement {
  return (
    <div
      className="pubwave-toolbar__divider"
      style={{
        width: 'var(--pubwave-divider-width, 1px)',
        height: 'var(--pubwave-divider-height, 20px)',
        backgroundColor: 'var(--pubwave-border, #e5e7eb)',
        margin: '0 var(--pubwave-spacing-1, 4px)',
      }}
      role="separator"
      aria-orientation="vertical"
    />
  );
}

/**
 * Icon components (minimal inline SVGs)
 */
function BoldIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2h5a3 3 0 0 1 0 6H4V2z" />
      <path d="M4 8h6a3 3 0 0 1 0 6H4V8z" />
    </svg>
  );
}

function ItalicIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="11" y1="2" x2="5" y2="14" />
      <line x1="6" y1="2" x2="12" y2="2" />
      <line x1="4" y1="14" x2="10" y2="14" />
    </svg>
  );
}

function LinkIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6.5 9.5a3 3 0 0 0 4.5-.5l2-2a3 3 0 0 0-4.24-4.24l-1.5 1.5" />
      <path d="M9.5 6.5a3 3 0 0 0-4.5.5l-2 2a3 3 0 0 0 4.24 4.24l1.5-1.5" />
    </svg>
  );
}

function UnderlineIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v6a4 4 0 0 0 8 0V2" />
      <line x1="2" y1="14" x2="14" y2="14" />
    </svg>
  );
}

function StrikeIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="2" y1="8" x2="14" y2="8" />
      <path d="M5 4c0-1 1.5-2 3-2s3 .5 3 2c0 1-1 2-3 2" />
      <path d="M5 12c0 1 1.5 2 3 2s3-.5 3-2c0-1-1-2-3-2" />
    </svg>
  );
}

function CodeIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="5 4 1 8 5 12" />
      <polyline points="11 4 15 8 11 12" />
    </svg>
  );
}

export default BubbleToolbar;
