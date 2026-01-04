/**
 * Floating Drag Handle Component
 *
 * A floating drag handle that appears when hovering over blocks.
 * Positions itself to the left of the hovered block.
 *
 * Uses direct DOM manipulation to avoid React re-render performance issues.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import { cn, tokens } from '../theme';
import { ariaLabels } from '../a11y';

export interface FloatingDragHandleProps {
  /** The Tiptap editor instance */
  editor: Editor;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Minimum window width to show drag handle (in pixels)
 * Below this width, the drag handle will be hidden to save space
 */
const MIN_WINDOW_WIDTH = 768;

/**
 * Get the closest block element from an event target
 */
function getClosestBlock(target: EventTarget | null): HTMLElement | null {
  if (!target || !(target instanceof HTMLElement)) return null;

  const proseMirror = target.closest('.ProseMirror');
  if (!proseMirror) return null;

  let current: HTMLElement | null = target;
  while (current && current !== proseMirror) {
    if (current.parentElement === proseMirror) {
      return current;
    }
    current = current.parentElement;
  }

  return null;
}

/**
 * FloatingDragHandle - Block drag affordance that floats
 * 
 * Uses direct DOM manipulation instead of React state to avoid re-render loops
 */
export function FloatingDragHandle({
  editor,
  className,
}: FloatingDragHandleProps): React.ReactElement {
  const handleRef = useRef<HTMLDivElement>(null);
  const currentBlockRef = useRef<HTMLElement | null>(null);
  const isDraggingRef = useRef(false);

  // Update handle position via direct DOM manipulation
  const showHandle = useCallback((blockElement: HTMLElement) => {
    const handle = handleRef.current;
    if (!handle) return;

    // Check if window is too small
    if (window.innerWidth < MIN_WINDOW_WIDTH) {
      hideHandle();
      return;
    }

    const rect = blockElement.getBoundingClientRect();
    const editorRect = blockElement.closest('.pubwave-editor')?.getBoundingClientRect();
    if (!editorRect) return;

    handle.style.top = `${rect.top + rect.height / 2}px`;
    handle.style.left = `${editorRect.left - 8}px`;
    handle.style.opacity = '1';
    handle.style.pointerEvents = 'auto';
  }, []);

  const hideHandle = useCallback(() => {
    const handle = handleRef.current;
    if (!handle) return;
    handle.style.opacity = '0';
    handle.style.pointerEvents = 'none';
  }, []);

  // Setup mouse tracking and window resize listener
  useEffect(() => {
    const editorElement = editor.view.dom.closest('.pubwave-editor') as HTMLElement | null;
    if (!editorElement) return;

    const onMouseMove = (e: MouseEvent): void => {
      if (isDraggingRef.current) return;

      // Check if window is too small
      if (window.innerWidth < MIN_WINDOW_WIDTH) {
        if (currentBlockRef.current) {
          currentBlockRef.current = null;
          hideHandle();
        }
        return;
      }

      const block = getClosestBlock(e.target);
      if (block && block !== currentBlockRef.current) {
        currentBlockRef.current = block;
        showHandle(block);
      } else if (!block && currentBlockRef.current) {
        currentBlockRef.current = null;
        hideHandle();
      }
    };

    const onMouseLeave = (): void => {
      if (!isDraggingRef.current) {
        currentBlockRef.current = null;
        hideHandle();
      }
    };

    const onWindowResize = (): void => {
      // Hide handle if window becomes too small
      if (window.innerWidth < MIN_WINDOW_WIDTH) {
        if (currentBlockRef.current) {
          currentBlockRef.current = null;
          hideHandle();
        }
      }
    };

    editorElement.addEventListener('mousemove', onMouseMove);
    editorElement.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', onWindowResize);

    return () => {
      editorElement.removeEventListener('mousemove', onMouseMove);
      editorElement.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', onWindowResize);
    };
  }, [editor, showHandle, hideHandle]);

  // Drag handlers
  const onDragStart = useCallback((e: React.DragEvent): void => {
    if (!currentBlockRef.current) return;
    isDraggingRef.current = true;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'block');
    currentBlockRef.current.classList.add('pubwave-block--dragging');
    
    const handle = handleRef.current;
    if (handle) handle.style.cursor = 'grabbing';
  }, []);

  const onDragEnd = useCallback((): void => {
    isDraggingRef.current = false;
    if (currentBlockRef.current) {
      currentBlockRef.current.classList.remove('pubwave-block--dragging');
    }
    const handle = handleRef.current;
    if (handle) handle.style.cursor = 'grab';
  }, []);

  return (
    <div
      ref={handleRef}
      className={cn('pubwave-drag-handle', className)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        transform: 'translate(-50%, -50%)',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        zIndex: tokens.zIndex.dragHandle,
        opacity: 0,
        pointerEvents: 'none',
        transition: `opacity ${tokens.transition.fast}`,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      role="button"
      aria-label={ariaLabels.dragHandle}
      tabIndex={0}
      data-testid="drag-handle"
    >
      <div
        className="pubwave-drag-handle__visual"
        style={{
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: tokens.borderRadius.sm,
          backgroundColor: `var(--pubwave-drag-handle-bg, ${tokens.colors.surface})`,
          border: `1px solid var(--pubwave-drag-handle-border, ${tokens.colors.border})`,
          boxShadow: tokens.shadow.sm,
        }}
      >
        <DragIcon />
      </div>
    </div>
  );
}

function DragIcon(): React.ReactElement {
  return (
    <svg
      width="12"
      height="16"
      viewBox="0 0 12 16"
      fill="currentColor"
      style={{ color: `var(--pubwave-drag-handle-color, ${tokens.colors.textMuted})` }}
    >
      <circle cx="3" cy="3" r="1.5" />
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="3" cy="13" r="1.5" />
      <circle cx="9" cy="3" r="1.5" />
      <circle cx="9" cy="8" r="1.5" />
      <circle cx="9" cy="13" r="1.5" />
    </svg>
  );
}

export default FloatingDragHandle;
