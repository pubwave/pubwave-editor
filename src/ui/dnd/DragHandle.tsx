/**
 * Drag Handle Component
 *
 * A visible drag affordance for block reordering.
 * Appears on block hover with adequate hit area for mouse and touch.
 *
 * Key behaviors:
 * - Visible on block hover (not always visible)
 * - Large enough hit area (44x44px minimum for touch)
 * - Clear drag cursor feedback
 * - Does not interfere with text selection
 */

import React, { useCallback, useRef, useState } from 'react';
import { cn, tokens } from '../theme';
import { ariaLabels } from '../a11y';

export interface DragHandleProps {
  /** Block ID for drag identification */
  blockId: string;
  /** Whether the block is currently hovered */
  isHovered: boolean;
  /** Whether a drag is currently in progress */
  isDragging?: boolean;
  /** Callback when drag starts */
  onDragStart?: (blockId: string, event: React.DragEvent) => void;
  /** Callback when drag ends */
  onDragEnd?: (blockId: string, event: React.DragEvent) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Minimum hit area for accessibility (44x44px)
 */
const MIN_HIT_AREA = '44px';

/**
 * Visual handle size (smaller than hit area)
 */
const VISUAL_HANDLE_SIZE = '20px';

/**
 * DragHandle - Block drag affordance
 */
export function DragHandle({
  blockId,
  isHovered,
  isDragging = false,
  onDragStart,
  onDragEnd,
  className,
}: DragHandleProps): React.ReactElement {
  const handleRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  const handleDragStart = useCallback(
    (event: React.DragEvent): void => {
      // Set drag data
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', blockId);
      event.dataTransfer.setData('application/x-pubwave-block', blockId);

      // Create a custom drag image if supported
      if (handleRef.current) {
        const rect = handleRef.current.getBoundingClientRect();
        event.dataTransfer.setDragImage(
          handleRef.current,
          rect.width / 2,
          rect.height / 2
        );
      }

      onDragStart?.(blockId, event);
    },
    [blockId, onDragStart]
  );

  const handleDragEnd = useCallback(
    (event: React.DragEvent): void => {
      setIsPressed(false);
      onDragEnd?.(blockId, event);
    },
    [blockId, onDragEnd]
  );

  const handleMouseDown = useCallback((): void => {
    setIsPressed(true);
  }, []);

  const handleMouseUp = useCallback((): void => {
    setIsPressed(false);
  }, []);

  // Determine visibility based on hover and drag state
  const isVisible = isHovered || isDragging;

  return (
    <div
      ref={handleRef}
      className={cn(
        'pubwave-drag-handle',
        isVisible && 'pubwave-drag-handle--visible',
        isDragging && 'pubwave-drag-handle--dragging',
        isPressed && 'pubwave-drag-handle--pressed',
        className
      )}
      style={{
        // Position to the left of the block
        position: 'absolute',
        left: '-24px',
        top: '50%',
        transform: 'translateY(-50%)',

        // Hit area (larger than visual)
        width: MIN_HIT_AREA,
        height: MIN_HIT_AREA,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        // Visual styling
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${tokens.transition.fast}`,

        // Ensure clickable without stealing text selection
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      role="button"
      aria-label={ariaLabels.dragHandle}
      tabIndex={isVisible ? 0 : -1}
    >
      {/* Visual handle (smaller than hit area) */}
      <div
        className="pubwave-drag-handle__visual"
        style={{
          width: VISUAL_HANDLE_SIZE,
          height: VISUAL_HANDLE_SIZE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: tokens.borderRadius.sm,
          backgroundColor: isPressed
            ? `var(--pubwave-drag-handle-active-bg, ${tokens.colors.focus})`
            : 'transparent',
          transition: `background-color ${tokens.transition.fast}`,
        }}
      >
        <DragIcon />
      </div>
    </div>
  );
}

/**
 * Drag icon - 6 dots in 2x3 grid
 */
function DragIcon(): React.ReactElement {
  return (
    <svg
      width="12"
      height="16"
      viewBox="0 0 12 16"
      fill="currentColor"
      style={{
        color: `var(--pubwave-drag-handle-color, ${tokens.colors.textMuted})`,
      }}
    >
      {/* Left column */}
      <circle cx="3" cy="3" r="1.5" />
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="3" cy="13" r="1.5" />
      {/* Right column */}
      <circle cx="9" cy="3" r="1.5" />
      <circle cx="9" cy="8" r="1.5" />
      <circle cx="9" cy="13" r="1.5" />
    </svg>
  );
}

export default DragHandle;
