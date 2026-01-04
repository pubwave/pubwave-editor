/**
 * Auto-scroll Utility
 *
 * Enables automatic scrolling when dragging near viewport edges.
 * Essential for long documents where blocks need to be moved across visible area.
 *
 * Key behaviors:
 * - Smooth scrolling that accelerates near edges
 * - Works with both window and container scrolling
 * - Cleans up properly when drag ends
 */

import { safeRequestAnimationFrame } from '../../core/util';

/**
 * Edge detection threshold in pixels
 */
const EDGE_THRESHOLD = 50;

/**
 * Maximum scroll speed in pixels per frame
 */
const MAX_SCROLL_SPEED = 15;

/**
 * Auto-scroll state
 */
interface AutoScrollState {
  isActive: boolean;
  direction: 'up' | 'down' | null;
  speed: number;
  animationId: number | null;
}

/**
 * Calculate scroll speed based on distance from edge
 */
function calculateSpeed(distanceFromEdge: number): number {
  // Closer to edge = faster scrolling
  const normalized = 1 - distanceFromEdge / EDGE_THRESHOLD;
  return Math.round(normalized * MAX_SCROLL_SPEED);
}

/**
 * Create an auto-scroll controller for drag operations
 */
export function createAutoScroller(
  scrollContainer?: HTMLElement | null
): {
  start: () => void;
  update: (clientY: number) => void;
  stop: () => void;
} {
  const state: AutoScrollState = {
    isActive: false,
    direction: null,
    speed: 0,
    animationId: null,
  };

  /**
   * Get the scroll target (container or window)
   */
  const getScrollTarget = (): HTMLElement | Window => {
    return scrollContainer ?? window;
  };

  /**
   * Get viewport bounds for edge detection
   */
  const getViewportBounds = (): { top: number; bottom: number } => {
    if (scrollContainer) {
      const rect = scrollContainer.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    }
    return { top: 0, bottom: window.innerHeight };
  };

  /**
   * Perform the scroll animation frame
   */
  const scrollFrame = (): void => {
    if (!state.isActive || state.direction === null) {
      return;
    }

    const target = getScrollTarget();
    const scrollAmount = state.direction === 'up' ? -state.speed : state.speed;

    if (target === window) {
      window.scrollBy(0, scrollAmount);
    } else if (target instanceof HTMLElement) {
      target.scrollTop += scrollAmount;
    }

    // Continue scrolling
    state.animationId = safeRequestAnimationFrame(scrollFrame);
  };

  return {
    /**
     * Start auto-scroll monitoring
     */
    start(): void {
      state.isActive = true;
    },

    /**
     * Update auto-scroll based on cursor position
     */
    update(clientY: number): void {
      if (!state.isActive) return;

      const bounds = getViewportBounds();
      const distanceFromTop = clientY - bounds.top;
      const distanceFromBottom = bounds.bottom - clientY;

      // Determine scroll direction and speed
      if (distanceFromTop < EDGE_THRESHOLD) {
        state.direction = 'up';
        state.speed = calculateSpeed(distanceFromTop);
      } else if (distanceFromBottom < EDGE_THRESHOLD) {
        state.direction = 'down';
        state.speed = calculateSpeed(distanceFromBottom);
      } else {
        state.direction = null;
        state.speed = 0;
      }

      // Start or stop scrolling based on direction
      if (state.direction !== null && state.animationId === null) {
        state.animationId = safeRequestAnimationFrame(scrollFrame);
      } else if (state.direction === null && state.animationId !== null) {
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
      }
    },

    /**
     * Stop auto-scroll
     */
    stop(): void {
      state.isActive = false;
      state.direction = null;
      state.speed = 0;

      if (state.animationId !== null) {
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
      }
    },
  };
}

/**
 * React hook for auto-scroll during drag operations
 */
export function useAutoScroll(
  scrollContainer?: HTMLElement | null
): {
  startAutoScroll: () => void;
  updateAutoScroll: (event: { clientY: number }) => void;
  stopAutoScroll: () => void;
} {
  // Create scroller instance (stable reference via closure)
  let scroller: ReturnType<typeof createAutoScroller> | null = null;

  const getScroller = (): ReturnType<typeof createAutoScroller> => {
    scroller ??= createAutoScroller(scrollContainer);
    return scroller;
  };

  return {
    startAutoScroll(): void {
      getScroller().start();
    },

    updateAutoScroll(event: { clientY: number }): void {
      getScroller().update(event.clientY);
    },

    stopAutoScroll(): void {
      getScroller().stop();
      scroller = null;
    },
  };
}

export default createAutoScroller;
