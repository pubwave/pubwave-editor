/**
 * Color Extensions Unit Tests - Core Tests Only
 * 
 * Core tests for color mark extensions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { TextColor, BackgroundColor } from '../../src/core/extensions/color';

describe('TextColor Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextColor],
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  it('should set text color on selected text', () => {
    editor.commands.setContent('<p>Hello world</p>');
    editor.commands.setTextSelection({ from: 1, to: 6 });
    editor.commands.setColor('#ff0000');
    
    const html = editor.getHTML();
    expect(html).toMatch(/color:\s*(#ff0000|rgb\(255,\s*0,\s*0\))/);
  });

  it('should remove text color', () => {
    editor.commands.setContent('<p>Hello world</p>');
    editor.commands.setTextSelection({ from: 1, to: 6 });
    editor.commands.setColor('#ff0000');
    editor.commands.unsetColor();
    
    const html = editor.getHTML();
    expect(html).not.toMatch(/color:\s*(#ff0000|rgb\(255,\s*0,\s*0\))/);
  });
});

describe('BackgroundColor Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, BackgroundColor],
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  it('should set background color on selected text', () => {
    editor.commands.setContent('<p>Hello world</p>');
    editor.commands.setTextSelection({ from: 1, to: 6 });
    editor.commands.setBackgroundColor('#ffff00');
    
    const html = editor.getHTML();
    expect(html).toMatch(/background-color:\s*(#ffff00|rgb\(255,\s*255,\s*0\))/);
  });
});
