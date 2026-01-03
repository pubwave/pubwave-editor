/**
 * Commands Unit Tests - Core Tests Only
 * 
 * Core tests for command functions.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Heading from '@tiptap/extension-heading';
import {
  toggleBold,
  toggleItalic,
  setHeading,
  setParagraph,
  isMarkActive,
  isNodeActive,
} from '../../src/core/commands';

describe('Commands', () => {
  let editor: Editor;

  beforeEach(async () => {
    editor = new Editor({
      extensions: [
        Document,
        Paragraph,
        Text,
        Bold,
        Italic,
        Heading,
      ],
      content: '<p>Hello world</p>',
    });
  });

  it('should toggle bold formatting', () => {
    editor.commands.selectAll();
    const result = toggleBold(editor);
    expect(result).toBe(true);
    expect(isMarkActive(editor, 'bold')).toBe(true);
  });

  it('should toggle italic formatting', () => {
    editor.commands.selectAll();
    const result = toggleItalic(editor);
    expect(result).toBe(true);
    expect(isMarkActive(editor, 'italic')).toBe(true);
  });

  it('should set heading with level', () => {
    const result = setHeading(editor, 1);
    expect(result).toBe(true);
    expect(isNodeActive(editor, 'heading', { level: 1 })).toBe(true);
  });

  it('should set paragraph', () => {
    editor.commands.setHeading({ level: 1 });
    const result = setParagraph(editor);
    expect(result).toBe(true);
    expect(isNodeActive(editor, 'paragraph')).toBe(true);
  });
});
