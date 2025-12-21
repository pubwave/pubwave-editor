/**
 * Accessibility Utilities
 *
 * Provides accessibility labels and ARIA attributes for interactive controls.
 * Ensures screen reader compatibility and keyboard navigation support.
 */

/**
 * Standard ARIA labels for editor controls
 */
export const ariaLabels = {
  // Editor
  editor: 'Rich text editor',
  editorContent: 'Editor content area',
  
  // Toolbar
  toolbar: 'Text formatting toolbar',
  boldButton: 'Toggle bold formatting',
  italicButton: 'Toggle italic formatting',
  linkButton: 'Add or edit link',
  headingButton: 'Set heading level',
  paragraphButton: 'Convert to paragraph',
  
  // Drag and Drop
  dragHandle: 'Drag to reorder block',
  dropIndicator: 'Drop here to move block',
  
  // Block Actions
  blockMenu: 'Block options menu',
  addBlock: 'Add new block',
  deleteBlock: 'Delete this block',
  
  // Dialogs
  linkDialog: 'Link editor dialog',
  linkUrlInput: 'Link URL input',
  linkSaveButton: 'Save link',
  linkRemoveButton: 'Remove link',
  linkCancelButton: 'Cancel link editing',
} as const;

/**
 * Keyboard shortcuts for screen reader announcements
 */
export const keyboardShortcuts = {
  bold: 'Cmd+B',
  italic: 'Cmd+I',
  link: 'Cmd+K',
  undo: 'Cmd+Z',
  redo: 'Cmd+Shift+Z',
  selectAll: 'Cmd+A',
} as const;

/**
 * Get full accessible label with shortcut hint
 */
export function getLabelWithShortcut(
  label: string,
  shortcut?: string
): string {
  if (!shortcut) return label;
  return `${label} (${shortcut})`;
}

/**
 * Generate ID for ARIA relationships
 */
export function createAriaId(prefix: string, suffix?: string): string {
  const baseId = `pubwave-${prefix}`;
  return suffix ? `${baseId}-${suffix}` : baseId;
}

/**
 * ARIA live region types for dynamic content
 */
export type LiveRegionType = 'polite' | 'assertive' | 'off';

/**
 * Get appropriate live region for content type
 */
export function getLiveRegion(contentType: 'notification' | 'error' | 'update'): LiveRegionType {
  switch (contentType) {
    case 'error':
      return 'assertive';
    case 'notification':
    case 'update':
      return 'polite';
    default:
      return 'polite';
  }
}

/**
 * Role definitions for custom components
 */
export const roles = {
  editor: 'textbox',
  toolbar: 'toolbar',
  toolbarButton: 'button',
  menu: 'menu',
  menuItem: 'menuitem',
  dialog: 'dialog',
  dragHandle: 'button',
  block: 'group',
} as const;

/**
 * Standard focus trap configuration for dialogs
 */
export const focusTrapConfig = {
  initialFocus: '[data-autofocus]',
  fallbackFocus: 'button',
  escapeDeactivates: true,
  clickOutsideDeactivates: true,
};

/**
 * Announces a message to screen readers
 * Uses a live region to communicate dynamic changes
 */
export function announceToScreenReader(
  message: string,
  priority: LiveRegionType = 'polite'
): void {
  // Create or reuse announcement element
  let announcer = document.getElementById('pubwave-announcer');
  
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'pubwave-announcer';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(announcer);
  }
  
  // Update priority if needed
  announcer.setAttribute('aria-live', priority);
  
  // Clear and set message (required for re-announcement)
  announcer.textContent = '';
  
  // Store reference for closure
  const announcerElement = announcer;
  setTimeout(() => {
    announcerElement.textContent = message;
  }, 50);
}

export default {
  ariaLabels,
  keyboardShortcuts,
  roles,
  getLabelWithShortcut,
  createAriaId,
  getLiveRegion,
  announceToScreenReader,
};
