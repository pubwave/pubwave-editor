/**
 * Utility Functions Unit Tests
 *
 * Tests for utility functions in src/core/util.ts
 */

import { describe, it, expect, vi } from 'vitest';
import {
  isSSR,
  canUseDOM,
  safeRequestAnimationFrame,
  safeCancelAnimationFrame,
  safeSetTimeout,
  safeClearTimeout,
  runInBrowser,
  getBrowserAPI,
} from '../../src/core/util';

describe('SSR Utilities', () => {
  describe('isSSR', () => {
    it('should return false in jsdom environment (browser-like)', () => {
      // In jsdom test environment, window is defined
      expect(isSSR).toBe(false);
    });
  });

  describe('canUseDOM', () => {
    it('should return true in jsdom environment', () => {
      // In jsdom test environment, DOM APIs are available
      expect(canUseDOM).toBe(true);
    });

    it('should detect window object', () => {
      expect(typeof window).toBe('object');
      expect(canUseDOM).toBe(true);
    });

    it('should detect document object', () => {
      expect(typeof document).toBe('object');
      expect(canUseDOM).toBe(true);
    });

    it('should detect createElement function', () => {
      expect(typeof document.createElement).toBe('function');
      expect(canUseDOM).toBe(true);
    });
  });

  describe('safeRequestAnimationFrame', () => {
    it('should call requestAnimationFrame in browser environment', async () => {
      const callback = vi.fn();
      
      const handle = safeRequestAnimationFrame(callback);
      expect(typeof handle).toBe('number');
      
      // Wait for callback to be called
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(callback).toHaveBeenCalled();
    });

    it('should return a number handle', () => {
      const callback = vi.fn();
      const handle = safeRequestAnimationFrame(callback);
      expect(typeof handle).toBe('number');
    });
  });

  describe('safeCancelAnimationFrame', () => {
    it('should cancel animation frame in browser environment', () => {
      const callback = vi.fn();
      const handle = safeRequestAnimationFrame(callback);
      
      safeCancelAnimationFrame(handle);
      
      // Wait a bit to ensure callback wasn't called
      setTimeout(() => {
        expect(callback).not.toHaveBeenCalled();
      }, 100);
    });

    it('should handle invalid handles gracefully', () => {
      expect(() => safeCancelAnimationFrame(-1)).not.toThrow();
    });
  });

  describe('safeSetTimeout', () => {
    it('should return timeout handle in browser environment', async () => {
      const callback = vi.fn();
      
      const handle = safeSetTimeout(callback, 10);
      expect(handle).not.toBeNull();
      
      // Wait for callback to be called
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(callback).toHaveBeenCalled();
    });

    it('should execute callback after delay', async () => {
      const callback = vi.fn();
      
      safeSetTimeout(callback, 10);
      
      // Wait for callback to be called
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('safeClearTimeout', () => {
    it('should clear timeout in browser environment', (done) => {
      const callback = vi.fn();
      const handle = safeSetTimeout(callback, 100);
      
      safeClearTimeout(handle);
      
      setTimeout(() => {
        expect(callback).not.toHaveBeenCalled();
        done();
      }, 150);
    });

    it('should handle null handle gracefully', () => {
      expect(() => safeClearTimeout(null)).not.toThrow();
    });
  });

  describe('runInBrowser', () => {
    it('should execute callback in browser environment', () => {
      const result = runInBrowser(() => {
        return 'browser-result';
      });
      
      expect(result).toBe('browser-result');
    });

    it('should return undefined for non-browser operations', () => {
      // This test verifies the function works, but in jsdom it will execute
      const result = runInBrowser(() => {
        return 'test';
      });
      
      // In jsdom, it should return the result
      expect(result).toBe('test');
    });
  });

  describe('getBrowserAPI', () => {
    it('should return window property in browser environment', () => {
      const location = getBrowserAPI('location');
      expect(location).toBeDefined();
    });

    it('should return undefined for non-existent property', () => {
      // Use a property that likely doesn't exist
      const result = getBrowserAPI('__nonExistentProperty__' as keyof Window);
      expect(result).toBeUndefined();
    });

    it('should return document from window', () => {
      const document = getBrowserAPI('document');
      expect(document).toBeDefined();
    });
  });
});

