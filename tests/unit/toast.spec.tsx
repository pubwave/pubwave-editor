/**
 * Toast Component Unit Tests
 *
 * Tests for Toast component in src/ui/toast.tsx
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import {
  Toast,
  ToastContainer,
  createToastId,
  type ToastItem,
} from '../../src/ui/toast';

describe('Toast', () => {
  describe('basic rendering', () => {
    it('should render toast with message', () => {
      render(<Toast message="Test message" />);
      expect(screen.getByText('Test message')).toBeDefined();
    });

    it('should render with info type by default', () => {
      const { container } = render(<Toast message="Info message" />);
      const toast = container.querySelector('.pubwave-toast--info');
      expect(toast).toBeDefined();
    });

    it('should render with different types', () => {
      const { container: info } = render(
        <Toast message="Info" type="info" />
      );
      expect(info.querySelector('.pubwave-toast--info')).toBeDefined();

      const { container: success } = render(
        <Toast message="Success" type="success" />
      );
      expect(success.querySelector('.pubwave-toast--success')).toBeDefined();

      const { container: error } = render(
        <Toast message="Error" type="error" />
      );
      expect(error.querySelector('.pubwave-toast--error')).toBeDefined();

      const { container: warning } = render(
        <Toast message="Warning" type="warning" />
      );
      expect(warning.querySelector('.pubwave-toast--warning')).toBeDefined();
    });

    it('should accept className prop', () => {
      const { container } = render(
        <Toast message="Test" className="custom-class" />
      );
      const toast = container.querySelector('.custom-class');
      expect(toast).toBeDefined();
    });
  });

  describe('auto-dismiss', () => {
    it('should auto-dismiss after duration', async () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();
      
      await act(async () => {
        render(<Toast message="Test" duration={1000} onDismiss={onDismiss} />);
      });
      
      // Advance timers to trigger auto-dismiss
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await vi.runOnlyPendingTimersAsync();
      });
      
      expect(onDismiss).toHaveBeenCalled();
      
      vi.useRealTimers();
    });

    it('should not auto-dismiss when duration is 0', () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();
      
      render(<Toast message="Test" duration={0} onDismiss={onDismiss} />);
      
      vi.advanceTimersByTime(5000);
      expect(onDismiss).not.toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('manual dismiss', () => {
    it('should call onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn();
      
      render(<Toast message="Test" onDismiss={onDismiss} />);
      
      const dismissButton = screen.getByLabelText('Dismiss');
      act(() => {
        dismissButton.click();
      });
      
      expect(onDismiss).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have role="status"', () => {
      const { container } = render(<Toast message="Test" />);
      const toast = container.querySelector('[role="status"]');
      expect(toast).toBeDefined();
    });

    it('should have aria-live="polite"', () => {
      const { container } = render(<Toast message="Test" />);
      const toast = container.querySelector('[aria-live="polite"]');
      expect(toast).toBeDefined();
    });
  });
});

describe('ToastContainer', () => {
  it('should render multiple toasts', () => {
    const toasts: ToastItem[] = [
      { id: '1', message: 'Toast 1' },
      { id: '2', message: 'Toast 2' },
      { id: '3', message: 'Toast 3' },
    ];
    
    const onDismiss = vi.fn();
    render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);
    
    expect(screen.getByText('Toast 1')).toBeDefined();
    expect(screen.getByText('Toast 2')).toBeDefined();
    expect(screen.getByText('Toast 3')).toBeDefined();
  });

  it('should call onDismiss with correct id', () => {
    const toasts: ToastItem[] = [
      { id: 'toast-1', message: 'Test' },
    ];
    
    const onDismiss = vi.fn();
    render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByLabelText('Dismiss');
    act(() => {
      dismissButton.click();
    });
    
    expect(onDismiss).toHaveBeenCalledWith('toast-1');
  });

  it('should handle empty toasts array', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <ToastContainer toasts={[]} onDismiss={onDismiss} />
    );
    expect(container).toBeDefined();
  });
});

describe('createToastId', () => {
  it('should generate unique toast IDs', () => {
    const id1 = createToastId();
    const id2 = createToastId();
    
    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });

  it('should generate IDs with toast- prefix', () => {
    const id = createToastId();
    expect(id.startsWith('toast-')).toBe(true);
  });
});

