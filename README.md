# @pubwave/editor

A Notion-level block editor built with React and Tiptap.

[![npm version](https://img.shields.io/npm/v/@pubwave/editor.svg)](https://www.npmjs.com/package/@pubwave/editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 📝 **Premium Writing Experience** - Fluid, responsive editing with natural Enter-driven writing flow
- ✨ **Selection-Only Toolbar** - Contextual formatting that appears only when you select text
- 🎯 **Block Drag & Drop** - Intuitive reordering with clear visual feedback
- 🎨 **Theme Tokens** - Full styling control via CSS custom properties
- ⚡ **SSR Safe** - Works with Next.js and other SSR frameworks
- 📦 **Lightweight** - Only ships what you need (React + Tiptap peer dependencies)
- ⌨️ **Slash Commands** - Type `/` to quickly insert blocks and formatting
- 🎨 **Text & Background Colors** - Rich color picker with recently used colors
- 🔄 **Turn Into** - Convert blocks between different types (paragraph, headings, lists, etc.)
- 📋 **Rich Formatting** - Bold, italic, underline, strikethrough, code, and links
- 📝 **Multiple Block Types** - Paragraphs, headings, lists, quotes, code blocks, and more
- 🖼️ **Image Support** - Upload images via file picker or paste from clipboard, with base64 or custom upload service
- 🌐 **Internationalization** - Multi-language support with English as default

---

## 📦 Installation

```bash
npm install @pubwave/editor
# or
yarn add @pubwave/editor
# or
pnpm add @pubwave/editor
```

---

## 🚀 Quick Start

```tsx
import { PubwaveEditor } from '@pubwave/editor';
import '@pubwave/editor/style.css';

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

---

## 📋 Requirements

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

---

## 📖 API Reference

### `PubwaveEditor` Component

The main React component for rendering the editor.

#### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `JSONContent` | `undefined` | Initial content in Tiptap JSON format |
| `editable` | `boolean` | `true` | Whether the editor is in read-only mode |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text shown when the editor is empty |
| `theme` | `EditorTheme` | `undefined` | Theme configuration object (see [Theming](#-theming)) |
| `autofocus` | `boolean \| 'start' \| 'end'` | `false` | Enable autofocus on mount. `true` or `'end'` focuses at the end, `'start'` focuses at the beginning |
| `imageUpload` | `ImageUploadConfig` | `undefined` | Image upload configuration (see [Image Upload](#-image-upload)) |
| `width` | `string` | `'100%'` | Editor container width. Can be a CSS value like `'100%'`, `'1200px'`, `'90vw'`, etc. Defaults to `'100%'` (full width of parent container) |
| `onChange` | `(content: JSONContent) => void` | `undefined` | Callback fired when the editor content changes |
| `onSelectionChange` | `() => void` | `undefined` | Callback fired when the selection changes |
| `onFocus` | `() => void` | `undefined` | Callback fired when the editor gains focus |
| `onBlur` | `() => void` | `undefined` | Callback fired when the editor loses focus |
| `onReady` | `(api: EditorAPI) => void` | `undefined` | Callback fired when the editor is ready with API access |
| `className` | `string` | `undefined` | Additional CSS class for the container |
| `data-testid` | `string` | `'pubwave-editor'` | Test ID for testing purposes |

For complete TypeScript type definitions, see the exported types from `@pubwave/editor`:
- `EditorTheme` - Theme configuration
- `EditorAPI` - Editor API interface
- `EditorLocale` - Supported locale codes: `'en' | 'zh' | 'zh-CN' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'pt'`
- `ImageUploadConfig` - Image upload configuration

### `EditorAPI` Methods

The editor exposes a public API through the `ref` prop or `onReady` callback:

```tsx
import { useRef } from 'react';
import type { EditorAPI } from '@pubwave/editor';

const editorRef = useRef<EditorAPI | null>(null);

<PubwaveEditor
  ref={editorRef}
  onReady={(api) => {
    editorRef.current = api;
  }}
/>

// Later, use the API
editorRef.current?.setContent(newContent);
editorRef.current?.getJSON();
editorRef.current?.toggleBold();
```

#### Available Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getState()` | Get current editor state | - | `EditorState` |
| `getJSON()` | Get content as JSON | - | `JSONContent` |
| `getHTML()` | Get content as HTML | - | `string` |
| `getText()` | Get content as plain text | - | `string` |
| `setContent(content)` | Set new content | `content: JSONContent` | `void` |
| `clearContent()` | Clear all content | - | `void` |
| `setEditable(editable)` | Toggle read-only mode | `editable: boolean` | `void` |
| `focus(position?)` | Focus the editor | `position?: 'start' \| 'end'` | `void` |
| `blur()` | Blur the editor | - | `void` |
| `toggleBold()` | Toggle bold formatting | - | `void` |
| `toggleItalic()` | Toggle italic formatting | - | `void` |
| `setLink(href)` | Set or remove a link | `href: string \| null` | `void` |
| `destroy()` | Destroy the editor instance | - | `void` |


---

## 🖼️ Image Upload

The editor supports two image upload modes:

1. **Base64 (Default)** - Images are converted to base64 data URLs and embedded directly
2. **Custom Upload Service** - Images are uploaded to your server and URLs are stored

### Base64 Mode (Default)

By default, images are converted to base64. No configuration needed:

```tsx
<PubwaveEditor />
```

### Custom Upload Service

Configure a custom upload handler to upload images to your server:

```tsx
<PubwaveEditor
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
    accept: ['image/jpeg', 'image/png', 'image/webp'], // Optional, default: ['image/*']
  }}
/>
```


### Image Upload Features

- **File Picker**: Use `/image` command in slash menu to open file picker
- **Paste Support**: Paste images from clipboard (Ctrl/Cmd+V)
- **Automatic Fallback**: If custom upload fails, automatically falls back to base64
- **File Validation**: Validates file type and size before upload
- **Error Handling**: Logs errors to console if upload fails

### Custom Upload Service

The `handler` function receives a `File` object and should return a Promise that resolves to the image URL. The editor will automatically fall back to base64 if the upload fails.

```tsx
<PubwaveEditor
  imageUpload={{
    handler: async (file: File) => {
      // Upload to your server (Cloudinary, AWS S3, etc.)
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      return data.url; // Return the image URL
    },
    maxSize: 10 * 1024 * 1024, // 10MB (optional)
    accept: ['image/jpeg', 'image/png', 'image/webp'], // Optional
  }}
/>
```

---

## 🎨 Theming

Pubwave Editor supports full theme customization through the `theme` prop. You can customize colors, backgrounds, and more.

### Basic Theme Configuration

```tsx
import { PubwaveEditor } from '@pubwave/editor';
import type { EditorTheme } from '@pubwave/editor';

const theme: EditorTheme = {
  colors: {
    background: '#ffffff',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    primary: '#3b82f6',
  },
};

<PubwaveEditor theme={theme} />
```

For complete `EditorTheme` interface definition, see TypeScript definitions. Key properties:
- `colors` - Color configuration (background, text, border, primary, linkColor)
- `locale` - Locale code for internationalization
- `backgroundImage` - Optional background image URL
- `backgroundImageOptions` - Background image display options (size, position, repeat, attachment)

### Predefined Themes

The editor includes several predefined themes:

#### Light Theme
```tsx
const lightTheme: EditorTheme = {
  colors: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    text: '#1f2937',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    primary: '#3b82f6',
  },
};
```

#### Dark Theme
```tsx
const darkTheme: EditorTheme = {
  colors: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    border: '#334155',
    primary: '#60a5fa',
    linkColor: '#3b82f6',
  },
};
```

**Other themes:** Violet, Rose, Sky (gradient themes).

### Background Image

You can add a background image to the editor container:

```tsx
<PubwaveEditor
  theme={{
    colors: {
      background: '#ffffff',
      text: '#1f2937',
    },
    backgroundImage: 'https://example.com/background.jpg',
    backgroundImageOptions: {
      size: 'cover',
      position: 'center',
      repeat: 'no-repeat',
      attachment: 'fixed',
    },
  }}
/>
```

**Background Image Options:**
- `size`: `'cover'` (default) | `'contain'` | custom CSS value (e.g., `'100% 100%'`)
- `position`: CSS position value (default: `'center'`)
- `repeat`: `'no-repeat'` (default) | `'repeat'` | `'repeat-x'` | `'repeat-y'`
- `attachment`: `'scroll'` (default) | `'fixed'` | `'local'`

**Note:** The background image will be layered on top of the background color. If you want the image to be the only background, set `background: 'transparent'` in the colors.

### Internationalization (i18n)

Pubwave Editor supports multiple languages through the `locale` option in the theme configuration. The editor defaults to English (`'en'`).

#### Supported Locales

The following locale codes are supported:
- `'en'` - English (default)
- `'zh'` - Chinese
- `'zh-CN'` - Simplified Chinese
- `'ja'` - Japanese
- `'ko'` - Korean
- `'fr'` - French
- `'de'` - German
- `'es'` - Spanish
- `'pt'` - Portuguese

**Note:** Currently, only English translations are fully implemented. Other languages will fall back to English. The framework is ready for future language additions.

#### Setting the Locale

```tsx
import { PubwaveEditor } from '@pubwave/editor';
import type { EditorTheme } from '@pubwave/editor';

const theme: EditorTheme = {
  locale: 'en', // Default, can be set to any supported locale
  colors: {
    background: '#ffffff',
    text: '#1f2937',
    primary: '#3b82f6',
  },
};

<PubwaveEditor theme={theme} />
```

The locale affects all user-facing text in the editor, including:
- Slash command menu items and descriptions
- Toolbar button labels and tooltips
- Accessibility labels (ARIA)
- Block type labels
- Placeholder text

### CSS Custom Properties

The editor also uses CSS custom properties for styling. Define these in your CSS:

```css
:root {
  --pubwave-bg: #ffffff;
  --pubwave-text: #1a1a1a;
  --pubwave-text-muted: #6b7280;
  --pubwave-border: #e5e7eb;
  --pubwave-primary: #3b82f6;
  --pubwave-hover: rgba(0, 0, 0, 0.05);
}
```

---

## 🎯 Core Features

### Slash Commands

Type `/` anywhere in the editor to open the command menu. Filter commands by typing keywords.

**Available Commands:**

| Command | Aliases | Description |
|---------|---------|-------------|
| `/text` or `/paragraph` | `/p`, `/text` | Plain text block |
| `/heading1` | `/h1`, `/title` | Large section heading |
| `/heading2` | `/h2`, `/subtitle` | Medium section heading |
| `/heading3` | `/h3` | Small section heading |
| `/bullet` | `/ul`, `/bullet`, `/-` | Bulleted list |
| `/numbered` | `/ol`, `/numbered`, `/1.` | Numbered list |
| `/todo` | `/task`, `/checkbox`, `/[]` | To-do list with checkboxes |
| `/image` | `/img`, `/picture`, `/photo`, `/pic` | Upload or paste an image |
| `/quote` | `/blockquote`, `/>` | Quote block |
| `/code` | `/pre`, `/snippet`, `/``` | Code block |
| `/divider` | `/hr`, `/line`, `/---` | Horizontal divider |

**Usage:**
1. Type `/` to open the menu
2. Type to filter (e.g., `/h1` for heading 1, `/img` for image)
3. Press `Enter` or click to select
4. Use `ArrowUp`/`ArrowDown` to navigate
5. Press `Escape` to close

### Selection Toolbar

The toolbar appears automatically when you select text, providing quick access to formatting options.

**Available Actions:**
- **Turn Into** - Convert block type (Paragraph, Heading 1-3, Bulleted List, Numbered List)
- **Bold** (`Cmd/Ctrl+B`) - Make text bold
- **Italic** (`Cmd/Ctrl+I`) - Make text italic
- **Underline** - Underline text
- **Strikethrough** - Strikethrough text
- **Code** - Inline code formatting
- **Link** - Add or edit link
- **Text Color** - Change text color (with recently used colors)
- **Background Color** - Change background color (with recently used colors)

### Block Types

The editor supports the following block types:

- **Paragraph** - Default text block
- **Heading 1-3** - Section headings
- **Bulleted List** - Unordered list with bullets
- **Numbered List** - Ordered list with numbers
- **Task List** - Checklist with checkboxes
- **Image** - Image block (supports base64 or URL)
- **Blockquote** - Quote block
- **Code Block** - Code snippet with syntax highlighting
- **Horizontal Rule** - Divider line

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+B` | Toggle bold |
| `Cmd/Ctrl+I` | Toggle italic |
| `Cmd/Ctrl+Z` | Undo |
| `Cmd/Ctrl+Shift+Z` | Redo |
| `Cmd/Ctrl+A` | Select all |
| `Enter` | Create new block |
| `Arrow Up/Down` | Navigate between blocks |
| `Shift+Arrow` | Select text |
| `/` | Open slash command menu |
| `Escape` | Close menus/cancel drag |

### Drag & Drop

- **Drag Handle** - Appears on hover at the left edge of blocks
- **Visual Feedback** - Clear drop indicators show where blocks will be placed
- **Cancel** - Press `Escape` to cancel dragging
- **Multi-block Selection** - Select multiple blocks to drag together

### Color Picker

The color picker provides:
- **Text Colors** - 10 predefined text colors
- **Background Colors** - 10 predefined background colors
- **Recently Used** - Global history of recently used colors (persists across sessions)
- **Visual Distinction** - Background colors shown as solid circles, text colors shown with 'A' icon
- **Tooltips** - Hover over any color to see its name
- **Smart Positioning** - Automatically positions above or below based on available space

---

## 🔧 Advanced Usage

### Setting Editor Width

By default, the editor takes 100% of the parent container width. You can customize the width using the `width` prop:

```tsx
// Full width (default)
<PubwaveEditor width="100%" />

// Fixed width
<PubwaveEditor width="1200px" />

// Responsive width
<PubwaveEditor width="90vw" />
<PubwaveEditor width="calc(100% - 40px)" />
```

The `width` prop accepts any valid CSS width value. When set, it will override the default `max-width` constraint.

### Programmatic Content Manipulation

```tsx
const editorRef = useRef<EditorAPI | null>(null);

<PubwaveEditor
  ref={editorRef}
  onReady={(api) => {
    editorRef.current = api;
  }}
/>

// Set content programmatically
editorRef.current?.setContent({
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Hello World' }],
    },
  ],
});

