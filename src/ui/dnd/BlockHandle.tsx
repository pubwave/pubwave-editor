/**
 * Block Handle Component
 *
 * A Notion-style block handle with:
 * - "+" button to add new blocks (opens slash menu)
 * - "⋮⋮" grip button for drag & drop
 *
 * Appears on the left side of blocks when hovered.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { Editor } from '@tiptap/core';
import { tokens } from '../theme';

export interface BlockHandleProps {
  /** The Tiptap editor instance */
  editor: Editor;
}

/**
 * Find the closest block-level element from mouse position
 */
function getClosestBlock(target: EventTarget | null, proseMirror: HTMLElement): HTMLElement | null {
  if (!target || !(target instanceof HTMLElement)) return null;

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
 * BlockHandle Component - Notion-style block controls
 */
export function BlockHandle({ editor }: BlockHandleProps): React.ReactElement | null {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentBlockRef = useRef<HTMLElement | null>(null);
  const isDraggingRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0 });

  // Position the handle next to the current block (relative to editor container)
  const updatePosition = useCallback(() => {
    const container = containerRef.current;
    const block = currentBlockRef.current;
    if (!container || !block) return;

    // Get the editor container (parent of ProseMirror)
    const editorContainer = container.closest('.pubwave-editor') as HTMLElement | null;
    if (!editorContainer) return;

    const editorRect = editorContainer.getBoundingClientRect();
    const blockRect = block.getBoundingClientRect();
    
    // Calculate position relative to the editor container
    const top = blockRect.top - editorRect.top;
    
    setPosition({ top });
  }, []);

  // Show handle for a block
  const showHandle = useCallback((block: HTMLElement) => {
    currentBlockRef.current = block;
    setVisible(true);
    // Use setTimeout to ensure DOM is ready
    setTimeout(updatePosition, 0);
  }, [updatePosition]);

  // Hide handle
  const hideHandle = useCallback(() => {
    if (!isDraggingRef.current) {
      currentBlockRef.current = null;
      setVisible(false);
    }
  }, []);

  // Handle mouse tracking - use mouseover/mouseout for better performance
  useEffect(() => {
    const proseMirror = editor.view.dom;
    const editorContainer = proseMirror.closest('.pubwave-editor') as HTMLElement | null;
    if (!editorContainer) return;

    let hideTimeout: ReturnType<typeof setTimeout> | null = null;

    const onMouseOver = (e: MouseEvent): void => {
      if (isDraggingRef.current) return;

      // Clear pending hide
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      const block = getClosestBlock(e.target, proseMirror);
      if (block && block !== currentBlockRef.current) {
        showHandle(block);
      }
    };

    const onMouseOut = (e: MouseEvent): void => {
      // Check if moving to the handle itself
      const relatedTarget = e.relatedTarget as HTMLElement;
      if (relatedTarget?.closest('.pubwave-block-handle')) {
        return;
      }
      // Check if still inside editor
      if (relatedTarget?.closest('.ProseMirror')) {
        return;
      }

      hideTimeout = setTimeout(() => {
        hideHandle();
      }, 100);
    };

    proseMirror.addEventListener('mouseover', onMouseOver);
    proseMirror.addEventListener('mouseout', onMouseOut);

    return () => {
      proseMirror.removeEventListener('mouseover', onMouseOver);
      proseMirror.removeEventListener('mouseout', onMouseOut);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [editor, showHandle, hideHandle]);

  // Handle scroll - update position
  useEffect(() => {
    if (!visible) return;
    
    const onScroll = () => {
      if (currentBlockRef.current) {
        updatePosition();
      }
    };

    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [visible, updatePosition]);

  // Handle add block click - insert paragraph and focus
  const handleAdd = useCallback(() => {
    const block = currentBlockRef.current;
    if (!block) return;

    try {
      // Get the position after this block
      const pos = editor.view.posAtDOM(block, 0);
      const resolvedPos = editor.state.doc.resolve(pos);
      const after = resolvedPos.after(1);

      // Insert a new paragraph after this block
      editor
        .chain()
        .focus()
        .insertContentAt(after, { type: 'paragraph' })
        .setTextSelection(after + 1)
        .run();

      // Trigger slash command by inserting /
      setTimeout(() => {
        editor.commands.insertContent('/');
      }, 10);
    } catch (err) {
      console.error('Failed to add block:', err);
    }
  }, [editor]);

  // Drag start
  const handleDragStart = useCallback((e: React.DragEvent) => {
    const block = currentBlockRef.current;
    if (!block) return;

    isDraggingRef.current = true;
    
    // Get block position
    const pos = editor.view.posAtDOM(block, 0);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/pubwave-block', String(pos));
    
    // Add dragging class
    block.classList.add('pubwave-block--dragging');
    
    // Set drag image
    const dragImage = block.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.5';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-9999px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, [editor]);

  // Drag end
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    if (currentBlockRef.current) {
      currentBlockRef.current.classList.remove('pubwave-block--dragging');
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="pubwave-block-handle"
      style={{
        position: 'absolute',
        left: '-52px',
        top: `${position.top}px`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '2px',
        paddingTop: '2px',
        pointerEvents: 'auto',
        transition: `opacity ${tokens.transition.fast}`,
        zIndex: tokens.zIndex.dragHandle,
      }}
      onMouseEnter={() => {
        // Keep handle visible when mouse enters
      }}
      onMouseLeave={(e) => {
        const relatedTarget = e.relatedTarget as HTMLElement | null;
        if (!relatedTarget?.closest('.pubwave-editor')) {
          hideHandle();
        }
      }}
    >
      {/* Add button */}
      <button
        type="button"
        className="pubwave-block-handle__add"
        onClick={handleAdd}
        style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderRadius: tokens.borderRadius.sm,
          background: 'transparent',
          color: `var(--pubwave-handle-color, ${tokens.colors.textMuted})`,
          cursor: 'pointer',
          transition: `background-color ${tokens.transition.fast}, color ${tokens.transition.fast}`,
        }}
        title="Add block"
        aria-label="Add block below"
      >
        <PlusIcon />
      </button>

      {/* Drag handle */}
      <div
        className="pubwave-block-handle__drag"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: tokens.borderRadius.sm,
          background: 'transparent',
          color: `var(--pubwave-handle-color, ${tokens.colors.textMuted})`,
          cursor: 'grab',
          transition: `background-color ${tokens.transition.fast}, color ${tokens.transition.fast}`,
        }}
        role="button"
        tabIndex={0}
        title="Drag to move"
        aria-label="Drag to reorder block"
      >
        <GripIcon />
      </div>
    </div>
  );
}

function PlusIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
  );
}

function GripIcon(): React.ReactElement {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
      <circle cx="2" cy="3" r="1.5" />
      <circle cx="2" cy="8" r="1.5" />
      <circle cx="2" cy="13" r="1.5" />
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
    </svg>
  );
}

export default BlockHandle;
