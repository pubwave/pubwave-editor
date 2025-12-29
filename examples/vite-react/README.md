# Pubwave Editor - Vite React Example

This example demonstrates a basic integration of Pubwave Editor with Vite and React.

## Key Features

- **Fast Development**: Vite's instant HMR for rapid iteration
- **TypeScript**: Fully typed React application
- **Minimal Setup**: Simple, straightforward integration

## Running the Example

```bash
# From the repository root
npm install
cd examples/vite-react
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## What to Try

1. **Writing**: Type naturally with Enter to create new blocks
2. **Formatting**: Select text to see the contextual toolbar appear
3. **Block Reordering**: Drag blocks using the handle to reorder content
4. **Read-only Mode**: See how the editor behaves without edit affordances

## Integration Pattern

```tsx
import { PubwaveEditor } from '@pubwave/editor';
import '@pubwave/editor/index.css';

function App() {
  const [content, setContent] = useState(initialContent);

  return (
    <PubwaveEditor
      content={content}
      onChange={setContent}
      theme={{
        containerClassName: 'my-editor',
      }}
    />
  );
}
```

## Theme Tokens

The example uses CSS custom properties for theming. Define these in your CSS:

- `--color-background`
- `--color-text`
- `--color-border`
- `--color-hover`
- `--color-selection`
- `--color-selection-bg`
