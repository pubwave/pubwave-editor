/**
 * Theme System - Shared className/Token Mapping Layer
 *
 * This module provides utilities for working with CSS tokens and class names.
 * CRITICAL: No raw color values are allowed in UI code. Use tokens only.
 */

/**
 * CSS Token definitions
 * These map to CSS custom properties that host applications can override.
 */
export const tokens = {
  // Colors - all use CSS custom properties
  colors: {
    background: 'var(--pubwave-color-background)',
    surface: 'var(--pubwave-color-surface)',
    text: 'var(--pubwave-color-text)',
    textMuted: 'var(--pubwave-color-text-muted)',
    border: 'var(--pubwave-color-border)',
    borderLight: 'var(--pubwave-color-border-light)',
    hover: 'var(--pubwave-color-hover)',
    focus: 'var(--pubwave-color-focus)',
    selection: 'var(--pubwave-color-selection)',
    selectionBg: 'var(--pubwave-color-selection-bg)',
    primary: 'var(--pubwave-color-primary)',
    primaryFaded: 'var(--pubwave-color-primary-faded)',
    dropIndicator: 'var(--pubwave-color-drop-indicator)',
    dropTarget: 'var(--pubwave-color-drop-target)',
    error: 'var(--pubwave-color-error)',
  },

  // Spacing
  spacing: {
    xs: 'var(--pubwave-spacing-xs)',
    sm: 'var(--pubwave-spacing-sm)',
    md: 'var(--pubwave-spacing-md)',
    lg: 'var(--pubwave-spacing-lg)',
    xl: 'var(--pubwave-spacing-xl)',
    blockPaddingX: 'var(--pubwave-block-padding-x)',
    blockPaddingY: 'var(--pubwave-block-padding-y)',
    blockMarginY: 'var(--pubwave-block-margin-y)',
    toolbarGap: 'var(--pubwave-toolbar-gap)',
  },

  // Typography
  typography: {
    fontFamily: 'var(--pubwave-font-family)',
    fontSizeBase: 'var(--pubwave-font-size-base)',
    fontSizeSmall: 'var(--pubwave-font-size-small)',
    lineHeightBase: 'var(--pubwave-line-height-base)',
    lineHeightHeading: 'var(--pubwave-line-height-heading)',
    fontWeightNormal: 'var(--pubwave-font-weight-normal)',
    fontWeightMedium: 'var(--pubwave-font-weight-medium)',
    fontWeightBold: 'var(--pubwave-font-weight-bold)',
    fontWeightHeading: 'var(--pubwave-font-weight-heading)',
  },

  // Borders & Radii
  borderRadius: {
    sm: 'var(--pubwave-border-radius-sm)',
    md: 'var(--pubwave-border-radius)',
    lg: 'var(--pubwave-border-radius-large)',
  },

  // Shadows
  shadow: {
    sm: 'var(--pubwave-shadow-sm)',
    md: 'var(--pubwave-shadow-md)',
    toolbar: 'var(--pubwave-shadow-toolbar)',
    popup: 'var(--pubwave-shadow-popup)',
  },

  // Transitions
  transition: {
    fast: 'var(--pubwave-transition-fast)',
    normal: 'var(--pubwave-transition-normal)',
  },

  // Z-index layers
  zIndex: {
    dragPreview: 100,
    dragHandle: 40,
    toolbar: 50,
    dropdown: 60,
  },
} as const;

/**
 * Default CSS custom properties
 * Include these in your base stylesheet or use the provided CSS file.
 */
