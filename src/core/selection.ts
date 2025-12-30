/**
 * Selection State Helpers
 *
 * Provides utilities for determining selection state, which is crucial for:
 * - Toolbar visibility (selection-only rule from constitution)
 * - Determining available formatting options
 * - Drag and drop behavior
 */

import type { Editor } from '@tiptap/core';

/**
 * Selection state information
 */
export interface SelectionState {
  /**
   * Whether there is any selection at all
   */
  hasSelection: boolean;

  /**
   * Whether the selection is empty (cursor only, no text selected)
   */
  isEmpty: boolean;

  /**
   * Whether the selection spans actual text content
   */
  hasTextContent: boolean;

  /**
   * Whether this is a node selection (e.g., selected image or block)
   */
  isNodeSelection: boolean;

  /**
   * The selected text, if any
   */
  selectedText: string;

  /**
   * Start position of the selection
   */
  from: number;

  /**
   * End position of the selection
   */
  to: number;

  /**
   * Whether bold mark is active in selection
   */
  isBold: boolean;

  /**
   * Whether italic mark is active in selection
   */
  isItalic: boolean;

  /**
   * Whether underline mark is active in selection
   */
  isUnderline: boolean;

  /**
   * Whether strike mark is active in selection
   */
  isStrike: boolean;

  /**
   * Whether code mark is active in selection
   */
  isCode: boolean;

  /**
   * Whether the selection has a link
   */
  hasLink: boolean;

  /**
   * Active link href if any
   */
  linkHref: string | null;
}

/**
 * Get the current selection state from the editor
 *
 * This is the primary function for determining toolbar visibility.
 * Per constitution: toolbar MUST NOT be visible when selection is empty.
 */
export function getSelectionState(editor: Editor): SelectionState {
  const { state } = editor;
  const { selection } = state;
  const { from, to, empty } = selection;

  // Get selected text if any
  const selectedText = empty ? '' : state.doc.textBetween(from, to, ' ');

  // Check if this is a node selection (e.g., image, video, embed)
  const isNodeSelection = selection instanceof Object && 'node' in selection;

  // Determine if there's actual content selected
  const hasTextContent = selectedText.length > 0;

  // Get mark states
  const isBold = editor.isActive('bold');
  const isItalic = editor.isActive('italic');
  const isUnderline = editor.isActive('underline');
  const isStrike = editor.isActive('strike');
  const isCode = editor.isActive('code');
  const hasLink = editor.isActive('link');
  const linkHref = hasLink
    ? (editor.getAttributes('link').href as string | null)
    : null;

  return {
    hasSelection: !empty || isNodeSelection,
    isEmpty: empty && !isNodeSelection,
    hasTextContent,
    isNodeSelection,
    selectedText,
    from,
    to,
    isBold,
    isItalic,
    isUnderline,
    isStrike,
    isCode,
    hasLink,
    linkHref,
  };
}

/**
 * Check if the selection is empty (cursor only)
 *
 * This is the key check for toolbar visibility.
 * Returns true when toolbar should be HIDDEN.
 */
export function isSelectionEmpty(editor: Editor): boolean {
  return editor.state.selection.empty;
}

/**
 * Check if the selection spans multiple blocks
 */
export function isMultiBlockSelection(editor: Editor): boolean {
  const { from, to } = editor.state.selection;
  const $from = editor.state.doc.resolve(from);
  const $to = editor.state.doc.resolve(to);

  // Compare the depth-1 ancestor (block level)
  return $from.depth > 0 && $to.depth > 0 && $from.before(1) !== $to.before(1);
}

/**
 * Check if the selection spans the entire paragraph/block
 * Used to determine if toolbar should show on double-click
 */
export function isFullBlockSelection(editor: Editor): boolean {
  const { from, to } = editor.state.selection;
  const $from = editor.state.doc.resolve(from);
  const $to = editor.state.doc.resolve(to);

  // Find the paragraph/block containing the selection
  let fromBlockStart = from;
  let fromBlockEnd = from;
  let toBlockStart = to;
  let toBlockEnd = to;

  // Find block boundaries for start position
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.isBlock) {
      fromBlockStart = $from.start(d);
      fromBlockEnd = $from.end(d);
      break;
    }
  }

  // Find block boundaries for end position
  for (let d = $to.depth; d > 0; d--) {
    const node = $to.node(d);
    if (node.isBlock) {
      toBlockStart = $to.start(d);
      toBlockEnd = $to.end(d);
      break;
    }
  }

  // Check if selection spans entire block(s)
  // Either: selection starts at block start and ends at block end
  // Or: selection spans multiple blocks
  const spansFullFromBlock = from === fromBlockStart && to >= fromBlockEnd;
  const spansFullToBlock = to === toBlockEnd && from <= toBlockStart;
  const spansMultipleBlocks = fromBlockStart !== toBlockStart;

  return spansFullFromBlock || spansFullToBlock || spansMultipleBlocks;
}

/**
 * Get the block node containing the current selection
 */
export function getSelectedBlock(
  editor: Editor
): { node: Editor['state']['doc'] | null; pos: number } {
  const { selection, doc } = editor.state;
  const { from } = selection;

  // Find the nearest block ancestor
  const $pos = doc.resolve(from);
  const depth = $pos.depth;

  for (let d = depth; d > 0; d--) {
    const node = $pos.node(d);
    if (node.isBlock) {
      return { node: node as unknown as Editor['state']['doc'], pos: $pos.before(d) };
    }
  }

  return { node: null, pos: 0 };
}

/**
 * Get all block positions in the document
 * Useful for drag and drop operations
 */
export function getAllBlockPositions(editor: Editor): number[] {
  const positions: number[] = [];
  const { doc } = editor.state;

  doc.descendants((node, pos) => {
    if (node.isBlock && node.type.name !== 'doc') {
      positions.push(pos);
    }
    return true;
  });

  return positions;
}

/**
 * Check if selection should trigger toolbar visibility
 *
 * Per constitution: toolbar appears ONLY on non-empty text selection.
 * - Cursor only: NO toolbar
 * - Text selected: YES toolbar
 * - Node selected (image, etc.): Context-dependent
 */
export function shouldShowToolbar(editor: Editor): boolean {
  const state = getSelectionState(editor);

  // Never show toolbar for empty selection (cursor only)
  if (state.isEmpty) {
    return false;
  }

  // Show toolbar for text selections
  if (state.hasTextContent) {
    return true;
  }

  // For node selections, don't show the text formatting toolbar
  // (They would get their own contextual controls)
  return false;
}

/**
 * Get selection coordinates for positioning UI elements (like toolbar)
 * Returns the bounding box of the current selection
 */
export function getSelectionBounds(
  editor: Editor
): { top: number; left: number; right: number; bottom: number; width: number; height: number } | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const { view } = editor;
  const { from, to } = view.state.selection;

  if (from === to) {
    return null;
  }

  const start = view.coordsAtPos(from);
  const end = view.coordsAtPos(to);

  const top = Math.min(start.top, end.top);
  const bottom = Math.max(start.bottom, end.bottom);
  const left = Math.min(start.left, end.left);
  const right = Math.max(start.right, end.right);

  return {
    top,
    left,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}
