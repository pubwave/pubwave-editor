/**
 * Accessibility Utilities Unit Tests
 *
 * Tests for accessibility utilities in src/ui/a11y.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ariaLabels,
  keyboardShortcuts,
  getLabelWithShortcut,
  createAriaId,
  getLiveRegion,
  roles,
  focusTrapConfig,
  announceToScreenReader,
} from '../../src/ui/a11y';

describe('a11y utilities', () => {
  beforeEach(() => {
    // Clean up any existing announcer
    const existing = document.getElementById('pubwave-announcer');
    if (existing) {
      existing.remove();
    }
  });

  afterEach(() => {
    // Clean up announcer after each test
    const existing = document.getElementById('pubwave-announcer');
    if (existing) {
      existing.remove();
    }
  });

  describe('ariaLabels', () => {
    it('should have editor labels', () => {
      expect(ariaLabels.editor).toBe('Rich text editor');
      expect(ariaLabels.editorContent).toBe('Editor content area');
    });

    it('should have toolbar labels', () => {
      expect(ariaLabels.toolbar).toBe('Text formatting toolbar');
      expect(ariaLabels.boldButton).toBe('Toggle bold formatting');
      expect(ariaLabels.italicButton).toBe('Toggle italic formatting');
    });

    it('should have drag and drop labels', () => {
      expect(ariaLabels.dragHandle).toBe('Drag to reorder block');
      expect(ariaLabels.dropIndicator).toBe('Drop here to move block');
    });

    it('should have dialog labels', () => {
      expect(ariaLabels.linkDialog).toBe('Link editor dialog');
      expect(ariaLabels.linkUrlInput).toBe('Link URL input');
    });
  });

  describe('keyboardShortcuts', () => {
    it('should have formatting shortcuts', () => {
      expect(keyboardShortcuts.bold).toBe('Cmd+B');
      expect(keyboardShortcuts.italic).toBe('Cmd+I');
      expect(keyboardShortcuts.underline).toBe('Cmd+U');
    });

    it('should have action shortcuts', () => {
      expect(keyboardShortcuts.undo).toBe('Cmd+Z');
      expect(keyboardShortcuts.redo).toBe('Cmd+Shift+Z');
      expect(keyboardShortcuts.selectAll).toBe('Cmd+A');
    });
  });

  describe('getLabelWithShortcut', () => {
    it('should return label without shortcut when shortcut is not provided', () => {
      expect(getLabelWithShortcut('Bold')).toBe('Bold');
    });

    it('should return label with shortcut when shortcut is provided', () => {
      expect(getLabelWithShortcut('Bold', 'Cmd+B')).toBe('Bold (Cmd+B)');
    });

    it('should handle empty shortcut', () => {
      expect(getLabelWithShortcut('Bold', '')).toBe('Bold');
    });
  });

  describe('createAriaId', () => {
    it('should create ID with prefix', () => {
      expect(createAriaId('toolbar')).toBe('pubwave-toolbar');
    });

    it('should create ID with prefix and suffix', () => {
      expect(createAriaId('toolbar', 'button')).toBe('pubwave-toolbar-button');
    });

    it('should handle empty suffix', () => {
      // Empty string is falsy, so it returns baseId without suffix
      const result = createAriaId('toolbar', '');
      expect(result).toBe('pubwave-toolbar');
    });
  });

  describe('getLiveRegion', () => {
    it('should return assertive for error', () => {
      expect(getLiveRegion('error')).toBe('assertive');
    });

    it('should return polite for notification', () => {
      expect(getLiveRegion('notification')).toBe('polite');
    });

    it('should return polite for update', () => {
      expect(getLiveRegion('update')).toBe('polite');
    });
  });

  describe('roles', () => {
    it('should have editor role', () => {
      expect(roles.editor).toBe('textbox');
    });

    it('should have toolbar role', () => {
      expect(roles.toolbar).toBe('toolbar');
    });

    it('should have button role', () => {
      expect(roles.toolbarButton).toBe('button');
    });
  });

  describe('focusTrapConfig', () => {
    it('should have initial focus selector', () => {
      expect(focusTrapConfig.initialFocus).toBe('[data-autofocus]');
    });

    it('should have fallback focus selector', () => {
      expect(focusTrapConfig.fallbackFocus).toBe('button');
    });

    it('should allow escape deactivation', () => {
      expect(focusTrapConfig.escapeDeactivates).toBe(true);
    });
  });

  describe('announceToScreenReader', () => {
    it('should create announcer element', () => {
      announceToScreenReader('Test message');
      
      const announcer = document.getElementById('pubwave-announcer');
      expect(announcer).toBeDefined();
      expect(announcer?.getAttribute('role')).toBe('status');
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
    });

    it('should reuse existing announcer', () => {
      announceToScreenReader('First message');
      const firstAnnouncer = document.getElementById('pubwave-announcer');
      
      announceToScreenReader('Second message');
      const secondAnnouncer = document.getElementById('pubwave-announcer');
      
      expect(firstAnnouncer).toBe(secondAnnouncer);
    });

    it('should update aria-live priority', () => {
      announceToScreenReader('Error message', 'assertive');
      const announcer = document.getElementById('pubwave-announcer');
      expect(announcer?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should set message content', (done) => {
      announceToScreenReader('Test announcement');
      
      setTimeout(() => {
        const announcer = document.getElementById('pubwave-announcer');
        expect(announcer?.textContent).toBe('Test announcement');
        done();
      }, 100);
    });
  });
});