// Get content
const json = editorRef.current?.getJSON();
const html = editorRef.current?.getHTML();
const text = editorRef.current?.getText();

// Apply formatting
editorRef.current?.toggleBold();
editorRef.current?.setLink('https://example.com');
```

### Event Handling

```tsx
<PubwaveEditor
  onChange={(content) => {
    // Content changed
    console.log('New content:', content);
  }}
  onSelectionChange={() => {
    // Selection changed (toolbar may appear/disappear)
  }}
  onFocus={() => {
    // Editor gained focus
  }}
  onBlur={() => {
    // Editor lost focus
  }}
  onReady={(api) => {
    // Editor is ready, API is available
    console.log('Editor ready:', api);
  }}
/>
```

### Read-only Mode

```tsx
<PubwaveEditor
  editable={false}
  content={readOnlyContent}
/>
```

In read-only mode:
- All editing affordances are hidden
- Toolbar does not appear
- Slash commands are disabled
- Drag handles are hidden
- Content is still selectable and copyable

### Custom Slash Commands

You can extend the editor with custom slash commands:

```tsx
import { PubwaveEditor } from '@pubwave/editor';
import type { SlashCommand } from '@pubwave/editor';

const customCommands: SlashCommand[] = [
  {
    id: 'custom-block',
    title: 'Custom Block',
    description: 'Insert a custom block',
    icon: <CustomIcon />,
    aliases: ['custom', 'cb'],
    group: 'basic',
    action: (editor) => {
      // Your custom action
    },
  },
];

