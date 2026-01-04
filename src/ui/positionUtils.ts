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

/**
 * Horizontal alignment preference
 */
export type HorizontalAlign = 'left' | 'center' | 'right';

/**
 * Horizontal position result
 */
export interface HorizontalPosition {
  align: HorizontalAlign;
  left: number;
}

/**
 * Calculate whether a dropdown should be positioned to the left, center, or right
 * based on available viewport space and preferred alignment.
 *
 * @param triggerLeft - Left position of the trigger element (in viewport coordinates)
 * @param triggerRight - Right position of the trigger element (in viewport coordinates)
 * @param dropdownWidth - Width of the dropdown
 * @param preferredAlign - Preferred alignment: 'left', 'center', or 'right'
 * @param margin - Margin from the viewport edges
 * @returns Horizontal position with align and left offset
 */
export function calculateHorizontalPosition(
  triggerLeft: number,
  triggerRight: number,
  dropdownWidth: number,
  preferredAlign: HorizontalAlign = 'left',
  margin: number = 8
): HorizontalPosition {
  const viewportWidth = window.innerWidth;
  const triggerCenter = (triggerLeft + triggerRight) / 2;

  // Calculate space available on each side
  const spaceLeft = triggerLeft;
  const spaceRight = viewportWidth - triggerRight;

  // Calculate required space for each alignment option
  const requiredSpaceForLeft = dropdownWidth + margin;
  const requiredSpaceForRight = dropdownWidth + margin;
  const requiredSpaceForCenter = dropdownWidth / 2 + margin;

  // Try preferred alignment first
  let align: HorizontalAlign = preferredAlign;
  let left: number;

  if (preferredAlign === 'left') {
    // Left align: dropdown left edge aligns with trigger left edge
    left = triggerLeft;
    // Check if it fits, if not try other options
    if (left < margin || left + dropdownWidth > viewportWidth - margin) {
      // Doesn't fit with left align, try center or right
      if (spaceRight >= requiredSpaceForRight && triggerRight + dropdownWidth <= viewportWidth - margin) {
        // Right align fits better
        align = 'right';
        left = triggerRight - dropdownWidth;
      } else if (spaceLeft >= requiredSpaceForCenter && triggerCenter - dropdownWidth / 2 >= margin) {
        // Center align fits
        align = 'center';
        left = triggerCenter - dropdownWidth / 2;
      } else {
        // Neither fits perfectly, choose the side with more space
        if (spaceRight >= spaceLeft) {
          align = 'right';
          left = triggerRight - dropdownWidth;
        } else {
          align = 'left';
          left = triggerLeft;
        }
        // Clamp to viewport
        left = Math.max(margin, Math.min(left, viewportWidth - dropdownWidth - margin));
      }
    }
  } else if (preferredAlign === 'center') {
    // Center align: dropdown center aligns with trigger center
    left = triggerCenter - dropdownWidth / 2;
    // Check if it fits
    if (left < margin || left + dropdownWidth > viewportWidth - margin) {
      // Doesn't fit with center, try left or right
      if (spaceRight >= requiredSpaceForRight && triggerRight + dropdownWidth <= viewportWidth - margin) {
        align = 'right';
        left = triggerRight - dropdownWidth;
      } else if (spaceLeft >= requiredSpaceForLeft && triggerLeft + dropdownWidth <= viewportWidth - margin) {
        align = 'left';
        left = triggerLeft;
      } else {
        // Neither fits perfectly, choose the side with more space
        if (spaceRight >= spaceLeft) {
          align = 'right';
          left = triggerRight - dropdownWidth;
        } else {
          align = 'left';
          left = triggerLeft;
        }
        // Clamp to viewport
        left = Math.max(margin, Math.min(left, viewportWidth - dropdownWidth - margin));
      }
    }
  } else {
    // Right align: dropdown right edge aligns with trigger right edge
    left = triggerRight - dropdownWidth;
    // Check if it fits
    if (left < margin || left + dropdownWidth > viewportWidth - margin) {
      // Doesn't fit with right align, try center or left
      if (spaceLeft >= requiredSpaceForLeft && triggerLeft + dropdownWidth <= viewportWidth - margin) {
        align = 'left';
        left = triggerLeft;
      } else if (spaceLeft >= requiredSpaceForCenter && triggerCenter - dropdownWidth / 2 >= margin) {
        align = 'center';
        left = triggerCenter - dropdownWidth / 2;
      } else {
        // Neither fits perfectly, choose the side with more space
        if (spaceLeft >= spaceRight) {
          align = 'left';
          left = triggerLeft;
        } else {
          align = 'right';
          left = triggerRight - dropdownWidth;
        }
        // Clamp to viewport
        left = Math.max(margin, Math.min(left, viewportWidth - dropdownWidth - margin));
      }
    }
  }

  // Final clamp to ensure dropdown stays within viewport
  left = Math.max(margin, Math.min(left, viewportWidth - dropdownWidth - margin));

  return { align, left };
}

/**
 * Calculate the horizontal position for a dropdown relative to a trigger element.
 *
 * @param triggerRect - Bounding rectangle of the trigger element
 * @param dropdownWidth - Width of the dropdown (estimated or actual)
 * @param preferredAlign - Preferred alignment: 'left', 'center', or 'right'
 * @param margin - Margin from the viewport edges
 * @returns Horizontal position with align and left offset
 */
export function calculateHorizontalPositionFromRect(
  triggerRect: DOMRect,
  dropdownWidth: number,
  preferredAlign: HorizontalAlign = 'left',
  margin: number = 8
): HorizontalPosition {
  return calculateHorizontalPosition(
    triggerRect.left,
    triggerRect.right,
    dropdownWidth,
    preferredAlign,
    margin
  );
}

