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
import { isMobileDevice } from '../../core/util';

export interface BlockHandleProps {
  /** The Tiptap editor instance */
  editor: Editor;
}

/**
 * Find the closest block-level element from mouse position
 */
/**
 * Find the innermost block element from mouse position
 */
function getClosestBlock(target: EventTarget | null, proseMirror: HTMLElement, editor: Editor): HTMLElement | null {
  if (!target || !(target instanceof Node)) return null;

  try {
    // Get position in the document from DOM element
    const pos = editor.view.posAtDOM(target as Node, 0);
    const $pos = editor.state.doc.resolve(pos);

    // 1. Check if we are inside a top-level container (List or Blockquote)
    if ($pos.depth >= 1) {
      const topNode = $pos.node(1);
      const containerTypes = ['taskList', 'bulletList', 'orderedList', 'blockquote'];
      if (containerTypes.includes(topNode.type.name)) {
        const containerDom = editor.view.nodeDOM($pos.before(1)) as HTMLElement | null;
        if (containerDom && proseMirror.contains(containerDom)) {
          return containerDom;
        }
      }
    }

    // 2. Otherwise, walk from innermost depth towards root to find the first block node
    for (let d = $pos.depth; d > 0; d--) {
      const node = $pos.node(d);
      if (node.isBlock) {
        const blockPos = $pos.before(d);
        // Map back to DOM element
        const blockDom = editor.view.nodeDOM(blockPos) as HTMLElement | null;
        if (blockDom && proseMirror.contains(blockDom)) {
          return blockDom;
        }
      }
    }
  } catch (err) {
    // Fallback for simple DOM-based approach
    let current: HTMLElement | null = target instanceof HTMLElement ? target : target.parentElement;
    while (current && current.parentElement) {
      if (current.parentElement === proseMirror) {
        return current;
      }
      current = current.parentElement;
    }
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
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ top: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(isMobileDevice());
    };
    
    checkMobile();
    
    // Re-check on resize in case of device orientation change
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Position the handle next to the current block (relative to editor container)
  const updatePosition = useCallback(() => {
    const container = containerRef.current;
    const block = currentBlockRef.current;
    if (!container || !block) return;

    // Get the editor container (parent of ProseMirror)
    const editorContainer = container.closest('.pubwave-editor') as HTMLElement | null;
    if (!editorContainer) return;

    // Force a reflow to ensure layout is calculated
    void editorContainer.offsetHeight;

    const editorRect = editorContainer.getBoundingClientRect();

    // Calculate vertical position (aligned to top of block)
    // Try to get line-height for better alignment with the first line of text
    let offset = 14; // Default fallback (half of standard line height approx)

    let target = block;
    // For container blocks (lists, blockquotes), align with the first child (e.g. the first list item)
    if (['UL', 'OL', 'BLOCKQUOTE'].includes(block.tagName) && block.firstElementChild instanceof HTMLElement) {
      target = block.firstElementChild as HTMLElement;
    }
    
    // Force a reflow for the target element as well
    void target.offsetHeight;
    const targetRect = target.getBoundingClientRect();

    try {
      const style = window.getComputedStyle(target);
      const lineHeightStr = style.lineHeight;
      if (lineHeightStr && lineHeightStr !== 'normal') {
        const lineHeight = parseFloat(lineHeightStr);
        if (!isNaN(lineHeight)) {
          offset = lineHeight / 2;
        }
      } else {
        // If normal, estimate based on font size
        const fontSize = parseFloat(style.fontSize);
        if (!isNaN(fontSize)) {
          offset = (fontSize * 1.5) / 2;
        }
      }
    } catch (e) {
      // Fallback
    }

    // Adjust for some specific block types like headings that might have different internal padding
    // For now, computed line-height should handle headings reasonably well

    // Position relative to the editor container
    const top = targetRect.top - editorRect.top + offset;

    // Only update if we have a valid position (not NaN or invalid)
    if (!isNaN(top) && isFinite(top) && top >= 0) {
      setPosition({ top });
    }
  }, []);

  // Show handle for a block
  const showHandle = useCallback((block: HTMLElement) => {
    currentBlockRef.current = block;
    setVisible(true);
    // Use requestAnimationFrame to ensure DOM is ready and layout is stable
    // Double RAF ensures layout has been calculated
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updatePosition();
      });
    });
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

      const block = getClosestBlock(target, proseMirror, editor);
      if (block) {
        // If moving between children of the same block (e.g. list items), 
        // getClosestBlock returns the same parent (UL).
        // We only need to trigger showHandle if the block reference changes
        // OR if we want to ensure position is correct (though position shouldn't change for same block)

        if (block !== currentBlockRef.current) {
          showHandle(block);
        } else {
          // If hovering same block, just keep it visible
          setVisible(true);
        }
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

      // Check if still inside ProseMirror
      // Note: we might be moving from LI to another LI in same UL.
      // getClosestBlock for relatedTarget will return the same UL.
      // So we shouldn't hide if we are still in the same top-level block.

      if (proseMirror.contains(relatedTarget)) {
        // Check if we are still strictly inside the editor
        // But we might have left the "current block".
        // Let onMouseOver handle the switch.
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

    // Handle mouse leaving the entire editor container
    const onEditorMouseLeave = (): void => {
      if (isDraggingRef.current) return;
      clearHideTimeout();
      hideTimeoutRef.current = setTimeout(() => {
        hideHandle();
      }, 150);
    };

    proseMirror.addEventListener('mouseover', onMouseOver);
    proseMirror.addEventListener('mouseout', onMouseOut);
    // Also listen to mouseleave on the entire editor container to catch when mouse leaves editor
    editorContainer.addEventListener('mouseleave', onEditorMouseLeave);

    // Hide handle when user starts typing (distraction-free writing)
    // Hide handle when user starts typing (distraction-free writing)
    // Only hide if the document actually changed to avoid hiding on clicks/selection
    const handleTransaction = ({ transaction }: { transaction: any }) => {
      if (transaction.docChanged && !isDraggingRef.current) {
        hideHandle();
      }
    };

    editor.on('transaction', handleTransaction);

    return () => {
      proseMirror.removeEventListener('mouseover', onMouseOver);
      proseMirror.removeEventListener('mouseout', onMouseOut);
      editorContainer.removeEventListener('mouseleave', onEditorMouseLeave);
      editor.off('transaction', handleTransaction);
      clearHideTimeout();
    };
  }, [editor, showHandle, hideHandle, clearHideTimeout]);

  // Update position when visible state changes
  useEffect(() => {
    if (visible && currentBlockRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updatePosition();
        });
      });
    }
  }, [visible, updatePosition]);

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
    // Delay setting isDragging to true to allow the browser to initiate the drag
    // If the element becomes invisible immediately, the drag might be aborted
    requestAnimationFrame(() => {
      setIsDragging(true);
    });

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
    dragImage.classList.add('pubwave-block--drag-preview');
    dragImage.style.opacity = '1';

    // Force gray color and variables on the ghost to override editor styles
    const applyGhostStyles = (el: HTMLElement) => {
      el.style.setProperty('color', '#9b9a97', 'important');
      el.style.setProperty('border-color', '#9b9a97', 'important');
      el.style.setProperty('--pubwave-text', '#9b9a97', 'important');
      Array.from(el.children).forEach(child => {
        if (child instanceof HTMLElement) applyGhostStyles(child);
      });
    };
    applyGhostStyles(dragImage);

    // Copy width to ensure correct layout
    const rect = block.getBoundingClientRect();
    dragImage.style.width = `${rect.width}px`;
    // Reset positioning if the block had it (though usually blocks are static)
    dragImage.style.position = 'static';
    dragImage.style.transform = 'none';

    // Wrap in editor structure to preserve styles (CSS scopes)
    const wrapper = document.createElement('div');
    wrapper.className = 'pubwave-editor';
    const content = document.createElement('div');
    content.className = 'pubwave-editor__content';
    const pm = document.createElement('div');
    pm.className = 'ProseMirror';

    // Reconstruct hierarchy
    pm.appendChild(dragImage);
    content.appendChild(pm);
    wrapper.appendChild(content);

    // Position off-screen
    wrapper.style.position = 'absolute';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';

    // Add to body so it renders styles
    document.body.appendChild(wrapper);

    // Use the clone as the drag image
    e.dataTransfer.setDragImage(dragImage, 0, 0);

    // Clean up
    setTimeout(() => {
      document.body.removeChild(wrapper);
    }, 0);
  }, [editor]);

  // Drag end
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    if (currentBlockRef.current) {
      currentBlockRef.current.classList.remove('pubwave-block--dragging');
    }
    // Also hide handle after drop for a cleaner transition
    setVisible(false);
  }, []);

  // Don't show on mobile devices
  if (isMobile || !visible) return null;

  return (
    <div
      ref={containerRef}
      className="pubwave-block-handle"
      data-testid="block-handle"
      style={{
        position: 'absolute',
        left: 'calc(var(--pubwave-container-padding-left, 140px) - 80px)',
        top: `${position.top}px`,
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        pointerEvents: 'auto',
        transition: `opacity ${tokens.transition.fast}`,
        zIndex: tokens.zIndex.dragHandle,
        opacity: visible && !isDragging ? 1 : 0,
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
        data-testid="add-block-button"
        style={{
          width: 'var(--pubwave-button-width, 28px)',
          height: 'var(--pubwave-button-height, 28px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderRadius: tokens.borderRadius.sm,
          background: 'transparent',
          color: `var(--pubwave-text-muted, ${tokens.colors.textMuted})`,
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
        data-testid="drag-handle"
        style={{
          // Hit area (minimum 44px for accessibility)
          // Use padding to increase hit area while keeping visual size at 28px
          width: '44px',
          height: '44px',
          padding: '8px', // (44 - 28) / 2 = 8px padding on each side
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: tokens.borderRadius.sm,
          background: 'transparent',
          color: `var(--pubwave-text-muted, ${tokens.colors.textMuted})`,
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
