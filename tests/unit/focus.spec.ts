/**
 * Focus Management Unit Tests
 *
 * Tests for focus utilities in src/ui/focus.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import {
  focusAt,
  restoreFocus,
  focusAfterClick,
  maintainFocus,
  saveSelection,
  restoreSelection,
  handleSelectionClear,
  createFocusTrap,
  type SavedSelection,
} from '../../src/ui/focus';

describe('focus utilities', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello world</p>',
    });
  });

  afterEach(() => {
    if (editor && !editor.isDestroyed) {
      editor.destroy();
    }
  });

  describe('focusAt', () => {
    it('should call focus at start without errors', async () => {
      expect(() => focusAt(editor, 'start')).not.toThrow();
      // Wait for RAF
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should call focus at end without errors', async () => {
      expect(() => focusAt(editor, 'end')).not.toThrow();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should preserve selection when focusing', async () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      expect(() => focusAt(editor, 'preserve')).not.toThrow();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should focus at specific position', async () => {
      expect(() => focusAt(editor, 5)).not.toThrow();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should handle null editor gracefully', () => {
      expect(() => focusAt(null as any, 'start')).not.toThrow();
    });

    it('should handle destroyed editor gracefully', () => {
      editor.destroy();
      expect(() => focusAt(editor, 'start')).not.toThrow();
    });
  });

  describe('restoreFocus', () => {
    it('should restore focus to editor without errors', async () => {
      expect(() => restoreFocus(editor)).not.toThrow();
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should handle null editor gracefully', () => {
      expect(() => restoreFocus(null as any)).not.toThrow();
    });
  });

  describe('focusAfterClick', () => {
    it('should focus editor after click event', async () => {
      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent;
      
      expect(() => focusAfterClick(editor, event)).not.toThrow();
      expect(event.preventDefault).toHaveBeenCalled();
      
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should handle null editor gracefully', () => {
      const event = {
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent;
      
      expect(() => focusAfterClick(null as any, event)).not.toThrow();
    });
  });

  describe('maintainFocus', () => {
    it('should return cleanup function', () => {
      const cleanup = maintainFocus(editor);
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('should handle null editor', () => {
      const cleanup = maintainFocus(null as any);
      expect(typeof cleanup).toBe('function');
      cleanup();
    });
  });

  describe('saveSelection and restoreSelection', () => {
    it('should save selection state', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      const saved = saveSelection(editor);
      
      expect(saved).not.toBeNull();
      if (saved) {
        expect(saved.from).toBe(1);
        expect(saved.to).toBe(6);
        expect(saved.empty).toBe(false);
      }
    });

    it('should restore selection state', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      const saved = saveSelection(editor);
      
      editor.commands.setTextSelection({ from: 0, to: 0 });
      restoreSelection(editor, saved);
      
      const { from, to } = editor.state.selection;
      expect(from).toBe(1);
      expect(to).toBe(6);
    });

    it('should return null for invalid editor', () => {
      expect(saveSelection(null as any)).toBeNull();
    });

    it('should handle null saved selection', () => {
      expect(() => restoreSelection(editor, null)).not.toThrow();
    });

    it('should clamp positions to valid range', () => {
      const saved: SavedSelection = { from: 1000, to: 2000, empty: false };
      restoreSelection(editor, saved);
      // Should not throw, positions should be clamped
      expect(editor.state.selection.from).toBeLessThanOrEqual(editor.state.doc.content.size);
    });
  });

  describe('handleSelectionClear', () => {
    it('should focus editor when selection is cleared', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      expect(() => handleSelectionClear(editor)).not.toThrow();
    });

    it('should handle null editor gracefully', () => {
      expect(() => handleSelectionClear(null as any)).not.toThrow();
    });
  });

  describe('createFocusTrap', () => {
    it('should create focus trap with activate and deactivate', () => {
      const container = document.createElement('div');
      container.innerHTML = '<button>Button 1</button><button>Button 2</button>';
      document.body.appendChild(container);
      
      const trap = createFocusTrap(container);
      expect(trap.activate).toBeDefined();
      expect(trap.deactivate).toBeDefined();
      
      trap.activate();
      trap.deactivate();
      
      document.body.removeChild(container);
    });

    it('should handle empty container', () => {
      const container = document.createElement('div');
      const trap = createFocusTrap(container);
      
      expect(() => trap.activate()).not.toThrow();
      expect(() => trap.deactivate()).not.toThrow();
    });
  });
});

