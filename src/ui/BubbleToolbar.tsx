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
import tippy, { Instance as TippyInstance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { cn, tokens, dropdownSectionHeaderStyle } from './theme';
import { ariaLabels, getLabelWithShortcut, keyboardShortcuts } from './a11y';
import { getSelectionState, shouldShowToolbar } from '../core/selection';
import type { SelectionState } from '../core/selection';
import { safeRequestAnimationFrame } from '../core/ssr';
import { ColorPicker } from './ColorPicker';
import { PositionedDropdown } from './PositionedDropdown';
import { calculateVerticalPosition } from './positionUtils';
import { useLocale } from './LocaleContext';

// Icons for block types (reused from SlashMenu)
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

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6,9 12,15 18,9" />
    </svg>
  );
}

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
  
  // Calculate vertical position using shared utility
  const selectionBottom = Math.max(start.bottom, end.bottom);
  const verticalPosition = calculateVerticalPosition(
    selectionTop,
    selectionBottom,
    toolbarHeight,
    TOOLBAR_OFFSET
  );
  
  let top: number;
  if (verticalPosition === 'top') {
    top = selectionTop - toolbarHeight - TOOLBAR_OFFSET;
  } else {
    top = selectionBottom + TOOLBAR_OFFSET;
  }

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

  // Keep toolbar within vertical viewport
  if (top < padding) {
    top = padding;
  } else if (top + toolbarHeight > viewportHeight - padding) {
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
  const tippyInstancesRef = useRef<TippyInstance[]>([]);

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
      // Only update if mouse is not pressed
      if (!isMouseDownRef.current) {
        updateSelectionState();
        // Check if we should show toolbar based on current selection
        if (shouldShowToolbar(editor)) {
          setAllowShow(true);
        } else {
          setAllowShow(false);
        }
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

  // Get locale for tooltip re-initialization
  const locale = useLocale();

  // Initialize tooltips for all toolbar buttons
  useEffect(() => {
    if (!shouldShow || !position.visible || !toolbarRef.current) {
      // Clean up tooltips when toolbar is hidden
      tippyInstancesRef.current.forEach((instance) => instance.destroy());
      tippyInstancesRef.current = [];
      return;
    }

    // Clean up previous instances
    tippyInstancesRef.current.forEach((instance) => instance.destroy());
    tippyInstancesRef.current = [];

    // Use requestAnimationFrame to ensure DOM is updated with new locale values
    safeRequestAnimationFrame(() => {
      if (!toolbarRef.current) return;

      // Find all buttons with data-tooltip attribute
      const buttons = toolbarRef.current.querySelectorAll<HTMLElement>('[data-tooltip]');
      
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

    // Cleanup on unmount or when toolbar hides
    return () => {
      tippyInstancesRef.current.forEach((instance) => instance.destroy());
      tippyInstancesRef.current = [];
    };
  }, [shouldShow, position.visible, locale]);

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
        // Ensure toolbar is above editor container and can receive clicks
        isolation: 'isolate',
      }}
      role="toolbar"
      aria-label={ariaLabels.toolbar}
      aria-hidden={!shouldShow || !position.visible}
      data-testid="bubble-toolbar"
    >
      <div
        className="pubwave-toolbar__content"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          padding: 'var(--pubwave-spacing-1, 4px)',
          backgroundColor: 'var(--pubwave-surface, var(--pubwave-bg))',
          color: 'var(--pubwave-text)',
          border: '1px solid var(--pubwave-border)',
          borderRadius: 'var(--pubwave-radius-lg, 8px)',
          boxShadow: 'var(--pubwave-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
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

/**
 * Toolbar button component
 */
interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  'data-tooltip'?: string;
  'data-testid'?: string;
  'aria-label': string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ active = false, disabled = false, onClick, 'data-tooltip': dataTooltip, 'data-testid': dataTestId, 'aria-label': ariaLabel, children, style }, ref) => {
    return (
      <button
        ref={ref}
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
          width: style?.width ?? 'var(--pubwave-button-width, 28px)',
          height: style?.height ?? 'var(--pubwave-button-height, 28px)',
          minWidth: style?.minWidth,
          padding: style?.padding ?? 0,
          border: 'none',
          borderRadius: 'var(--pubwave-radius-sm, 4px)',
          backgroundColor: 'transparent',
          color: active ? 'var(--pubwave-primary)' : 'var(--pubwave-text)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'color 0.1s ease, background-color 0.1s ease',
          ...style,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        disabled={disabled}
        data-tooltip={dataTooltip}
        data-testid={dataTestId}
        aria-label={ariaLabel}
        aria-pressed={active}
        onMouseDown={(e) => {
          // Prevent toolbar from hiding when clicking buttons
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {children}
      </button>
    );
  }
);

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
        backgroundColor: 'var(--pubwave-border)',
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

/**
 * Turn Into Button Component
 * Allows converting the current block to different block types
 */
interface TurnIntoButtonProps {
  editor: Editor;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

interface BlockTypeOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

function TurnIntoButton({ editor, isOpen, onToggle, onClose }: TurnIntoButtonProps): React.ReactElement {
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

/**
 * Link Button Component
 */
interface LinkButtonProps {
  editor: Editor;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  selectionState: SelectionState | null;
}

function LinkButton({ editor, isOpen, onToggle, onClose, selectionState }: LinkButtonProps): React.ReactElement {
  const locale = useLocale();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tippyInstancesRef = useRef<TippyInstance[]>([]);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const hasLink = selectionState?.hasLink ?? false;
  const currentLinkHref = selectionState?.linkHref ?? null;

  // Initialize link URL when dropdown opens
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, currentLinkHref]);

  // Initialize tooltips for dropdown buttons
  useEffect(() => {
    if (!isOpen) {
      // Clean up tooltips when dropdown is closed
      tippyInstancesRef.current.forEach((instance) => instance.destroy());
      tippyInstancesRef.current = [];
      return;
    }

    // Clean up previous instances
    tippyInstancesRef.current.forEach((instance) => instance.destroy());
    tippyInstancesRef.current = [];

    // Use setTimeout to ensure dropdown is rendered
    const timeoutId = setTimeout(() => {
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
    }, 100);

    // Cleanup on unmount or when dropdown closes
    return () => {
      clearTimeout(timeoutId);
      tippyInstancesRef.current.forEach((instance) => instance.destroy());
      tippyInstancesRef.current = [];
    };
  }, [isOpen, locale]);

  const handleSubmit = useCallback((e?: React.FormEvent): void => {
    e?.preventDefault();
    if (!linkUrl.trim()) {
      // If empty, remove link
      editor.chain().focus().unsetLink().run();
      onClose();
      return;
    }

    // Normalize URL (add protocol if missing)
    let normalizedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl) && !normalizedUrl.startsWith('/') && !normalizedUrl.startsWith('#')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    editor.chain().focus().setLink({ href: normalizedUrl }).run();
    onClose();
  }, [editor, linkUrl, onClose]);

  const handleRemove = useCallback((): void => {
    editor.chain().focus().unsetLink().run();
    onClose();
  }, [editor, onClose]);

  const handleOpenLink = useCallback((): void => {
    if (currentLinkHref) {
      window.open(currentLinkHref, '_blank', 'noopener,noreferrer');
    }
  }, [currentLinkHref]);

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                padding: '6px 8px',
                border: '1px solid var(--pubwave-border)',
                borderRadius: 'var(--pubwave-radius-sm, 4px)',
                fontSize: 'var(--pubwave-font-size-base, 14px)',
                backgroundColor: 'var(--pubwave-bg)',
                color: 'var(--pubwave-text)',
                outline: 'none',
              }}
            />
            {currentLinkHref && (
              <>
                <button
                  type="button"
                  onClick={handleOpenLink}
                  data-tooltip={locale.toolbar.openLink}
                  data-testid="link-open-button"
                  aria-label={locale.aria.openLinkInNewTab}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
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
                <button
                  type="button"
                  onClick={handleRemove}
                  data-tooltip={locale.toolbar.removeLink}
                  data-testid="link-remove-button"
                  aria-label={locale.aria.linkRemoveButton}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
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
                  <TrashIcon />
                </button>
              </>
            )}
          </div>
        </form>
        </div>
      </PositionedDropdown>
    </div>
  );
}

