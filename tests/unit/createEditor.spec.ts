/**
 * CreateEditor Unit Tests - Core Tests Only
 * 
 * Core tests for editor creation factory functions.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import { createEditor, destroyEditor, isEditorValid } from '../../src/core/createEditor';

describe('createEditor', () => {
  let editor: Editor | null = null;

  afterEach(async () => {
    if (editor && !editor.isDestroyed) {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        destroyEditor(editor);
        await new Promise(resolve => setTimeout(resolve, 200));
        await new Promise(resolve => setImmediate(resolve));
      } catch (e) {
        // Ignore cleanup errors
      }
      editor = null;
    }
  });

  it('should create an editor instance with default config', () => {
    editor = createEditor();
    expect(editor).toBeInstanceOf(Editor);
    expect(editor.isDestroyed).toBe(false);
  });

  it('should create an editor with custom content', () => {
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello world' }],
        },
      ],
    };
    editor = createEditor({ content });
    expect(editor.getJSON()).toEqual(content);
  });

  it('should create an editable editor by default', () => {
    editor = createEditor();
    expect(editor.isEditable).toBe(true);
  });

  it('should create a read-only editor when editable is false', () => {
    editor = createEditor({ editable: false });
    expect(editor.isEditable).toBe(false);
  });
});

describe('isEditorValid', () => {
  let editor: Editor | null = null;

  afterEach(async () => {
    if (editor && !editor.isDestroyed) {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        destroyEditor(editor);
        await new Promise(resolve => setTimeout(resolve, 200));
        await new Promise(resolve => setImmediate(resolve));
      } catch (e) {
        // Ignore cleanup errors
      }
      editor = null;
    }
  });

  it('should return true for a valid editor', () => {
    editor = createEditor();
    expect(isEditorValid(editor)).toBe(true);
  });

  it('should return false for null editor', () => {
    expect(isEditorValid(null)).toBe(false);
  });
});
