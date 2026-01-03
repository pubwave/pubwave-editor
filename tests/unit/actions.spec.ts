/**
 * Toolbar Actions Unit Tests
 *
 * Tests for toolbar actions in src/ui/toolbar/actions.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import {
  toggleBold,
  toggleItalic,
  setLink,
  removeLink,
  setHeading,
  setParagraph,
  toggleLink,
  createActionHandler,
  defaultToolbarActions,
} from '../../src/ui/toolbar/actions';

describe('toolbar actions', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, Italic, Link, Heading],
      content: '<p>Hello world</p>',
    });
  });

  afterEach(() => {
    if (editor && !editor.isDestroyed) {
      editor.destroy();
    }
  });

  describe('toggleBold', () => {
    it('should toggle bold formatting', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      const result = toggleBold(editor);
      
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('should handle destroyed editor', () => {
      editor.destroy();
      const result = toggleBold(editor);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not available');
    });
  });

  describe('toggleItalic', () => {
    it('should toggle italic formatting', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      const result = toggleItalic(editor);
      
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('should handle destroyed editor', () => {
      editor.destroy();
      const result = toggleItalic(editor);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('not available');
    });
  });

  describe('setLink', () => {
    it('should set link with full URL', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      const result = setLink(editor, 'https://example.com');
      
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();
    });

    it('should normalize URL without protocol', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      const result = setLink(editor, 'example.com');
      
      expect(result.success).toBe(true);
    });

    it('should reject empty URL', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      const result = setLink(editor, '');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('URL is required');
    });

    it('should handle destroyed editor', () => {
      editor.destroy();
      const result = setLink(editor, 'https://example.com');
      
      expect(result.success).toBe(false);
    });
  });

  describe('removeLink', () => {
    it('should remove link from selection', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      editor.commands.setLink({ href: 'https://example.com' });
      
      const result = removeLink(editor);
      expect(result.success).toBe(true);
    });

    it('should handle destroyed editor', () => {
      editor.destroy();
      const result = removeLink(editor);
      
      expect(result.success).toBe(false);
    });
  });

  describe('setHeading', () => {
    it('should set heading level', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      const result = setHeading(editor, 1);
      
      expect(result.success).toBe(true);
    });

    it('should handle invalid heading level', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      const result = setHeading(editor, 10);
      
      // Should handle gracefully
      expect(result).toBeDefined();
    });

    it('should handle destroyed editor', () => {
      editor.destroy();
      const result = setHeading(editor, 1);
      
      expect(result.success).toBe(false);
    });
  });

  describe('setParagraph', () => {
    it('should convert to paragraph', () => {
      editor.commands.setHeading({ level: 1 });
      editor.commands.selectAll();
      
      const result = setParagraph(editor);
      expect(result.success).toBe(true);
    });

    it('should handle destroyed editor', () => {
      editor.destroy();
      const result = setParagraph(editor);
      
      expect(result.success).toBe(false);
    });
  });

  describe('toggleLink', () => {
    it('should toggle link with prompt', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      const promptFn = vi.fn(() => 'https://example.com');
      
      const result = toggleLink(editor, promptFn);
      expect(result.success).toBe(true);
      expect(promptFn).toHaveBeenCalled();
    });

    it('should remove link if already linked', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      editor.commands.setLink({ href: 'https://example.com' });
      
      const result = toggleLink(editor);
      expect(result.success).toBe(true);
    });

    it('should handle cancelled prompt', () => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
      const promptFn = vi.fn(() => null);
      
      const result = toggleLink(editor, promptFn);
      expect(result.success).toBe(false);
      expect(result.message).toContain('cancelled');
    });
  });

  describe('createActionHandler', () => {
    it('should create action handler function', () => {
      const onResult = vi.fn();
      const handler = createActionHandler(editor, toggleBold, onResult);
      
      expect(typeof handler).toBe('function');
      handler();
      expect(onResult).toHaveBeenCalled();
    });

    it('should work without onResult callback', () => {
      const handler = createActionHandler(editor, toggleBold);
      expect(() => handler()).not.toThrow();
    });
  });

  describe('defaultToolbarActions', () => {
    it('should have default toolbar actions', () => {
      expect(defaultToolbarActions.length).toBeGreaterThan(0);
    });

    it('should have bold action', () => {
      const boldAction = defaultToolbarActions.find(a => a.id === 'bold');
      expect(boldAction).toBeDefined();
      expect(boldAction?.label).toBe('Bold');
    });

    it('should have italic action', () => {
      const italicAction = defaultToolbarActions.find(a => a.id === 'italic');
      expect(italicAction).toBeDefined();
    });
  });
});

