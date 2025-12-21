/**
 * Toast Component
 *
 * Simple toast notification for feedback messages.
 * Used for DnD error messages and other transient notifications.
 *
 * Key behaviors:
 * - Appears at bottom of editor
 * - Auto-dismisses after timeout
 * - Accessible (role="status")
 */

import React, { useEffect, useState, useCallback } from 'react';
import { cn, tokens } from './theme';

export interface ToastProps {
  /** Toast message content */
  message: string;
  /** Toast type for styling */
  type?: 'info' | 'success' | 'error' | 'warning';
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Callback when toast is dismissed */
  onDismiss?: () => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Default auto-dismiss duration
 */
const DEFAULT_DURATION = 3000;

/**
 * Toast - Transient notification component
 */
export function Toast({
  message,
  type = 'info',
  duration = DEFAULT_DURATION,
  onDismiss,
  className,
}: ToastProps): React.ReactElement {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss effect
  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onDismiss]);

  const handleDismiss = useCallback((): void => {
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  const typeColors = {
    info: tokens.colors.text,
    success: 'var(--pubwave-color-success, #10b981)',
    error: tokens.colors.error,
    warning: 'var(--pubwave-color-warning, #f59e0b)',
  };

  return (
    <div
      className={cn(
        'pubwave-toast',
        `pubwave-toast--${type}`,
        isVisible ? 'pubwave-toast--visible' : 'pubwave-toast--hidden',
        className
      )}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: `translateX(-50%) translateY(${isVisible ? '0' : '16px'})`,
        padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
        backgroundColor: `var(--pubwave-toast-bg, ${tokens.colors.surface})`,
        border: `1px solid var(--pubwave-toast-border, ${tokens.colors.border})`,
        borderRadius: tokens.borderRadius.md,
        boxShadow: tokens.shadow.md,
        color: typeColors[type],
        fontSize: tokens.typography.fontSizeSmall,
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${tokens.transition.normal}, transform ${tokens.transition.normal}`,
        zIndex: 100,
        maxWidth: '400px',
        textAlign: 'center',
      }}
      role="status"
      aria-live="polite"
    >
      <span className="pubwave-toast__message">{message}</span>
      <button
        type="button"
        className="pubwave-toast__dismiss"
        onClick={handleDismiss}
        style={{
          marginLeft: tokens.spacing.sm,
          padding: '0 4px',
          background: 'none',
          border: 'none',
          color: tokens.colors.textMuted,
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}

/**
 * Toast container for managing multiple toasts
 */
export interface ToastItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  duration?: number;
}

export interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({
  toasts,
  onDismiss,
}: ToastContainerProps): React.ReactElement {
  return (
    <div className="pubwave-toast-container">
      {toasts.map((toast, index) => {
        const bottomOffset = 24 + index * 56;
        const zIndexValue = 100 - index;
        return (
          <div
            key={toast.id}
            style={{
              position: 'fixed',
              bottom: `${String(bottomOffset)}px`,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: zIndexValue,
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onDismiss={() => {
                onDismiss(toast.id);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Create a toast ID
 */
export function createToastId(): string {
  const timestamp = String(Date.now());
  const random = Math.random().toString(36).slice(2, 9);
  return `toast-${timestamp}-${random}`;
}

export default Toast;
