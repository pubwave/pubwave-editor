/**
 * Toolbar Button Components
 *
 * Base button and divider components for the toolbar.
 */

import React from 'react';
import { cn } from '../theme';

/**
 * Toolbar button component
 */
export interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  'data-tooltip'?: string;
  'data-testid'?: string;
  'aria-label': string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ active = false, disabled = false, onClick, 'data-tooltip': dataTooltip, 'data-testid': dataTestId, 'aria-label': ariaLabel, children, style }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'pubwave-toolbar__button',
          active && 'pubwave-toolbar__button--active',
          disabled && 'pubwave-toolbar__button--disabled'
        )}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: style?.width ?? 'var(--pubwave-button-width, 28px)',
          height: style?.height ?? 'var(--pubwave-button-height, 28px)',
          minWidth: style?.minWidth,
          padding: style?.padding ?? 0,
          border: 'none',
          borderRadius: 'var(--pubwave-radius-sm, 4px)',
          backgroundColor: 'transparent',
          color: active ? 'var(--pubwave-primary)' : 'var(--pubwave-text)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'color 0.1s ease, background-color 0.1s ease',
          ...style,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        disabled={disabled}
        data-tooltip={dataTooltip}
        data-testid={dataTestId}
        aria-label={ariaLabel}
        aria-pressed={active}
        onMouseDown={(e) => {
          // Prevent toolbar from hiding when clicking buttons
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {children}
      </button>
    );
  }
);

ToolbarButton.displayName = 'ToolbarButton';

/**
 * Toolbar divider
 */
export function ToolbarDivider(): React.ReactElement {
  return (
    <div
      className="pubwave-toolbar__divider"
      style={{
        width: 'var(--pubwave-divider-width, 1px)',
        height: 'var(--pubwave-divider-height, 20px)',
        backgroundColor: 'var(--pubwave-border)',
        margin: '0 var(--pubwave-spacing-1, 4px)',
      }}
      role="separator"
      aria-orientation="vertical"
    />
  );
}

