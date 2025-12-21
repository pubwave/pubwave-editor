/**
 * Drop Indicator Component
 *
 * Visual indicator showing where a dragged block will be dropped.
 * Provides clear before/after positioning feedback.
 *
 * Key behaviors:
 * - Clearly visible line showing insertion point
 * - Animates in smoothly (no jarring appearance)
 * - Shows before or after target block
 * - Disappears immediately when drag ends
 */

import React from 'react';
import { cn, tokens } from '../theme';

export interface DropIndicatorProps {
  /** Whether the indicator is visible */
  visible: boolean;
  /** Position relative to target block */
  position: 'before' | 'after';
  /** Additional CSS class names */
  className?: string;
}

/**
 * DropIndicator - Visual drop target indicator
 */
export function DropIndicator({
  visible,
  position,
  className,
}: DropIndicatorProps): React.ReactElement {
  return (
    <div
      className={cn(
        'pubwave-drop-indicator',
        visible && 'pubwave-drop-indicator--visible',
        `pubwave-drop-indicator--${position}`,
        className
      )}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '2px',
        backgroundColor: `var(--pubwave-drop-indicator-color, ${tokens.colors.dropIndicator})`,
        borderRadius: '1px',

        // Position based on before/after
        ...(position === 'before'
          ? { top: '-1px' }
          : { bottom: '-1px' }),

        // Visibility and animation
        opacity: visible ? 1 : 0,
        transform: visible ? 'scaleX(1)' : 'scaleX(0.8)',
        transition: `opacity ${tokens.transition.fast}, transform ${tokens.transition.fast}`,

        // Ensure it's above other content
        zIndex: 10,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {/* Optional: End caps for visual polish */}
      <IndicatorCap position="left" visible={visible} />
      <IndicatorCap position="right" visible={visible} />
    </div>
  );
}

/**
 * Small circular cap at the end of the indicator
 */
interface IndicatorCapProps {
  position: 'left' | 'right';
  visible: boolean;
}

function IndicatorCap({ position, visible }: IndicatorCapProps): React.ReactElement {
  return (
    <div
      className={`pubwave-drop-indicator__cap pubwave-drop-indicator__cap--${position}`}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        ...(position === 'left' ? { left: '-4px' } : { right: '-4px' }),
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: `var(--pubwave-drop-indicator-color, ${tokens.colors.dropIndicator})`,
        opacity: visible ? 1 : 0,
        transition: `opacity ${tokens.transition.fast}`,
      }}
    />
  );
}

export default DropIndicator;
