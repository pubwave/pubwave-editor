/**
 * Layout Icons
 *
 * Icon components for the layout slash commands.
 * Includes icons for 2-column and 3-column layouts.
 */

import React from 'react';

/**
 * Icon for 2-column layout
 */
export function LayoutTwoIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  );
}

/**
 * Icon for 3-column layout
 */
export function LayoutThreeIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="8" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="16" y2="21" />
    </svg>
  );
}
