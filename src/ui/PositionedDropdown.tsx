/**
 * Positioned Dropdown Component
 *
 * A wrapper component that automatically positions a dropdown above or below
 * a trigger button based on available viewport space.
 *
 * Features:
 * - Automatically detects available space above and below the trigger
 * - Positions dropdown above (default) or below based on space
 * - Falls back to the side with more space if neither side has enough
 */

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { calculateVerticalPositionFromRect, calculateHorizontalPositionFromRect, type HorizontalAlign } from './positionUtils';

export interface PositionedDropdownProps {
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Reference to the trigger button/element */
  buttonRef: React.RefObject<HTMLElement>;
  /** Dropdown content */
  children: ReactNode;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Horizontal alignment: 'left', 'center', or 'right' */
  align?: 'left' | 'center' | 'right';
  /** Margin from the button in pixels */
  margin?: number;
  /** Callback when clicking outside the dropdown */
  onClickOutside?: (event: MouseEvent) => void;
  /** Callback to stop propagation on dropdown click */
  onClick?: (e: React.MouseEvent) => void;
  /** Test ID for testing */
  'data-testid'?: string;
}

/**
 * PositionedDropdown Component
 *
 * Automatically positions a dropdown above or below the trigger button
 * based on available viewport space.
 */
export function PositionedDropdown({
  isOpen,
  buttonRef,
  children,
  className,
  style,
  align = 'left',
  margin = 8,
  onClickOutside,
  onClick,
  'data-testid': dataTestId,
}: PositionedDropdownProps): React.ReactElement | null {
  const [verticalPosition, setVerticalPosition] = useState<'top' | 'bottom'>('top');
  const [horizontalPosition, setHorizontalPosition] = useState<{ align: HorizontalAlign; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate position (top/bottom and left/right) based on available space
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const checkPosition = (): void => {
      if (!dropdownRef.current || !buttonRef.current) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight || 300; // Fallback estimate
      const dropdownWidth = dropdownRef.current.offsetWidth || 240; // Fallback estimate
      
      // Calculate vertical position
      const newVerticalPosition = calculateVerticalPositionFromRect(buttonRect, dropdownHeight, margin);
      setVerticalPosition(newVerticalPosition);

      // Calculate horizontal position
      // Find the positioning parent (nearest ancestor with position: relative, absolute, or fixed)
      let parentContainer: HTMLElement | null = buttonRef.current.parentElement;
      while (parentContainer) {
        const style = window.getComputedStyle(parentContainer);
        if (style.position === 'relative' || style.position === 'absolute' || style.position === 'fixed') {
          break;
        }
        parentContainer = parentContainer.parentElement;
      }
      
      // Calculate horizontal position in viewport coordinates
      const horizontalPos = calculateHorizontalPositionFromRect(
        buttonRect,
        dropdownWidth,
        align,
        margin
      );
      
      if (parentContainer) {
        // Convert to relative position from parent
        const parentRect = parentContainer.getBoundingClientRect();
        const relativeLeft = horizontalPos.left - parentRect.left;
        setHorizontalPosition({ align: horizontalPos.align, left: relativeLeft });
      } else {
        // No positioning parent found, use viewport coordinates directly
        // This should be rare, but handle it gracefully
        setHorizontalPosition(horizontalPos);
      }
    };

    // Check immediately and after DOM updates
    checkPosition();
    const rafId = requestAnimationFrame(() => {
      checkPosition();
    });

    return () => cancelAnimationFrame(rafId);
  }, [isOpen, buttonRef, margin, align]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen || !onClickOutside) return;

    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClickOutside(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClickOutside, buttonRef]);

  if (!isOpen) return null;

  // Calculate horizontal style based on computed position
  const getHorizontalStyle = (): React.CSSProperties => {
    if (horizontalPosition) {
      // Use calculated position
      return {
        left: `${horizontalPosition.left}px`,
      };
    }
    
    // Fallback to original behavior if position not calculated yet
    switch (align) {
      case 'center':
        return {
          left: '50%',
          transform: 'translateX(-50%)',
        };
      case 'right':
        return {
          right: 0,
        };
      case 'left':
      default:
        return {
          left: 0,
        };
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={className}
      data-testid={dataTestId}
      style={{
        position: 'absolute',
        ...(verticalPosition === 'top'
          ? {
              bottom: '100%',
              marginBottom: `${margin}px`,
            }
          : {
              top: '100%',
              marginTop: `${margin}px`,
            }),
        ...getHorizontalStyle(),
        ...style,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      {children}
    </div>
  );
}

