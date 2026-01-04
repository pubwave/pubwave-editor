/**
 * Toolbar Position Utilities
 *
 * Functions for calculating toolbar position based on selection coordinates.
 */

import type { Editor } from '@tiptap/core';
import { calculateVerticalPosition, calculateHorizontalPosition } from '../positionUtils';

/**
 * Toolbar position calculated relative to viewport
 */
export interface ToolbarPosition {
  top: number;
  left: number;
  visible: boolean;
}

/**
 * Default offset from selection bounds
 */
export const TOOLBAR_OFFSET = 8;

/**
 * Check if editor is valid for operations
 */
export function isEditorReady(editor: Editor): boolean {
  return !editor.isDestroyed;
}

/**
 * Calculate toolbar position based on selection coordinates
 */
export function calculatePosition(
  editor: Editor,
  toolbarEl: HTMLElement | null
): ToolbarPosition {
  if (!toolbarEl) {
    return { top: 0, left: 0, visible: false };
  }

  const { view } = editor;
  const { from, to } = view.state.selection;

  // Get the coordinates of the selection
  const start = view.coordsAtPos(from);
  const end = view.coordsAtPos(to);

  // Calculate selection bounds
  const selectionTop = Math.min(start.top, end.top);
  const selectionLeft = Math.min(start.left, end.left);
  const selectionRight = Math.max(start.right, end.right);

  // Get toolbar dimensions
  const toolbarRect = toolbarEl.getBoundingClientRect();
  const toolbarWidth = toolbarRect.width;
  const toolbarHeight = toolbarRect.height;

  // Calculate selection bounds for positioning
  const selectionBottom = Math.max(start.bottom, end.bottom);
  
  // Calculate vertical position using shared utility
  const verticalPosition = calculateVerticalPosition(
    selectionTop,
    selectionBottom,
    toolbarHeight,
    TOOLBAR_OFFSET
  );
  
  let top: number;
  if (verticalPosition === 'top') {
    top = selectionTop - toolbarHeight - TOOLBAR_OFFSET;
  } else {
    top = selectionBottom + TOOLBAR_OFFSET;
  }

  // Calculate horizontal position using shared utility
  // Use center alignment as default for toolbar (centered on selection)
  const horizontalPos = calculateHorizontalPosition(
    selectionLeft,
    selectionRight,
    toolbarWidth,
    'center', // Default to center alignment
    TOOLBAR_OFFSET
  );
  
  const left = horizontalPos.left;

  // Final clamp to viewport bounds (safety check)
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = TOOLBAR_OFFSET;

  // Keep toolbar within horizontal viewport (should already be handled by calculateHorizontalPosition, but add safety clamp)
  const clampedLeft = Math.max(padding, Math.min(left, viewportWidth - toolbarWidth - padding));

  // Keep toolbar within vertical viewport
  const clampedTop = Math.max(padding, Math.min(top, viewportHeight - toolbarHeight - padding));

  return { top: clampedTop, left: clampedLeft, visible: true };
}

