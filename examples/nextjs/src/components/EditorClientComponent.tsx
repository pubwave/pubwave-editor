'use client';

import { useState } from 'react';
import { PubwaveEditor } from '@pubwave/editor';
import '@pubwave/editor/styles.css';

export default function EditorClientComponent() {
  const [content, setContent] = useState({
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Welcome to Pubwave Editor' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'This editor is rendered client-side, demonstrating SSR-safe integration with Next.js.',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Start typing, select text for formatting, or drag blocks to reorder them.',
          },
        ],
      },
    ],
  });

  return (
    <PubwaveEditor
      content={content}
      onChange={(newContent) => {
        console.log('Content changed:', newContent);
        setContent(newContent);
      }}
      theme={{
        containerClassName: 'editor-wrapper',
        contentClassName: 'editor-content',
      }}
    />
  );
}