// Note: Custom slash commands require access to internal APIs
// This is an advanced feature - see source code for implementation details
```

---

## ⚡ SSR Integration (Next.js)

The library is SSR-safe and can be imported server-side without errors. The editor component itself renders client-side only.

```tsx
'use client';

import { PubwaveEditor } from '@pubwave/editor';
import '@pubwave/editor/style.css';

export default function EditorComponent() {
  return <PubwaveEditor />;
}
```

---


## 🐛 Troubleshooting

### Common Issues

**Q: The editor doesn't render in Next.js SSR**
- Make sure you're using `'use client'` directive
- Ensure the component is marked as a client component

**Q: Styles are not applied**
- Ensure you've imported the CSS: `import '@pubwave/editor/style.css'`
- Check that CSS custom properties are defined

**Q: Slash commands don't work**
- Ensure the editor is in editable mode
- Check that you're typing `/` in a text block (not in code blocks)

**Q: Toolbar doesn't appear**
- Toolbar only appears when text is selected
- Make sure you have a non-empty selection

**Q: Colors don't persist**
- Text and background colors are stored as marks in the content
- Ensure you're saving the full JSON content, not just HTML

**Q: Image upload doesn't work**
- Check that `imageUpload.handler` returns a valid URL string
- Verify file size is within `maxSize` limit
- Check browser console for error messages
- If custom upload fails, editor will automatically fall back to base64

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

---

## 📄 License

MIT © [Pubwave](https://github.com/pubwave)
