/**
 * Drag and Drop Plugin
 *
 * ProseMirror plugin for block-level drag and drop reordering.
 * Integrates with PM transactions to ensure proper state management.
 *
 * Key behaviors:
 * - Precise drop indicator (before/after target block)
 * - No layout jump on drag start (placeholder maintains space)
 * - Safe cancel behavior (Escape or drop outside)
 * - Selection and focus preservation after drop
 */

import type { Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { Node as PMNode } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';

/**
 * Plugin key for accessing DnD state
 */
export const dndPluginKey = new PluginKey('pubwave-dnd');

/**
 * DnD state stored in plugin
 */
export interface DndState {
  /** Block currently being dragged */
  draggingBlockId: string | null;
  /** Position of the block being dragged */
  draggingBlockPos: number | null;
  /** Target position for drop (null if no valid target) */
  dropTargetPos: number | null;
  /** Whether drop is before or after the target */
  dropPosition: 'before' | 'after' | null;
  /** Whether drag was cancelled */
  cancelled: boolean;
}

/**
 * Initial DnD state
 */
const initialDndState: DndState = {
  draggingBlockId: null,
  draggingBlockPos: null,
  dropTargetPos: null,
  dropPosition: null,
  cancelled: false,
};

/**
 * DnD actions to update state
 */
type DndAction =
  | { type: 'START_DRAG'; blockId: string; pos: number }
  | { type: 'UPDATE_DROP_TARGET'; pos: number | null; position: 'before' | 'after' | null }
  | { type: 'CANCEL_DRAG' }
  | { type: 'COMPLETE_DRAG' }
  | { type: 'RESET' };

/**
 * Reduce DnD state
 */
function dndReducer(state: DndState, action: DndAction): DndState {
  switch (action.type) {
    case 'START_DRAG':
      return {
        ...state,
        draggingBlockId: action.blockId,
        draggingBlockPos: action.pos,
        dropTargetPos: null,
        dropPosition: null,
        cancelled: false,
      };
    case 'UPDATE_DROP_TARGET':
      return {
        ...state,
        dropTargetPos: action.pos,
        dropPosition: action.position,
      };
    case 'CANCEL_DRAG':
      return {
        ...state,
        cancelled: true,
        draggingBlockId: null,
        draggingBlockPos: null,
        dropTargetPos: null,
        dropPosition: null,
      };
    case 'COMPLETE_DRAG':
      return {
        ...state,
        draggingBlockId: null,
        draggingBlockPos: null,
        dropTargetPos: null,
        dropPosition: null,
      };
    case 'RESET':
      return initialDndState;
    default:
      return state;
  }
}

/**
 * Find top-level block node at a given document position
 * Returns the direct child of doc that contains the position
 */
export function findBlockAtPos(
  doc: PMNode,
  pos: number
): { node: PMNode; pos: number } | null {
  // Clamp pos to valid range within the document
  const clampedPos = Math.max(0, Math.min(pos, doc.content.size));

  // Use resolve to find the block at depth 1 (direct child of doc)
  try {
    const $pos = doc.resolve(clampedPos);

    // 1. Check if we are inside a top-level container (List or Blockquote)
    // If so, return the container itself as the draggable unit
    if ($pos.depth >= 1) {
      const topNode = $pos.node(1);
      const containerTypes = ['taskList', 'bulletList', 'orderedList', 'blockquote'];
      if (containerTypes.includes(topNode.type.name)) {
        return { node: topNode, pos: $pos.before(1) };
      }
    }

    // 2. Otherwise, find the innermost block node (for blockquotes, etc.)
    for (let d = $pos.depth; d > 0; d--) {
      const node = $pos.node(d);
      if (node.isBlock) {
        return { node, pos: $pos.before(d) };
      }
    }

    // 3. Fallback for depth 0 (e.g. at the very end or beginning of doc)
    if ($pos.depth === 0 && doc.childCount > 0) {
      let offset = 0;
      for (let i = 0; i < doc.childCount; i++) {
        const child = doc.child(i);
        if (offset + child.nodeSize > clampedPos) {
          return { node: child, pos: offset };
        }
        offset += child.nodeSize;
      }
      return { node: doc.lastChild!, pos: doc.content.size - doc.lastChild!.nodeSize };
    }

    return null;
  } catch {
    // If resolve fails, fall back to iteration
    let result: { node: PMNode; pos: number } | null = null;
    let offset = 0;

    for (let i = 0; i < doc.childCount; i++) {
      const child = doc.child(i);
      if (offset <= clampedPos && offset + child.nodeSize > clampedPos) {
        result = { node: child, pos: offset };
        break;
      }
      offset += child.nodeSize;
    }

    return result;
  }
}

/**
 * Move a block from one position to another
 */
export function moveBlock(
  editor: Editor,
  fromPos: number,
  toPos: number,
  position: 'before' | 'after'
): boolean {
  const { state } = editor;
  const { tr, doc } = state;

  // Find the block at the source position
  // fromPos might be a position inside the block, so findBlockAtPos should find the containing block
  const sourceBlock = findBlockAtPos(doc, fromPos);
  if (!sourceBlock) {
    return false;
  }

  // Find the target block
  // toPos should be the position of the target block
  const targetBlock = findBlockAtPos(doc, toPos);
  if (!targetBlock) {
    return false;
  }

  // Calculate the actual insertion position
  let insertPos = targetBlock.pos;
  if (position === 'after') {
    insertPos = targetBlock.pos + targetBlock.node.nodeSize;
  }

  // If moving to the same position, do nothing
  // Check if source and target are the same block
  if (sourceBlock.pos === targetBlock.pos) {
    return false;
  }

  // Check if we're trying to insert at the exact same position (before or after source)
  // This handles the case where we're moving a block to immediately before/after itself
  if (
    insertPos === sourceBlock.pos ||
    insertPos === sourceBlock.pos + sourceBlock.node.nodeSize
  ) {
    return false;
  }

  // Store source node and positions
  const sourceNode = sourceBlock.node;
  const sourceStart = sourceBlock.pos;
  const sourceEnd = sourceBlock.pos + sourceNode.nodeSize;

  // Create a slice of the source block
  const slice = doc.slice(sourceStart, sourceEnd);

  // Calculate adjusted insert position considering deletion
  // We need to adjust the insert position based on where the source is relative to the target
  let adjustedInsertPos = insertPos;

  if (sourceStart < insertPos) {
    // Source is before target: after deletion, insert position decreases by source size
    adjustedInsertPos = insertPos - sourceNode.nodeSize;
  }
  // If source is after target, insertPos doesn't need adjustment

  // Delete source block first
  tr.delete(sourceStart, sourceEnd);

  // Insert at adjusted position (using slice content, not the node itself)
  // Slice.content contains Fragment, which can be inserted directly
  // Ensure the position is valid after deletion
  const maxPos = tr.doc.content.size;
  if (adjustedInsertPos < 0) {
    adjustedInsertPos = 0;
  } else if (adjustedInsertPos > maxPos) {
    adjustedInsertPos = maxPos;
  }

  if (adjustedInsertPos >= 0 && adjustedInsertPos <= maxPos) {
    tr.insert(adjustedInsertPos, slice.content);
  } else {
    return false;
  }

  // Preserve selection at the moved block using mapped positions
  tr.setSelection(state.selection.map(tr.doc, tr.mapping));

  // Apply the transaction
  editor.view.dispatch(tr);

  return true;
}

/**
 * Resolve the drop target based on the event coordinates
 * Prioritizes geometric checks for document edges to ensure reliability
 */
function resolveDropTarget(
  view: EditorView,
  event: DragEvent
): { pos: number; position: 'before' | 'after' } | null {
  const doc = view.state.doc;
  if (doc.childCount === 0) return null;

  // 1. Geometric Edge Detection (Priority High)
  // This handles dropping at the very top or bottom, and empty spaces

  // Get first block
  const firstBlockPos = 0;
  const firstBlockDom = view.nodeDOM(firstBlockPos) as HTMLElement | null;

  // Get last block
  let lastBlockPos = 0;
  for (let i = 0; i < doc.childCount - 1; i++) {
    lastBlockPos += doc.child(i).nodeSize;
  }
  const lastBlockDom = view.nodeDOM(lastBlockPos) as HTMLElement | null;

  const clientY = event.clientY;

  // Check top edge
  if (firstBlockDom) {
    const rect = firstBlockDom.getBoundingClientRect();
    // Use a fixed generous valid zone (50px) relative to the top of the content
    // This allows dropping "before" the first block even if the block is very small (like a paragraph)
    // Logic: If mouse is anywhere above the block, OR within the top 50px of the block start
    if (clientY < rect.top + 50) {
      return { pos: firstBlockPos, position: 'before' };
    }
  }

  // Check bottom edge
  if (lastBlockDom) {
    const rect = lastBlockDom.getBoundingClientRect();
    // Logic: If mouse is anywhere below the block, OR within the bottom 50px of the block end
    if (clientY > rect.bottom - 50) {
      return { pos: lastBlockPos, position: 'after' };
    }
  }

  // 2. Exact Position Detection (Priority Normal)
  // Use ProseMirror's posAtCoords for internal drops
  const posAtCoords = view.posAtCoords({
    left: event.clientX,
    top: event.clientY,
  });

  if (posAtCoords) {
    const block = findBlockAtPos(doc, posAtCoords.pos);
    if (block) {
      const blockDom = view.nodeDOM(block.pos) as HTMLElement | null;
      if (blockDom) {
        const rect = blockDom.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        return {
          pos: block.pos,
          position: clientY < midpoint ? 'before' : 'after'
        };
      }
    }
  }

  return null;
}

/**
 * Create the DnD ProseMirror plugin
 */
export function createDndPlugin(editor?: Editor): Plugin<DndState> {
  let currentState = initialDndState;

  return new Plugin<DndState>({
    key: dndPluginKey,

    state: {
      init(): DndState {
        return initialDndState;
      },
      apply(tr, value): DndState {
        // Extract state from transaction meta if present
        const meta = tr.getMeta(dndPluginKey);
        if (meta !== undefined) {
          currentState = meta as DndState;
          return meta as DndState;
        }
        // Otherwise, update currentState and return existing value
        currentState = value;
        return value;
      },
    },

    props: {
      handleKeyDown(view: EditorView, event: KeyboardEvent): boolean {
        // Cancel drag on Escape
        if (event.key === 'Escape' && currentState.draggingBlockId) {
          currentState = dndReducer(currentState, { type: 'CANCEL_DRAG' });
          // Dispatch a transaction to notify React components
          view.dispatch(view.state.tr.setMeta(dndPluginKey, currentState));
          return true;
        }
        return false;
      },

      handleDOMEvents: {
        dragover(view: EditorView, event: DragEvent): boolean {
          // Only handle our drag operations
          if (!event.dataTransfer?.types.includes('application/x-pubwave-block')) {
            return false;
          }

          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';

          // Get current state from plugin
          const pluginState = dndPluginKey.getState(view.state) as DndState | null;
          currentState = pluginState ?? currentState;

          const target = resolveDropTarget(view, event);

          if (target) {
            currentState = dndReducer(currentState, {
              type: 'UPDATE_DROP_TARGET',
              pos: target.pos,
              position: target.position,
            });
            view.dispatch(view.state.tr.setMeta(dndPluginKey, currentState));
          } else {
            // If no valid target found but we are dragging, clear the indicator
            if (currentState.dropTargetPos !== null) {
              currentState = dndReducer(currentState, {
                type: 'UPDATE_DROP_TARGET',
                pos: null,
                position: null,
              });
              view.dispatch(view.state.tr.setMeta(dndPluginKey, currentState));
            }
          }

          return true;
        },

        drop(view: EditorView, event: DragEvent): boolean {
          // Only handle our drag operations
          const blockId = event.dataTransfer?.getData('application/x-pubwave-block');
          if (!blockId) {
            return false;
          }

          event.preventDefault();
          event.stopPropagation();

          // Get current state from plugin
          const pluginState = dndPluginKey.getState(view.state) as DndState | null;
          const state = pluginState ?? currentState;

          // If we don't have draggingBlockPos from state, try to extract from blockId
          let draggingBlockPos = state.draggingBlockPos;
          if (draggingBlockPos === null && blockId.startsWith('block-')) {
            const extractedPos = parseInt(blockId.replace('block-', ''), 10);
            if (!isNaN(extractedPos)) {
              draggingBlockPos = extractedPos;
            }
          }

          if (draggingBlockPos === null) {
            return false;
          }

          // Use resolveDropTarget for the final drop decision
          // This ensures we don't rely on potentially stale state
          const target = resolveDropTarget(view, event);

          if (!target) {
            return false;
          }

          const { pos: dropTargetPos, position: dropPosition } = target;

          // Validate target is not self
          if (dropTargetPos === draggingBlockPos) {
            return false;
          }

          // Perform the move
          // Use editor from closure (passed when creating plugin)
          if (!editor) {
            return false;
          }

          const success = moveBlock(editor, draggingBlockPos, dropTargetPos, dropPosition);

          // Complete the drag
          currentState = dndReducer(currentState, { type: 'COMPLETE_DRAG' });
          view.dispatch(view.state.tr.setMeta(dndPluginKey, currentState));

          return success;
        },

        dragleave(_view: EditorView, event: DragEvent): boolean {
          // Clear drop target when leaving editor
          const relatedTarget = event.relatedTarget as HTMLElement | null;
          if (!relatedTarget?.closest('.pubwave-editor')) {
            currentState = dndReducer(currentState, {
              type: 'UPDATE_DROP_TARGET',
              pos: null,
              position: null,
            });
            _view.dispatch(_view.state.tr.setMeta(dndPluginKey, currentState));
          }
          return false;
        },
      },
    },
  });
}

/**
 * Get the current DnD state from an editor
 */
export function getDndState(editor: Editor): DndState {
  const pluginState = dndPluginKey.getState(editor.state) as DndState | undefined;
  return pluginState ?? initialDndState;
}

/**
 * Start a drag operation
 */
export function startDrag(editor: Editor, blockId: string, pos: number): void {
  const { view } = editor;
  const action: DndAction = { type: 'START_DRAG', blockId, pos };
  const newState = dndReducer(getDndState(editor), action);
  view.dispatch(view.state.tr.setMeta(dndPluginKey, newState));
}

/**
 * Cancel a drag operation
 */
export function cancelDrag(editor: Editor): void {
  const { view } = editor;
  const action: DndAction = { type: 'CANCEL_DRAG' };
  const newState = dndReducer(getDndState(editor), action);
  view.dispatch(view.state.tr.setMeta(dndPluginKey, newState));
}

export default createDndPlugin;
