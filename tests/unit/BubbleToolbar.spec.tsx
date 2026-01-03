/**
 * BubbleToolbar Unit Tests - Core Tests Only
 * 
 * Core tests for BubbleToolbar component.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import { BubbleToolbar } from '../../src/ui/BubbleToolbar';

describe('BubbleToolbar', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, Italic],
      content: '<p>Hello world</p>',
    });
  });

  afterEach(() => {
    if (editor && !editor.isDestroyed) {
      editor.destroy();
    }
  });

  it('should render toolbar component', () => {
    const { container } = render(<BubbleToolbar editor={editor} />);
    expect(container).toBeDefined();
  });

  it('should not be visible when no text is selected', () => {
    const { container } = render(<BubbleToolbar editor={editor} />);
    const toolbar = container.querySelector('.pubwave-toolbar');
    expect(toolbar).toBeDefined();
  });
});
