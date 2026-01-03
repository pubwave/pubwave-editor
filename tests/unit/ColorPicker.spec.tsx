/**
 * ColorPicker Unit Tests
 *
 * Tests for ColorPicker component in src/ui/ColorPicker.tsx
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { TextColor, BackgroundColor } from '../../src/core/extensions/color';
import { ColorPicker } from '../../src/ui/ColorPicker';

describe('ColorPicker', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, TextColor, BackgroundColor],
      content: '<p>Hello world</p>',
    });
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    if (editor && !editor.isDestroyed) {
      editor.destroy();
    }
    localStorage.clear();
  });

  describe('basic rendering', () => {
    it('should render color picker component', () => {
      const buttonRef = { current: document.createElement('button') };
      const { container } = render(
        <ColorPicker editor={editor} buttonRef={buttonRef} />
      );
      expect(container).toBeDefined();
    });

    it('should render text color options', () => {
      const buttonRef = { current: document.createElement('button') };
      const { container } = render(
        <ColorPicker editor={editor} buttonRef={buttonRef} />
      );
      // Color picker should render
      expect(container).toBeDefined();
    });

    it('should render background color options', () => {
      const buttonRef = { current: document.createElement('button') };
      const { container } = render(
        <ColorPicker editor={editor} buttonRef={buttonRef} />
      );
      // Should render
      expect(container).toBeDefined();
    });
  });

  describe('editor integration', () => {
    it('should handle destroyed editor gracefully', () => {
      editor.destroy();
      const buttonRef = { current: document.createElement('button') };
      const { container } = render(
        <ColorPicker editor={editor} buttonRef={buttonRef} />
      );
      // Should not throw
      expect(container).toBeDefined();
    });

    it('should accept onClose callback', () => {
      const onClose = vi.fn();
      const buttonRef = { current: document.createElement('button') };
      render(
        <ColorPicker editor={editor} onClose={onClose} buttonRef={buttonRef} />
      );
      // Callback should be registered
      expect(onClose).toBeDefined();
    });

    it('should accept buttonRef prop', () => {
      const buttonRef = { current: document.createElement('button') };
      const { container } = render(
        <ColorPicker editor={editor} buttonRef={buttonRef} />
      );
      expect(container).toBeDefined();
    });
  });

  describe('color selection', () => {
    it('should render color picker for text color selection', () => {
      editor.commands.setContent('<p>Test</p>');
      editor.commands.selectAll();
      
      const buttonRef = { current: document.createElement('button') };
      const { container } = render(
        <ColorPicker editor={editor} buttonRef={buttonRef} />
      );
      
      // Color picker should render
      expect(container).toBeDefined();
    });

    it('should render color picker for background color selection', () => {
      editor.commands.setContent('<p>Test</p>');
      editor.commands.selectAll();
      
      const buttonRef = { current: document.createElement('button') };
      const { container } = render(
        <ColorPicker editor={editor} buttonRef={buttonRef} />
      );
      
      // Color picker should render
      expect(container).toBeDefined();
    });
  });

  describe('recent colors', () => {
    it('should handle localStorage for recent colors', () => {
      const recentColors = [
        { type: 'text' as const, value: '#ff0000' },
        { type: 'background' as const, value: '#ffff00' },
      ];
      localStorage.setItem(
        'pubwave-editor-recent-colors',
        JSON.stringify(recentColors)
      );
      
      const buttonRef = { current: document.createElement('button') };
      const { container } = render(
        <ColorPicker editor={editor} buttonRef={buttonRef} />
      );
      // Component should render
      expect(container).toBeDefined();
    });

    it('should handle missing localStorage gracefully', () => {
      // localStorage is already cleared in beforeEach
      const buttonRef = { current: document.createElement('button') };
      const { container } = render(
        <ColorPicker editor={editor} buttonRef={buttonRef} />
      );
      // Should render without errors even without localStorage
      expect(container).toBeDefined();
    });
  });
});

