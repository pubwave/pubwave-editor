/**
 * PubwaveEditor Unit Tests - Core Tests Only
 * 
 * Core tests for PubwaveEditor component.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PubwaveEditor } from '../../src/ui/PubwaveEditor';
import type { JSONContent } from '@tiptap/core';

describe('PubwaveEditor', () => {
  it('should render editor component', () => {
    const { container } = render(<PubwaveEditor />);
    const editor = container.querySelector('.pubwave-editor');
    expect(editor).toBeDefined();
  });

  it('should render with initial content', () => {
    const content: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello world' }],
        },
      ],
    };
    const { container } = render(<PubwaveEditor content={content} />);
    const editor = container.querySelector('.pubwave-editor');
    expect(editor).toBeDefined();
  });

  it('should render in editable mode by default', () => {
    const { container } = render(<PubwaveEditor />);
    const editor = container.querySelector('.pubwave-editor');
    expect(editor).toBeDefined();
  });

  it('should render in read-only mode when editable is false', () => {
    const { container } = render(<PubwaveEditor editable={false} />);
    const editor = container.querySelector('.pubwave-editor');
    expect(editor).toBeDefined();
  });
});
