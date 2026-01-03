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
import { calculateVerticalPositionFromRect } from './positionUtils';

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
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate position (top or bottom) based on available space
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const checkPosition = (): void => {
      if (!dropdownRef.current || !buttonRef.current) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight || 300; // Fallback estimate
      const newPosition = calculateVerticalPositionFromRect(buttonRect, dropdownHeight, margin);
      setPosition(newPosition);
    };

    // Check immediately and after DOM updates
    checkPosition();
    const rafId = requestAnimationFrame(() => {
      checkPosition();
    });

    return () => cancelAnimationFrame(rafId);
  }, [isOpen, buttonRef, margin]);

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

  // Calculate horizontal alignment
  const getHorizontalStyle = (): React.CSSProperties => {
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
        ...(position === 'top'
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

