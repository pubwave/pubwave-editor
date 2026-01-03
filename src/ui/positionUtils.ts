/**
 * Position Utilities
 *
 * Shared utilities for calculating dropdown/toolbar positions
 * based on available viewport space.
 */

/**
 * Calculate whether a dropdown should be positioned above or below
 * based on available viewport space.
 *
 * @param triggerTop - Top position of the trigger element (in viewport coordinates)
 * @param triggerBottom - Bottom position of the trigger element (in viewport coordinates)
 * @param dropdownHeight - Height of the dropdown (estimated or actual)
 * @param margin - Margin from the trigger element
 * @returns 'top' if should show above, 'bottom' if should show below
 */
export function calculateVerticalPosition(
  triggerTop: number,
  triggerBottom: number,
  dropdownHeight: number,
  margin: number = 8
): 'top' | 'bottom' {
  const spaceAbove = triggerTop;
  const spaceBelow = window.innerHeight - triggerBottom;
  const requiredSpace = dropdownHeight + margin;

  // Default: try to show above (top)
  // If not enough space above but enough space below, show below
  // If not enough space below but enough space above, show above
  if (spaceAbove >= requiredSpace) {
    // Enough space above, show above
    return 'top';
  } else if (spaceBelow >= requiredSpace) {
    // Not enough space above, but enough space below, show below
    return 'bottom';
  } else if (spaceAbove >= spaceBelow) {
    // Neither side has enough space, choose the side with more space
    return 'top';
  } else {
    return 'bottom';
  }
}

/**
 * Calculate the vertical position for a dropdown relative to a trigger element.
 *
 * @param triggerRect - Bounding rectangle of the trigger element
 * @param dropdownHeight - Height of the dropdown (estimated or actual)
 * @param margin - Margin from the trigger element
 * @returns 'top' if should show above, 'bottom' if should show below
 */
export function calculateVerticalPositionFromRect(
  triggerRect: DOMRect,
  dropdownHeight: number,
  margin: number = 8
): 'top' | 'bottom' {
  return calculateVerticalPosition(
    triggerRect.top,
    triggerRect.bottom,
    dropdownHeight,
    margin
  );
}

