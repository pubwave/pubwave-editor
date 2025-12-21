# @pubwave/editor

A Notion-level block editor built with React and Tiptap.

[![npm version](https://img.shields.io/npm/v/@pubwave/editor.svg)](https://www.npmjs.com/package/@pubwave/editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 📝 **Premium Writing Experience** - Fluid, responsive editing with natural Enter-driven writing flow
- ✨ **Selection-Only Toolbar** - Contextual formatting that appears only when you select text
- 🎯 **Block Drag & Drop** - Intuitive reordering with clear visual feedback
- 🎨 **Theme Tokens** - Full styling control via CSS custom properties
- ⚡ **SSR Safe** - Works with Next.js and other SSR frameworks
- 📦 **Lightweight** - Only ships what you need (React + Tiptap peer dependencies)

## Installation

```bash
npm install @pubwave/editor
# or
yarn add @pubwave/editor
# or
pnpm add @pubwave/editor
```

## Quick Start

```tsx
import { PubwaveEditor } from '@pubwave/editor';
import '@pubwave/editor/styles.css';

function MyEditor() {
  const [content, setContent] = useState({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Start writing...' }],
      },
    ],
  });

  return (
    <PubwaveEditor
      content={content}
      onChange={(newContent) => setContent(newContent)}
    />
  );
}
```

## Requirements

### React Versions

| React Version | Status |
|---------------|--------|
| 18.x          | ✅ Tested, Recommended |
| 19.x          | ✅ Supported |

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## SSR Integration (Next.js)

The library is SSR-safe and can be imported server-side without errors. The editor component itself renders client-side only.

```tsx
'use client';

import { PubwaveEditor } from '@pubwave/editor';
import '@pubwave/editor/styles.css';

export default function EditorComponent() {
  // Your editor implementation
}
```

For a complete example, see [examples/nextjs](./examples/nextjs).

## API Reference

### `PubwaveEditor` Component

The main React component for rendering the editor.

```tsx
interface EditorProps {
  // Initial content in Tiptap JSON format
  content?: JSONContent;
  
  // Whether the editor is in read-only mode
  editable?: boolean;
  
  // Placeholder text when empty
  placeholder?: string;
  
  // Callback when content changes
  onChange?: (content: JSONContent) => void;
  
  // Theme configuration
  theme?: EditorTheme;
}
```

### `createEditor` Function

For programmatic editor creation:

```tsx
import { createEditor } from '@pubwave/editor';

const editor = createEditor({
  content: initialContent,
  editable: true,
  onUpdate: ({ editor }) => {
    console.log('Content:', editor.getJSON());
  },
});
```

## Theming

Pubwave Editor uses CSS custom properties for styling. Define these in your CSS:

```css
:root {
  --color-background: #ffffff;
  --color-text: #1a1a1a;
  --color-border: #e5e7eb;
  --color-hover: #f3f4f6;
  --color-selection: #3b82f6;
  --color-selection-bg: #dbeafe;
}
```

## Examples

- [Vite + React](./examples/vite-react) - Basic client-side integration
- [Next.js](./examples/nextjs) - SSR-safe server component integration

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT © [Pubwave](https://github.com/pubwave)