/**
 * Color Picker Button Component
 */
interface ColorPickerButtonProps {
  editor: Editor;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function ColorPickerButton({ editor, isOpen, onToggle, onClose }: ColorPickerButtonProps): React.ReactElement {
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

interface ColorIconProps {
  textColor: string;
  backgroundColor: string | null;
}

function ColorIcon({ textColor, backgroundColor }: ColorIconProps): React.ReactElement {
  // Default is transparent, show selected content color, or color picker selection
  const bgColor = backgroundColor || 'transparent';
  // Add a subtle border when background is transparent to keep button visible
  const showBorder = !backgroundColor;
  
  return (
    <div
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: bgColor,
        border: showBorder ? '1px solid var(--pubwave-border)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: textColor,
          lineHeight: 1,
        }}
      >
        A
      </span>
    </div>
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

function LinkIcon(): React.ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="1.87 0 12.19 16"
      fill="currentColor"
    >
      <path d="M12.848 2.8a3.145 3.145 0 0 0-4.448 0L6.918 4.283a.625.625 0 0 0 .884.883l1.482-1.482c.74-.74 1.94-.74 2.68 0l.294.294c.74.74.74 1.94 0 2.68l-1.482 1.483a.625.625 0 1 0 .884.884l1.482-1.482a3.145 3.145 0 0 0 0-4.449z" />
      <path d="M10.472 5.47a.625.625 0 0 0-.884 0L5.229 9.83a.625.625 0 1 0 .884.883l4.359-4.359a.625.625 0 0 0 0-.883" />
      <path d="M5.167 6.918a.625.625 0 0 0-.884 0L2.8 8.4a3.146 3.146 0 0 0 0 4.448l.294.294a3.145 3.145 0 0 0 4.449 0l1.482-1.482a.625.625 0 0 0-.884-.884L6.66 12.258c-.74.74-1.94.74-2.68 0l-.295-.294c-.74-.74-.74-1.94 0-2.68L5.167 7.8a.625.625 0 0 0 0-.883" />
    </svg>
  );
}

function ExternalLinkIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 3h4v4M14 3l-7 7M14 11v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" />
    </svg>
  );
}

function TrashIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4h10M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1v1M6 7v5M10 7v5M2 4h12l-1 9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1L2 4z" />
    </svg>
  );
}

function ArrowLeftIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 2L4 8l6 6" />
    </svg>
  );
}

export default BubbleToolbar;
