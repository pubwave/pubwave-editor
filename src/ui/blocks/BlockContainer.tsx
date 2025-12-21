/**
 * Block Container UI Primitives
 *
 * Provides consistent spacing, typography hooks, and focus/hover states
 * for all block-level content in the editor.
 */

import React, { forwardRef } from 'react';
import { cn } from '../theme';

/**
 * Props for BlockContainer
 */
export interface BlockContainerProps {
  /**
   * Block element to render
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Block type for styling hooks
   */
  blockType?: 'paragraph' | 'heading' | 'list' | 'quote' | 'code';

  /**
   * Whether the block is currently focused
   */
  isFocused?: boolean;

  /**
   * Whether the block is being hovered
   */
  isHovered?: boolean;

  /**
   * Whether the block is selected (for block selection mode)
   */
  isSelected?: boolean;

  /**
   * Whether the block is being dragged
   */
  isDragging?: boolean;

  /**
   * Whether this block is a drop target
   */
  isDropTarget?: boolean;

  /**
   * Position of drop indicator
   */
  dropIndicatorPosition?: 'before' | 'after' | null;

  /**
   * Called when mouse enters the block
   */
  onMouseEnter?: () => void;

  /**
   * Called when mouse leaves the block
   */
  onMouseLeave?: () => void;

  /**
   * Data attributes for testing
   */
  'data-testid'?: string;

  /**
   * Block ID for identification
   */
  'data-block-id'?: string;
}

/**
 * BlockContainer Component
 *
 * Wraps block content with consistent styling and interaction states.
 * Uses CSS custom properties (tokens) for all colors - never hard-coded values.
 */
export const BlockContainer = forwardRef<HTMLDivElement, BlockContainerProps>(
  function BlockContainer(props, ref) {
    const {
      children,
      className,
      blockType = 'paragraph',
      isFocused = false,
      isHovered = false,
      isSelected = false,
      isDragging = false,
      isDropTarget = false,
      dropIndicatorPosition = null,
      onMouseEnter,
      onMouseLeave,
      'data-testid': testId,
      'data-block-id': blockId,
    } = props;

    const containerClass = cn(
      // Base styles
      'pubwave-block',
      'pubwave-block--container',

      // Block type modifier
      `pubwave-block--${blockType}`,

      // State modifiers (use CSS classes, not inline styles)
      isFocused && 'pubwave-block--focused',
      isHovered && 'pubwave-block--hovered',
      isSelected && 'pubwave-block--selected',
      isDragging && 'pubwave-block--dragging',
      isDropTarget && 'pubwave-block--drop-target',

      // Drop indicator position
      dropIndicatorPosition === 'before' && 'pubwave-block--drop-before',
      dropIndicatorPosition === 'after' && 'pubwave-block--drop-after',

      // Custom classes
      className
    );

    return (
      <div
        ref={ref}
        className={containerClass}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        data-testid={testId}
        data-block-id={blockId}
        data-block-type={blockType}
        data-focused={isFocused}
        data-hovered={isHovered}
        data-selected={isSelected}
        data-dragging={isDragging}
      >
        {children}
      </div>
    );
  }
);

/**
 * CSS styles for BlockContainer
 *
 * These styles use CSS custom properties (tokens) for all colors.
 * This ensures the editor can be themed by host applications.
 *
 * Include these styles in your CSS or use the exported stylesheet.
 */
export const blockContainerStyles = `
.pubwave-block {
  position: relative;
  padding: var(--pubwave-block-padding-y, 0.25rem) var(--pubwave-block-padding-x, 0);
  margin: var(--pubwave-block-margin-y, 0.25rem) 0;
  border-radius: var(--pubwave-block-border-radius, 0.25rem);
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

/* Typography */
.pubwave-block--paragraph {
  font-size: var(--pubwave-font-size-base, 1rem);
  line-height: var(--pubwave-line-height-base, 1.625);
}

.pubwave-block--heading {
  font-weight: var(--pubwave-font-weight-heading, 600);
  line-height: var(--pubwave-line-height-heading, 1.25);
}

/* Hover state - subtle feedback */
.pubwave-block--hovered {
  background-color: var(--pubwave-color-hover, rgba(0, 0, 0, 0.03));
}

/* Focus state - clear visual indicator */
.pubwave-block--focused {
  background-color: var(--pubwave-color-focus, rgba(0, 0, 0, 0.05));
}

/* Selected state - block selection mode */
.pubwave-block--selected {
  background-color: var(--pubwave-color-selection-bg, rgba(59, 130, 246, 0.1));
  box-shadow: 0 0 0 2px var(--pubwave-color-selection, #3b82f6);
}

/* Dragging state - visual feedback that block is being moved */
.pubwave-block--dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

/* Drop target state */
.pubwave-block--drop-target {
  background-color: var(--pubwave-color-drop-target, rgba(59, 130, 246, 0.05));
}

/* Drop indicator lines */
.pubwave-block--drop-before::before,
.pubwave-block--drop-after::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--pubwave-color-drop-indicator, #3b82f6);
  pointer-events: none;
}

.pubwave-block--drop-before::before {
  top: -1px;
}

.pubwave-block--drop-after::after {
  bottom: -1px;
}
`;

export default BlockContainer;
