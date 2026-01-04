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
import { cn, tokens } from './theme';
import { ariaLabels } from './a11y';
import { getSelectionState, shouldShowToolbar } from '../core/selection';
import type { SelectionState } from '../core/selection';
import { safeRequestAnimationFrame } from '../core/ssr';
import { useLocale } from './LocaleContext';
import { DefaultToolbarContent } from './toolbar/DefaultToolbarContent';
import { calculatePosition, isEditorReady, type ToolbarPosition } from './toolbar/position';

// Re-export ToolbarPosition for backward compatibility
export type { ToolbarPosition } from './toolbar/position';

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

export default BubbleToolbar;
