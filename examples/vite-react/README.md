# Vite + React Example

This is a complete example of integrating Pubwave Editor with Vite and React.

## 🚀 Quick Start

```bash
# From the repository root
npm install
cd examples/vite-react
npm run dev
```

Then open [http://localhost:5174](http://localhost:5174) in your browser.

## ✨ Feature Demonstration

This example demonstrates all core features of the editor:

- ✍️ **Natural Writing** - Press Enter to create new blocks
- ⌨️ **Slash Commands** - Type `/` to open the command menu
- 🎨 **Text Formatting** - Select text to show the toolbar
- 🎨 **Color Selection** - Text colors and background colors
- 🔄 **Block Conversion** - Use "Turn Into" to convert block types
- 🖱️ **Drag & Drop** - Drag blocks to reorder content
- ⌨️ **Keyboard Shortcuts** - `Cmd/Ctrl+B` for bold, `Cmd/Ctrl+I` for italic
- 📝 **Lists** - Bullet, numbered, and task lists
- 💻 **Code Blocks** - Use `/code` to create code blocks
- 🖼️ **Image Upload** - Use `/image` to upload images or paste directly
- 👁️ **Read-only Mode** - See read-only mode in action

## 📝 Basic Usage

```tsx
import { PubwaveEditor } from '@pubwave/editor';
import '@pubwave/editor/style.css';
import { useState } from 'react';

function App() {
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
      placeholder="Start writing..."
    />
  );
}
```

## 🎨 Theme Configuration

```tsx
import type { EditorTheme } from '@pubwave/editor';

const theme: EditorTheme = {
  locale: 'en', // Optional: Set locale for internationalization (default: 'en')
  colors: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    primary: '#3b82f6',
  },
};

<PubwaveEditor
  content={content}
  onChange={setContent}
  theme={theme}
/>
```

**Note:** The editor supports multiple locales through the `locale` option in the theme. Currently, only English (`'en'`) is fully implemented. See the [main documentation](../../README.md#internationalization-i18n) for more details.

## 🖼️ Image Upload Configuration

### Using Base64 (Default)

No configuration needed, images are automatically converted to base64:

```tsx
<PubwaveEditor
  content={content}
  onChange={setContent}
/>
```

### Using Custom Upload Service

```tsx
<PubwaveEditor
  content={content}
  onChange={setContent}
  imageUpload={{
    handler: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      return data.url; // Return the image URL
    },
    maxSize: 5 * 1024 * 1024, // 5MB (optional, default: 10MB)
    accept: ['image/jpeg', 'image/png'], // Optional, default: ['image/*']
  }}
/>
```

## 📋 Event Handling

```tsx
<PubwaveEditor
  content={content}
  onChange={(newContent) => {
    setContent(newContent);
    // Save to backend, localStorage, etc.
  }}
  onSelectionChange={() => {
    console.log('Selection changed');
  }}
  onFocus={() => {
    console.log('Editor focused');
  }}
  onBlur={() => {
    console.log('Editor blurred');
  }}
  onReady={(api) => {
    console.log('Editor ready:', api);
  }}
/>
```

## 👁️ Read-only Mode

```tsx
<PubwaveEditor
  content={readOnlyContent}
  editable={false}
/>
```

## 🎨 Built-in Themes

The example includes 5 predefined themes that you can switch using the theme switcher at the top:

- **Light** - Light theme
- **Dark** - Dark theme
- **Violet** - Purple gradient theme
- **Rose** - Rose gradient theme
- **Sky** - Sky blue gradient theme

## 💡 Tips

- Type `/` to open the command menu and quickly insert various block types
- Selecting text automatically shows the formatting toolbar
- Use the drag handle to reorder blocks
- Images can be uploaded via `/image` command or pasted directly
- All keyboard shortcuts work on both Mac and Windows

## 📚 More Information

Check the [complete documentation](../../README.md) for more configuration options and API details.
