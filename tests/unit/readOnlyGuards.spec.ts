/**
 * Read-Only Guards Unit Tests
 *
 * Tests for read-only mode guards in src/ui/readOnlyGuards.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import {
  isReadOnly,
  isEditable,
  shouldRenderEditUI,
  shouldAllowToolbar,
  shouldShowDragHandle,
  shouldAllowInteraction,
  getReadOnlyClassName,
  getReadOnlyProps,
  guardHandler,
} from '../../src/ui/readOnlyGuards';

describe('read-only guards', () => {
  let editableEditor: Editor;
  let readOnlyEditor: Editor;

  beforeEach(() => {
    editableEditor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
      editable: true,
    });

    readOnlyEditor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '<p>Hello</p>',
      editable: false,
    });
  });

  afterEach(() => {
    if (editableEditor && !editableEditor.isDestroyed) {
      editableEditor.destroy();
    }
    if (readOnlyEditor && !readOnlyEditor.isDestroyed) {
      readOnlyEditor.destroy();
    }
  });

  describe('isReadOnly', () => {
    it('should return false for editable editor', () => {
      expect(isReadOnly(editableEditor)).toBe(false);
    });

    it('should return true for read-only editor', () => {
      expect(isReadOnly(readOnlyEditor)).toBe(true);
    });

    it('should return true for null editor', () => {
      expect(isReadOnly(null)).toBe(true);
    });
  });

  describe('isEditable', () => {
    it('should return true for editable editor', () => {
      expect(isEditable(editableEditor)).toBe(true);
    });

    it('should return false for read-only editor', () => {
      expect(isEditable(readOnlyEditor)).toBe(false);
    });

    it('should return false for null editor', () => {
      expect(isEditable(null)).toBe(false);
    });
  });

  describe('shouldRenderEditUI', () => {
    it('should return true for editable editor', () => {
      expect(shouldRenderEditUI(editableEditor)).toBe(true);
    });

    it('should return false for read-only editor', () => {
      expect(shouldRenderEditUI(readOnlyEditor)).toBe(false);
    });

    it('should return false for null editor', () => {
      expect(shouldRenderEditUI(null)).toBe(false);
    });
  });

  describe('shouldAllowToolbar', () => {
    it('should return true for editable editor', () => {
      expect(shouldAllowToolbar(editableEditor)).toBe(true);
    });

    it('should return false for read-only editor', () => {
      expect(shouldAllowToolbar(readOnlyEditor)).toBe(false);
    });
  });

  describe('shouldShowDragHandle', () => {
    it('should return true for editable editor', () => {
      expect(shouldShowDragHandle(editableEditor)).toBe(true);
    });

    it('should return false for read-only editor', () => {
      expect(shouldShowDragHandle(readOnlyEditor)).toBe(false);
    });
  });

  describe('shouldAllowInteraction', () => {
    it('should return true for editable editor', () => {
      expect(shouldAllowInteraction(editableEditor)).toBe(true);
    });

    it('should return false for read-only editor', () => {
      expect(shouldAllowInteraction(readOnlyEditor)).toBe(false);
    });
  });

  describe('getReadOnlyClassName', () => {
    it('should return empty string for editable editor', () => {
      expect(getReadOnlyClassName(editableEditor)).toBe('');
    });

    it('should return readonly class for read-only editor', () => {
      expect(getReadOnlyClassName(readOnlyEditor)).toBe(
        'pubwave-editor--readonly'
      );
    });

    it('should return readonly class for null editor', () => {
      expect(getReadOnlyClassName(null)).toBe('pubwave-editor--readonly');
    });
  });

  describe('getReadOnlyProps', () => {
    it('should return enabled props for editable editor', () => {
      const props = getReadOnlyProps(editableEditor);
      expect(props['aria-disabled']).toBe(false);
      expect(props.tabIndex).toBe(0);
    });

    it('should return disabled props for read-only editor', () => {
      const props = getReadOnlyProps(readOnlyEditor);
      expect(props['aria-disabled']).toBe(true);
      expect(props.tabIndex).toBe(-1);
    });

    it('should return disabled props for null editor', () => {
      const props = getReadOnlyProps(null);
      expect(props['aria-disabled']).toBe(true);
      expect(props.tabIndex).toBe(-1);
    });
  });

  describe('guardHandler', () => {
    it('should return original handler for editable editor', () => {
      const handler = vi.fn();
      const guarded = guardHandler(editableEditor, handler);
      
      guarded();
      expect(handler).toHaveBeenCalled();
    });

    it('should return no-op handler for read-only editor', () => {
      const handler = vi.fn();
      const guarded = guardHandler(readOnlyEditor, handler);
      
      guarded();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should return no-op handler for null editor', () => {
      const handler = vi.fn();
      const guarded = guardHandler(null, handler);
      
      guarded();
      expect(handler).not.toHaveBeenCalled();
    });

    it('should preserve handler arguments in editable mode', () => {
      const handler = vi.fn();
      const guarded = guardHandler(editableEditor, handler);
      
      guarded('arg1', 'arg2');
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });
});

