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
import type { Node as PMNode } from '@tiptap/pm/model';

export interface BlockHandleProps {
  /** The Tiptap editor instance */
  editor: Editor;
}

/**
 * Minimum window width to show drag handle (in pixels)
 * Below this width, the drag handle will be hidden to save space
 */
const MIN_WINDOW_WIDTH = 768;

/**
 * Find the closest block-level element from mouse position
 */
/**
 * Find the innermost block element from mouse position
 */
function getClosestBlock(target: EventTarget | null, proseMirror: HTMLElement, editor: Editor): HTMLElement | null {
  if (!target || !(target instanceof Node)) return null;

  try {
    if (target instanceof HTMLElement) {
      const table = target.closest('table');
      if (table && proseMirror.contains(table)) {
        return table as HTMLElement;
      }
    }

    // Get position in the document from DOM element
    const pos = editor.view.posAtDOM(target as Node, 0);
    const $pos = editor.state.doc.resolve(pos);

    // 1. If inside a layout column, treat the whole layout as a single block
    for (let d = $pos.depth; d > 0; d--) {
      const node = $pos.node(d);
      if (node.type.name === 'layout') {
        const layoutDom = editor.view.nodeDOM($pos.before(d)) as HTMLElement | null;
        if (layoutDom && proseMirror.contains(layoutDom)) {
          return layoutDom;
        }
        break;
      }
    }

    // 2. Check if we are inside a top-level container (List or Blockquote)
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

    // 3. Otherwise, walk from innermost depth towards root to find the first block node
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

function findTableCellPos(
  tableNode: PMNode,
  tablePos: number,
  rowIndex: number,
  colIndex: number
): number | null {
  if (tableNode.childCount === 0) {
    return null;
  }

  let rowPos = tablePos + 1;
  for (let r = 0; r < tableNode.childCount; r++) {
    const row = tableNode.child(r);
    if (r === rowIndex) {
      let cellPos = rowPos + 1;
      for (let c = 0; c < row.childCount; c++) {
        const cell = row.child(c);
        if (c === colIndex) {
          return cellPos + 1;
        }
        cellPos += cell.nodeSize;
      }
      return null;
    }
    rowPos += row.nodeSize;
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
  const [isWindowTooSmall, setIsWindowTooSmall] = useState(false);
  const [tableControls, setTableControls] = useState<{
    showRow: boolean;
    showCol: boolean;
    rect: DOMRect | null;
  }>({ showRow: false, showCol: false, rect: null });
  const tableTargetRef = useRef<HTMLElement | null>(null);
  const tableControlsRef = useRef(tableControls);
  const tableResizeObserverRef = useRef<ResizeObserver | null>(null);
  const observedTableRef = useRef<HTMLElement | null>(null);

  const setTableControlsState = useCallback(
    (next: { showRow: boolean; showCol: boolean; rect: DOMRect | null }) => {
      const prev = tableControlsRef.current;
      if (
        prev.showRow === next.showRow &&
        prev.showCol === next.showCol &&
        prev.rect?.top === next.rect?.top &&
        prev.rect?.left === next.rect?.left &&
        prev.rect?.width === next.rect?.width &&
        prev.rect?.height === next.rect?.height
      ) {
        return;
      }
      tableControlsRef.current = next;
      setTableControls(next);
    },
    []
  );

  const updateTableControls = useCallback(
    (event: MouseEvent, proseMirror: HTMLElement) => {
      if (isDraggingRef.current || isMobile || isWindowTooSmall) {
        setTableControlsState({ showRow: false, showCol: false, rect: null });
        tableTargetRef.current = null;
        return;
      }

      const target = event.target as HTMLElement | null;
      if (!target) {
        setTableControlsState({ showRow: false, showCol: false, rect: null });
        tableTargetRef.current = null;
        return;
      }

      const colControl = target.closest('.pubwave-table-add-column');
      const rowControl = target.closest('.pubwave-table-add-row');
      if (colControl || rowControl) {
        const rect =
          tableTargetRef.current?.getBoundingClientRect() ??
          tableControlsRef.current.rect;
        if (!rect) {
          return;
        }
        setTableControlsState({
          showRow: rowControl ? true : tableControlsRef.current.showRow,
          showCol: colControl ? true : tableControlsRef.current.showCol,
          rect,
        });
        return;
      }

      const tableWrapper = target.closest('.tableWrapper');
      let table = target.closest('table');
      if (!table && tableWrapper instanceof HTMLElement) {
        table = tableWrapper.querySelector('table');
      }

      const EDGE_THRESHOLD = 14;
      const CONTROL_MARGIN = 56;
      const EDGE_SLOP = 20;

      const resolveEdgeState = (rect: DOMRect) => {
        const withinVertical =
          event.clientY >= rect.top - EDGE_SLOP &&
          event.clientY <= rect.bottom + EDGE_SLOP;
        const withinHorizontal =
          event.clientX >= rect.left - EDGE_SLOP &&
          event.clientX <= rect.right + EDGE_SLOP;
        const nearRight =
          withinVertical &&
          event.clientX >= rect.right - EDGE_THRESHOLD &&
          event.clientX <= rect.right + CONTROL_MARGIN;
        const nearBottom =
          withinHorizontal &&
          event.clientY >= rect.bottom - EDGE_THRESHOLD &&
          event.clientY <= rect.bottom + CONTROL_MARGIN;

        return { nearRight, nearBottom };
      };

      if (table && proseMirror.contains(table)) {
        const rect = table.getBoundingClientRect();
        const { nearRight, nearBottom } = resolveEdgeState(rect);

        if (!nearRight && !nearBottom) {
          setTableControlsState({ showRow: false, showCol: false, rect: null });
          tableTargetRef.current = null;
          return;
        }

        tableTargetRef.current = table as HTMLElement;
        setTableControlsState({ showRow: nearBottom, showCol: nearRight, rect });
        return;
      }

      if (tableTargetRef.current) {
        const rect = tableTargetRef.current.getBoundingClientRect();
        const { nearRight, nearBottom } = resolveEdgeState(rect);
        if (nearRight || nearBottom) {
          setTableControlsState({ showRow: nearBottom, showCol: nearRight, rect });
          return;
        }
      }

      setTableControlsState({ showRow: false, showCol: false, rect: null });
      tableTargetRef.current = null;
    },
    [isMobile, isWindowTooSmall, setTableControlsState]
  );

  const getActiveTableInfo = useCallback(() => {
    const table = tableTargetRef.current;
    if (!table) return null;
    try {
      const pos = editor.view.posAtDOM(table, 0);
      const blockInfo = findBlockAtPos(editor.state.doc, pos);
      if (!blockInfo || blockInfo.node.type.name !== 'table') {
        return null;
      }
      return blockInfo;
    } catch (err) {
      return null;
    }
  }, [editor]);

  const addTableRowAtEnd = useCallback(() => {
    const tableInfo = getActiveTableInfo();
    if (!tableInfo) return;
    const lastRowIndex = Math.max(0, tableInfo.node.childCount - 1);
    const lastRow = tableInfo.node.child(lastRowIndex);
    const lastColIndex = Math.max(0, lastRow.childCount - 1);
    const cellPos = findTableCellPos(
      tableInfo.node,
      tableInfo.pos,
      lastRowIndex,
      lastColIndex
    );
    if (cellPos == null) return;
    editor.chain().focus().setTextSelection(cellPos).addRowAfter().run();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (tableTargetRef.current) {
          const rect = tableTargetRef.current.getBoundingClientRect();
          setTableControlsState({
            showRow: tableControlsRef.current.showRow,
            showCol: tableControlsRef.current.showCol,
            rect,
          });
        }
      });
    });
  }, [editor, getActiveTableInfo]);

  const addTableColumnAtEnd = useCallback(() => {
    const tableInfo = getActiveTableInfo();
    if (!tableInfo) return;
    const firstRow = tableInfo.node.child(0);
    const lastColIndex = Math.max(0, firstRow.childCount - 1);
    const cellPos = findTableCellPos(
      tableInfo.node,
      tableInfo.pos,
      0,
      lastColIndex
    );
    if (cellPos == null) return;
    editor.chain().focus().setTextSelection(cellPos).addColumnAfter().run();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (tableTargetRef.current) {
          const rect = tableTargetRef.current.getBoundingClientRect();
          setTableControlsState({
            showRow: tableControlsRef.current.showRow,
            showCol: tableControlsRef.current.showCol,
            rect,
          });
        }
      });
    });
  }, [editor, getActiveTableInfo]);

  // Detect mobile device and window width on mount and window resize
  useEffect(() => {
    const checkDeviceAndWindow = () => {
      setIsMobile(isMobileDevice());
      // Check if window width is too small
      setIsWindowTooSmall(window.innerWidth < MIN_WINDOW_WIDTH);
    };
    
    checkDeviceAndWindow();
    
    // Re-check on resize in case of device orientation change or window resize
    window.addEventListener('resize', checkDeviceAndWindow);
    
    return () => {
      window.removeEventListener('resize', checkDeviceAndWindow);
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
  // For layout blocks, align with the first column's first paragraph if present
  if (
    block.classList.contains('pubwave-editor__layout') ||
    block.getAttribute('data-type') === 'layout'
  ) {
    const firstParagraph = block.querySelector(
      '.pubwave-layout__column-content p'
    );
    if (firstParagraph instanceof HTMLElement) {
      target = firstParagraph;
    }
  }

  // For container blocks (lists, blockquotes), align with the first child (e.g. the first list item)
  if (
    ['UL', 'OL', 'BLOCKQUOTE'].includes(block.tagName) &&
    block.firstElementChild instanceof HTMLElement
  ) {
    target = block.firstElementChild as HTMLElement;
  }

  if (block.tagName === 'TABLE') {
    const header = block.querySelector('thead') || block.querySelector('tr');
    if (header instanceof HTMLElement) {
      target = header;
    }
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

    const onMouseMove = (e: MouseEvent): void => {
      const target = e.target as HTMLElement | null;
      if (!target) {
        updateTableControls(e, proseMirror);
        return;
      }

      if (target.closest('.pubwave-table-add-column') || target.closest('.pubwave-table-add-row')) {
        updateTableControls(e, proseMirror);
        return;
      }

      if (!editorContainer.contains(target)) {
        setTableControlsState({ showRow: false, showCol: false, rect: null });
        tableTargetRef.current = null;
        return;
      }

      updateTableControls(e, proseMirror);
    };

    // Handle mouse leaving the entire editor container
    const onEditorMouseLeave = (): void => {
      if (isDraggingRef.current) return;
      clearHideTimeout();
      hideTimeoutRef.current = setTimeout(() => {
        hideHandle();
      }, 150);
      setTableControlsState({ showRow: false, showCol: false, rect: null });
      tableTargetRef.current = null;
    };

    proseMirror.addEventListener('mouseover', onMouseOver);
    proseMirror.addEventListener('mouseout', onMouseOut);
    document.addEventListener('mousemove', onMouseMove);
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
      document.removeEventListener('mousemove', onMouseMove);
      editorContainer.removeEventListener('mouseleave', onEditorMouseLeave);
      editor.off('transaction', handleTransaction);
      clearHideTimeout();
    };
  }, [editor, showHandle, hideHandle, clearHideTimeout, updateTableControls, setTableControlsState]);

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
    if (!visible && !tableControls.showRow && !tableControls.showCol) return;

    const onScroll = () => {
      if (currentBlockRef.current) {
        updatePosition();
      }
      if (tableTargetRef.current && tableControlsRef.current.rect) {
        const rect = tableTargetRef.current.getBoundingClientRect();
        setTableControlsState({
          showRow: tableControlsRef.current.showRow,
          showCol: tableControlsRef.current.showCol,
          rect,
        });
      }
    };

    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [
    visible,
    tableControls.showRow,
    tableControls.showCol,
    updatePosition,
    setTableControlsState,
  ]);

  useEffect(() => {
    const table = tableTargetRef.current;
    const shouldObserve = table && (tableControls.showRow || tableControls.showCol);

    if (!shouldObserve) {
      if (tableResizeObserverRef.current) {
        tableResizeObserverRef.current.disconnect();
        tableResizeObserverRef.current = null;
      }
      observedTableRef.current = null;
      return;
    }

    if (observedTableRef.current !== table) {
      if (tableResizeObserverRef.current) {
        tableResizeObserverRef.current.disconnect();
      }
      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => {
          if (!tableTargetRef.current) return;
          const rect = tableTargetRef.current.getBoundingClientRect();
          setTableControlsState({
            showRow: tableControlsRef.current.showRow,
            showCol: tableControlsRef.current.showCol,
            rect,
          });
        });
        observer.observe(table);
        tableResizeObserverRef.current = observer;
      }
      observedTableRef.current = table;
    }

    if (table) {
      const rect = table.getBoundingClientRect();
      setTableControlsState({
        showRow: tableControlsRef.current.showRow,
        showCol: tableControlsRef.current.showCol,
        rect,
      });
    }

    const onResize = () => {
      if (!tableTargetRef.current) return;
      const rect = tableTargetRef.current.getBoundingClientRect();
      setTableControlsState({
        showRow: tableControlsRef.current.showRow,
        showCol: tableControlsRef.current.showCol,
        rect,
      });
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (tableResizeObserverRef.current) {
        tableResizeObserverRef.current.disconnect();
        tableResizeObserverRef.current = null;
      }
      observedTableRef.current = null;
    };
  }, [tableControls.showRow, tableControls.showCol, setTableControlsState]);

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

  const shouldRenderTableControls = tableControls.showRow || tableControls.showCol;
  // Don't show on mobile devices or when window is too small
  if (isMobile || isWindowTooSmall || (!visible && !shouldRenderTableControls)) {
    return null;
  }
  const editorContainer =
    (tableTargetRef.current?.closest('.pubwave-editor') as HTMLElement | null) ||
    (containerRef.current?.closest('.pubwave-editor') as HTMLElement | null);
  const editorRect = editorContainer ? editorContainer.getBoundingClientRect() : null;
  const tableRect =
    tableTargetRef.current?.getBoundingClientRect() || tableControls.rect;

  return (
    <>
      {tableRect && editorRect && (
        <>
          {tableControls.showCol && (
            <button
              type="button"
              className="pubwave-table-add-column"
              onClick={(e) => {
                e.stopPropagation();
                addTableColumnAtEnd();
              }}
              style={{
                position: 'fixed',
                left: `${tableRect.right + 2}px`,
                top: `${tableRect.top}px`,
                width: '16px',
                height: `${tableRect.height}px`,
                border: 'none',
                padding: 0,
                background: 'transparent',
                cursor: 'pointer',
                zIndex: tokens.zIndex.dragHandle,
              }}
              aria-label="Add column"
              title="Add column"
            >
              <div
                style={{
                  position: 'relative',
                  width: '12px',
                  height: '100%',
                  margin: '0 auto',
                  borderRadius: '999px',
                  background: `var(--pubwave-border, ${tokens.colors.border})`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: `var(--pubwave-text-muted, ${tokens.colors.textMuted})`,
                    fontSize: '14px',
                    fontWeight: 700,
                    lineHeight: '14px',
                  }}
                >
                  +
                </div>
              </div>
            </button>
          )}
          {tableControls.showRow && (
            <button
              type="button"
              className="pubwave-table-add-row"
              onClick={(e) => {
                e.stopPropagation();
                addTableRowAtEnd();
              }}
              style={{
                position: 'fixed',
                left: `${tableRect.left}px`,
                top: `${tableRect.bottom + 2}px`,
                width: `${tableRect.width}px`,
                height: '16px',
                border: 'none',
                padding: 0,
                background: 'transparent',
                cursor: 'pointer',
                zIndex: tokens.zIndex.dragHandle,
              }}
              aria-label="Add row"
              title="Add row"
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '12px',
                  margin: '0 auto',
                  borderRadius: '999px',
                  background: `var(--pubwave-border, ${tokens.colors.border})`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: `var(--pubwave-text-muted, ${tokens.colors.textMuted})`,
                    fontSize: '14px',
                    fontWeight: 700,
                    lineHeight: '14px',
                  }}
                >
                  +
                </div>
              </div>
            </button>
          )}
        </>
      )}
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
          const relatedTarget = e.relatedTarget;
          const relatedElement =
            relatedTarget instanceof Element ? relatedTarget : null;
          // Only hide if mouse leaves to outside the editor
          if (!relatedElement?.closest('.pubwave-editor')) {
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
        tabIndex={-1}
        title="Drag to move"
        aria-label="Drag to reorder block"
      >
        <GripIcon />
      </div>
    </div>
    </>
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
