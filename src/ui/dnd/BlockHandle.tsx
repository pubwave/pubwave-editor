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
import { startDrag, findBlockAtPos } from '../../core/plugins/dnd';

export interface BlockHandleProps {
  /** The Tiptap editor instance */
  editor: Editor;
}

/**
 * Find the closest block-level element from mouse position
 */
function getClosestBlock(target: EventTarget | null, proseMirror: HTMLElement): HTMLElement | null {
  if (!target || !(target instanceof Node)) return null;

  // Start from the target node (could be text node or element)
  let current: Node | null = target;
  
  // If it's a text node, start from its parent
  if (current.nodeType === Node.TEXT_NODE) {
    current = current.parentElement;
  }
  
  if (!(current instanceof HTMLElement)) return null;

  // Walk up the DOM tree until we find a block-level element
  // ProseMirror blocks are typically p, h1, h2, h3, blockquote, pre, ul, ol, etc.
  const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'UL', 'OL', 'LI', 'HR', 'DIV'];
  
  while (current && current !== proseMirror) {
    // Check if this is a block-level element
    if (current instanceof HTMLElement) {
      const tagName = current.tagName;
      if (blockTags.includes(tagName)) {
        // Make sure it's within ProseMirror
        if (proseMirror.contains(current)) {
          return current;
        }
      }
      // Also check for direct children of ProseMirror (any element)
      if (current.parentElement === proseMirror) {
        return current;
      }
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
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    
    // Calculate position relative to the editor container, centered vertically on the block
    const top = blockRect.top - editorRect.top + blockRect.height / 2;
    
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

  // Clear hide timeout helper
  const clearHideTimeout = useCallback((): void => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Handle mouse tracking - use mouseover/mouseout for better performance
  useEffect(() => {
    const proseMirror = editor.view.dom;
    const editorContainer = proseMirror.closest('.pubwave-editor') as HTMLElement | null;
    if (!editorContainer) return;

    const onMouseOver = (e: MouseEvent): void => {
      if (isDraggingRef.current) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Clear pending hide
      clearHideTimeout();

      // If mouse is over the handle itself, do nothing (keep it visible)
      if (target.closest('.pubwave-block-handle')) {
        return;
      }

      // Only process blocks within ProseMirror (not the handle)
      if (!proseMirror.contains(target)) {
        return;
      }

      const block = getClosestBlock(target, proseMirror);
      if (block && block !== currentBlockRef.current) {
        showHandle(block);
      }
    };

    const onMouseOut = (e: MouseEvent): void => {
      if (isDraggingRef.current) return;

      const relatedTarget = e.relatedTarget as HTMLElement | null;
      
      // If no related target, mouse left the window
      if (!relatedTarget) {
        clearHideTimeout();
        hideTimeoutRef.current = setTimeout(() => {
          hideHandle();
        }, 150);
        return;
      }

      // Check if moving to the handle itself or any of its children
      if (relatedTarget.closest('.pubwave-block-handle')) {
        return;
      }
      
      // Check if still inside ProseMirror (might be moving to another block)
      if (relatedTarget.closest('.ProseMirror')) {
        return;
      }

      // Check if still inside editor container
      if (relatedTarget.closest('.pubwave-editor')) {
        return;
      }

      // Mouse left the editor entirely
      clearHideTimeout();
      hideTimeoutRef.current = setTimeout(() => {
        hideHandle();
      }, 150);
    };

    proseMirror.addEventListener('mouseover', onMouseOver);
    proseMirror.addEventListener('mouseout', onMouseOut);

    return () => {
      proseMirror.removeEventListener('mouseover', onMouseOver);
      proseMirror.removeEventListener('mouseout', onMouseOut);
      clearHideTimeout();
    };
  }, [editor, showHandle, hideHandle, clearHideTimeout]);

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
      // Find the top-level block
      let blockPos = pos;
      for (let i = resolvedPos.depth; i > 0; i--) {
        const node = resolvedPos.node(i);
        if (node.isBlock) {
          blockPos = resolvedPos.start(i);
          break;
        }
      }
      const afterBlockPos = editor.state.doc.resolve(blockPos);
      const after = afterBlockPos.after(1);

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
    
    // Get block position - we need the actual block start position
    const pos = editor.view.posAtDOM(block, 0);
    
    // Use findBlockAtPos to get the actual block start position
    // This ensures we always use the block's start position, not an internal position
    const blockInfo = findBlockAtPos(editor.state.doc, pos);
    
    if (!blockInfo) {
      return;
    }
    
    const blockPos = blockInfo.pos;
    
    // Initialize drag state in the DnD plugin
    const blockId = `block-${blockPos}`;
    startDrag(editor, blockId, blockPos);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-pubwave-block', blockId);
    
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
        left: '-64px',
        top: `${position.top}px`,
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        pointerEvents: 'auto',
        transition: `opacity ${tokens.transition.fast}`,
        zIndex: tokens.zIndex.dragHandle,
        opacity: visible ? 1 : 0,
      }}
      onMouseEnter={(e) => {
        // Clear any pending hide when mouse enters handle
        e.stopPropagation();
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        const relatedTarget = e.relatedTarget as HTMLElement | null;
        // Only hide if mouse leaves to outside the editor
        if (!relatedTarget?.closest('.pubwave-editor')) {
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
          }
          hideTimeoutRef.current = setTimeout(() => {
            hideHandle();
          }, 150);
        }
      }}
    >
      {/* Add button */}
      <button
        type="button"
        className="pubwave-block-handle__add"
        onClick={handleAdd}
        style={{
          width: '28px',
          height: '28px',
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
          width: '28px',
          height: '28px',
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
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
  );
}

function GripIcon(): React.ReactElement {
  return (
    <svg width="12" height="18" viewBox="0 0 10 16" fill="currentColor">
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