export const defaultTokenValues = `
:root {
  /* Colors - Light theme */
  --pubwave-color-background: #ffffff;
  --pubwave-color-surface: #ffffff;
  --pubwave-color-text: #1a1a1a;
  --pubwave-color-text-muted: #6b7280;
  --pubwave-color-border: #e5e7eb;
  --pubwave-color-border-light: #f3f4f6;
  --pubwave-color-hover: rgba(0, 0, 0, 0.03);
  --pubwave-color-focus: rgba(0, 0, 0, 0.05);
  --pubwave-color-selection: #3b82f6;
  --pubwave-color-selection-bg: rgba(59, 130, 246, 0.1);
  --pubwave-color-primary: #3b82f6;
  --pubwave-color-primary-faded: rgba(59, 130, 246, 0.1);
  --pubwave-color-drop-indicator: #3b82f6;
  --pubwave-color-drop-target: rgba(59, 130, 246, 0.05);
  --pubwave-color-error: #ef4444;

  /* Spacing */
  --pubwave-spacing-xs: 0.25rem;
  --pubwave-spacing-sm: 0.5rem;
  --pubwave-spacing-md: 1rem;
  --pubwave-spacing-lg: 1.5rem;
  --pubwave-spacing-xl: 2rem;
  --pubwave-block-padding-x: 0;
  --pubwave-block-padding-y: 0.25rem;
  --pubwave-block-margin-y: 0.25rem;
  --pubwave-toolbar-gap: 0.25rem;

  /* Typography */
  --pubwave-font-family: inherit;
  --pubwave-font-size-base: 1rem;
  --pubwave-font-size-small: 0.875rem;
  --pubwave-line-height-base: 1.625;
  --pubwave-line-height-heading: 1.25;
  --pubwave-font-weight-normal: 400;
  --pubwave-font-weight-medium: 500;
  --pubwave-font-weight-bold: 700;
  --pubwave-font-weight-heading: 600;

  /* Borders */
  --pubwave-border-radius-sm: 0.25rem;
  --pubwave-border-radius: 0.375rem;
  --pubwave-border-radius-large: 0.5rem;

  /* Shadows */
  --pubwave-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --pubwave-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --pubwave-shadow-toolbar: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --pubwave-shadow-popup: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  /* Transitions */
  --pubwave-transition-fast: 0.1s ease;
  --pubwave-transition-normal: 0.15s ease;

  /* Z-index layers */
  --pubwave-z-drag-preview: 100;
  --pubwave-z-toolbar: 50;
  --pubwave-z-dropdown: 60;
}

/* Dark theme (if prefers-color-scheme is dark) */
@media (prefers-color-scheme: dark) {
  :root {
    --pubwave-color-background: #1a1a1a;
    --pubwave-color-surface: #262626;
    --pubwave-color-text: #e5e7eb;
    --pubwave-color-text-muted: #9ca3af;
    --pubwave-color-border: #374151;
    --pubwave-color-border-light: #4b5563;
    --pubwave-color-hover: rgba(255, 255, 255, 0.05);
    --pubwave-color-focus: rgba(255, 255, 255, 0.08);
    --pubwave-color-selection: #60a5fa;
    --pubwave-color-selection-bg: rgba(96, 165, 250, 0.15);
    --pubwave-color-primary: #60a5fa;
    --pubwave-color-primary-faded: rgba(96, 165, 250, 0.15);
    --pubwave-color-drop-indicator: #60a5fa;
    --pubwave-color-drop-target: rgba(96, 165, 250, 0.08);
    --pubwave-color-error: #f87171;
  }
}
`;

// Export alias for backwards compatibility
export const defaultTokens = defaultTokenValues;

/**
 * Utility function to combine class names
 * Filters out falsy values and joins with space
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Shared styles for dropdown section headers
 * Used in TurnIntoButton, ColorPicker, and other dropdown menus
 */
export const dropdownSectionHeaderStyle = {
  padding: 'var(--pubwave-spacing-2, 8px) var(--pubwave-spacing-3, 12px) var(--pubwave-spacing-1, 4px)',
  fontSize: 'var(--pubwave-font-size-xs, 11px)',
  fontWeight: 600,
  color: 'var(--pubwave-text-muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
} as const;

/**
 * Create a CSS variable reference
 */
export function cssVar(name: string, fallback?: string): string {
  if (fallback) {
    return `var(--pubwave-${name}, ${fallback})`;
  }
  return `var(--pubwave-${name})`;
}

/**
 * Create a data attribute selector for styling
 */
export function dataAttr(name: string, value?: string | boolean): string {
  if (value === true) {
    return `[data-${name}]`;
  }
  if (typeof value === 'string') {
    return `[data-${name}="${value}"]`;
  }
  return '';
}

/**
 * Theme class name constants
 */
export const themeClasses = {
  // Editor root
  editor: 'pubwave-editor',
  editorContent: 'pubwave-editor__content',
  editorReadonly: 'pubwave-editor--readonly',
  editorEmpty: 'pubwave-editor--empty',

  // Blocks
  block: 'pubwave-block',
  blockParagraph: 'pubwave-block--paragraph',
  blockHeading: 'pubwave-block--heading',
  blockFocused: 'pubwave-block--focused',
  blockHovered: 'pubwave-block--hovered',
  blockSelected: 'pubwave-block--selected',
  blockDragging: 'pubwave-block--dragging',
  blockDropTarget: 'pubwave-block--drop-target',

  // Marks
  markBold: 'pubwave-mark--bold',
  markItalic: 'pubwave-mark--italic',
  markLink: 'pubwave-mark--link',

  // Toolbar
  toolbar: 'pubwave-toolbar',
  toolbarButton: 'pubwave-toolbar__button',
  toolbarButtonActive: 'pubwave-toolbar__button--active',
  toolbarDivider: 'pubwave-toolbar__divider',

  // Drag and Drop
  dragHandle: 'pubwave-drag-handle',
  dropIndicator: 'pubwave-drop-indicator',
} as const;

export default tokens;
