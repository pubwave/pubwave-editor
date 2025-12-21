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
  const sourceBlock = findBlockAtPos(doc, fromPos);
  if (!sourceBlock) {
    return false;
  }

  // Calculate the actual insertion position
  let insertPos = toPos;
  if (position === 'after') {
    const targetBlock = findBlockAtPos(doc, toPos);
    if (targetBlock) {
      insertPos = targetBlock.pos + targetBlock.node.nodeSize;
    }
  }

  // If moving to the same position, do nothing
  if (
    insertPos === sourceBlock.pos ||
    insertPos === sourceBlock.pos + sourceBlock.node.nodeSize
  ) {
    return false;
  }

  // Adjust insert position if source is before target
  let adjustedInsertPos = insertPos;
  if (sourceBlock.pos < insertPos) {
    adjustedInsertPos -= sourceBlock.node.nodeSize;
  }

  // Create the transaction
  const slice = doc.slice(
    sourceBlock.pos,
    sourceBlock.pos + sourceBlock.node.nodeSize
  );

  // Delete the source block
  tr.delete(sourceBlock.pos, sourceBlock.pos + sourceBlock.node.nodeSize);

  // Insert at the new position
  tr.insert(adjustedInsertPos, slice.content);

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
export function createDndPlugin(): Plugin<DndState> {
  let currentState = initialDndState;

  return new Plugin<DndState>({
    key: dndPluginKey,

    state: {
      init(): DndState {
        return initialDndState;
      },
      apply(_tr, value): DndState {
        // State is managed externally via dispatch
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

          const { draggingBlockPos, dropTargetPos, dropPosition } = currentState;

          if (
            draggingBlockPos !== null &&
            dropTargetPos !== null &&
            dropPosition !== null
          ) {
            // Perform the move
            const editor = (view as unknown as { editor?: Editor }).editor;
            if (editor) {
              moveBlock(editor, draggingBlockPos, dropTargetPos, dropPosition);
            }
          }

          // Complete the drag
          currentState = dndReducer(currentState, { type: 'COMPLETE_DRAG' });
          view.dispatch(view.state.tr.setMeta(dndPluginKey, currentState));

          return true;
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
