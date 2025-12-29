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
 * Find block node at a given document position
 */
export function findBlockAtPos(
  doc: PMNode,
  pos: number
): { node: PMNode; pos: number } | null {
  let result: { node: PMNode; pos: number } | null = null;

  doc.nodesBetween(pos, pos, (node, nodePos) => {
    if (node.isBlock && nodePos <= pos && nodePos + node.nodeSize > pos) {
      result = { node, pos: nodePos };
      return false; // Stop iteration
    }
    return true;
  });

  return result;
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
  editor.commands.focus();

  return true;
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

          // Calculate drop target position
          const pos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (pos) {
            const block = findBlockAtPos(view.state.doc, pos.pos);
            if (block) {
              // Determine if drop is before or after based on mouse position
              const blockDom = view.nodeDOM(block.pos) as HTMLElement | null;
              let dropPosition: 'before' | 'after' = 'after';

              if (blockDom) {
                const rect = blockDom.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                dropPosition = event.clientY < midpoint ? 'before' : 'after';
              }

              currentState = dndReducer(currentState, {
                type: 'UPDATE_DROP_TARGET',
                pos: block.pos,
                position: dropPosition,
              });

              // Dispatch state update so it's available in drop handler
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
            const pos = parseInt(blockId.replace('block-', ''), 10);
            if (!isNaN(pos)) {
              draggingBlockPos = pos;
            }
          }

          if (draggingBlockPos === null) {
            return false;
          }

          // Use drop target from state if available and valid (from dragover events)
          // Recalculate if state is null or if it matches the dragging block (invalid drop target)
          let dropTargetPos = state.dropTargetPos;
          let dropPosition = state.dropPosition;

          // Always recalculate from event coordinates to ensure accuracy
          const pos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (!pos) {
            // If we can't get position from coordinates, try to use state
            if (dropTargetPos !== null && dropPosition !== null && dropTargetPos !== draggingBlockPos) {
              // Use state values
            } else {
              return false;
            }
          } else {
            // Recalculate from event coordinates for accuracy
            const block = findBlockAtPos(view.state.doc, pos.pos);
            if (!block) {
              // Fallback to state if available
              if (dropTargetPos === null || dropPosition === null || dropTargetPos === draggingBlockPos) {
                return false;
              }
            } else {
              dropTargetPos = block.pos;

              // If drop target is the same as dragging block, fail
              if (dropTargetPos === draggingBlockPos) {
                return false;
              }

              // Determine if drop is before or after based on mouse position
              const blockDom = view.nodeDOM(block.pos) as HTMLElement | null;
              dropPosition = 'after';

              if (blockDom) {
                const rect = blockDom.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                dropPosition = event.clientY < midpoint ? 'before' : 'after';
              }
            }
          }

          // Final validation
          if (dropTargetPos === null || dropPosition === null || dropTargetPos === draggingBlockPos) {
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
