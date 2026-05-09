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
- 🏷️ **Inline Tags** - Inline tag marks with custom colors, variants, and spacing
- 🔄 **Turn Into** - Convert blocks between different types (paragraph, headings, lists, etc.)
- 📋 **Rich Formatting** - Bold, italic, underline, strikethrough, code, links, and text alignment
- 📝 **Multiple Block Types** - Paragraphs, headings, lists, quotes, code blocks, tables, charts, and more
- 🖼️ **Image Support** - Upload images via file picker or paste from clipboard, with base64 or custom upload service
- 📊 **Chart Support** - Interactive charts powered by Chart.js with editable data
- 🌐 **Internationalization** - Multi-language support with English as default
- 🤖 **AI Composer** - Built-in `/ai` slash command, bubble toolbar ✨ button, and `⌘J` shortcut. BYO model — OpenAI / Anthropic / Gemini / Ollama / OpenRouter / DeepSeek / Moonshot / Zhipu / 千问 / any OpenAI-compatible endpoint

---

## 📦 Installation

### Basic Installation (without Chart support)

```bash
npm install @pubwave/editor
# or
yarn add @pubwave/editor
# or
pnpm add @pubwave/editor
```

### With Chart Support

If you want to use Chart blocks, also install Chart.js:

```bash
npm install @pubwave/editor chart.js
# or
yarn add @pubwave/editor chart.js
# or
pnpm add @pubwave/editor chart.js
```

**Note:** `chart.js` is an optional peer dependency. Only install it if you plan to use Chart block functionality.

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

| React Version | Status                 |
| ------------- | ---------------------- |
| 18.x          | ✅ Tested, Recommended |
| 19.x          | ✅ Supported           |

### Peer Dependencies

- `react`: ^18.0.0 || ^19.0.0 (required)
- `react-dom`: ^18.0.0 || ^19.0.0 (required)
- `chart.js`: ^4.0.0 || ^5.0.0 (optional, required only for Chart block support)

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

| Prop                | Type                             | Default              | Description                                                                                                                                              |
| ------------------- | -------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content`           | `JSONContent`                    | `undefined`          | Initial content in Tiptap JSON format                                                                                                                    |
| `editable`          | `boolean`                        | `true`               | Whether the editor is in read-only mode                                                                                                                  |
| `placeholder`       | `string`                         | `'Start writing...'` | Placeholder text shown when the editor is empty                                                                                                          |
| `theme`             | `EditorTheme`                    | `undefined`          | Theme configuration object (see [Theming](#-theming))                                                                                                    |
| `autofocus`         | `boolean \| 'start' \| 'end'`    | `false`              | Enable autofocus on mount. `true` or `'end'` focuses at the end, `'start'` focuses at the beginning                                                      |
| `imageUpload`       | `ImageUploadConfig`              | `undefined`          | Image upload configuration (see [Image Upload](#-image-upload))                                                                                          |
| `width`             | `string`                         | `'100%'`             | Editor container width. Can be a CSS value like `'100%'`, `'1200px'`, `'90vw'`, etc. Defaults to `'100%'` (full width of parent container)               |
| `height`            | `string`                         | `undefined`          | Editor container height. Can be a CSS value like `'500px'`, `'80vh'`, `'auto'`, etc. When set, the editor becomes a fixed-height scrollable container    |
| `minHeight`         | `string`                         | `undefined`          | Editor container minimum height. Can be a CSS value like `'200px'`, `'50vh'`, etc. The editor will expand with content but maintain at least this height |
| `onChange`          | `(content: JSONContent) => void` | `undefined`          | Callback fired when the editor content changes                                                                                                           |
| `onSelectionChange` | `() => void`                     | `undefined`          | Callback fired when the selection changes                                                                                                                |
| `onFocus`           | `() => void`                     | `undefined`          | Callback fired when the editor gains focus                                                                                                               |
| `onBlur`            | `() => void`                     | `undefined`          | Callback fired when the editor loses focus                                                                                                               |
| `onReady`           | `(api: EditorAPI) => void`       | `undefined`          | Callback fired when the editor is ready with API access                                                                                                  |
| `className`         | `string`                         | `undefined`          | Additional CSS class for the container                                                                                                                   |
| `data-testid`       | `string`                         | `'pubwave-editor'`   | Test ID for testing purposes                                                                                                                             |

For complete TypeScript type definitions, see the exported types from `@pubwave/editor`:

- `EditorTheme` - Theme configuration
- `EditorAPI` - Editor API interface
- `TagProps` - Standalone tag component props
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
/>;

// Later, use the API
editorRef.current?.setContent(newContent);
editorRef.current?.getJSON();
editorRef.current?.toggleBold();
```

#### Available Methods

| Method                  | Description                 | Parameters                    | Returns       |
| ----------------------- | --------------------------- | ----------------------------- | ------------- |
| `getState()`            | Get current editor state    | -                             | `EditorState` |
| `getJSON()`             | Get content as JSON         | -                             | `JSONContent` |
| `getHTML()`             | Get content as HTML         | -                             | `string`      |
| `getText()`             | Get content as plain text   | -                             | `string`      |
| `setContent(content)`   | Set new content             | `content: JSONContent`        | `void`        |
| `clearContent()`        | Clear all content           | -                             | `void`        |
| `setEditable(editable)` | Toggle read-only mode       | `editable: boolean`           | `void`        |
| `focus(position?)`      | Focus the editor            | `position?: 'start' \| 'end'` | `void`        |
| `blur()`                | Blur the editor             | -                             | `void`        |
| `toggleBold()`          | Toggle bold formatting      | -                             | `void`        |
| `toggleItalic()`        | Toggle italic formatting    | -                             | `void`        |
| `setLink(href)`         | Set or remove a link        | `href: string \| null`        | `void`        |
| `destroy()`             | Destroy the editor instance | -                             | `void`        |

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

<PubwaveEditor theme={theme} />;
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

<PubwaveEditor theme={theme} />;
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

### Inline Tags

Pubwave Editor supports inline `tag` marks in content JSON.

Supported attributes:

- `variant`: `'soft' | 'outline' | 'solid'`
- `tone`: `'primary' | 'neutral'`
- `size`: `'sm' | 'md'`
- `backgroundColor`: custom background color
- `textColor`: custom text color
- `borderColor`: custom border color
- `spacing`: trailing spacing such as `'8px'` or `'0.5rem'`

Example content:

```ts
const content = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Live Preview',
          marks: [
            {
              type: 'tag',
              attrs: {
                variant: 'outline',
                backgroundColor: 'rgba(20, 10, 31, 0.38)',
                textColor: '#f5f3ff',
                borderColor: '#5b21b6',
                spacing: '0.75rem',
              },
            },
          ],
        },
      ],
    },
  ],
};
```

You can also use the standalone `Tag` component outside the editor:

```tsx
import { Tag } from '@pubwave/editor';

<Tag
  variant="outline"
  colors={{
    background: 'rgba(20, 10, 31, 0.38)',
    text: '#f5f3ff',
    border: '#5b21b6',
  }}
  spacing="0.75rem"
>
  Live Preview
</Tag>;
```

---

## 🎯 Core Features

### Slash Commands

Type `/` anywhere in the editor to open the command menu. Filter commands by typing keywords.

**Available Commands:**

| Command                 | Aliases                              | Description                |
| ----------------------- | ------------------------------------ | -------------------------- |
| `/text` or `/paragraph` | `/p`, `/text`                        | Plain text block           |
| `/heading1`             | `/h1`, `/title`                      | Large section heading      |
| `/heading2`             | `/h2`, `/subtitle`                   | Medium section heading     |
| `/heading3`             | `/h3`                                | Small section heading      |
| `/bullet`               | `/ul`, `/bullet`, `/-`               | Bulleted list              |
| `/numbered`             | `/ol`, `/numbered`, `/1.`            | Numbered list              |
| `/todo`                 | `/task`, `/checkbox`, `/[]`          | To-do list with checkboxes |
| `/image`                | `/img`, `/picture`, `/photo`, `/pic` | Upload or paste an image   |
| `/quote`                | `/blockquote`, `/>`                  | Quote block                |
| `/code`                 | `/pre`, `/snippet`, `/```            | Code block                 |
| `/divider`              | `/hr`, `/line`, `/---`               | Horizontal divider         |
| `/table`                | `/grid`, `/tbl`                      | Insert a table             |

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
- **Alignment** - Left align, center align, right align (three direct toolbar icons)
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
- **Table** - Table block (rows/columns with header)
- **Image** - Image block (supports base64 or URL)
- **Chart** - Interactive chart powered by Chart.js (bar, line, pie, doughnut, radar, polar area)
- **Blockquote** - Quote block
- **Code Block** - Code snippet with syntax highlighting
- **Horizontal Rule** - Divider line

### Keyboard Shortcuts

| Shortcut           | Action                  |
| ------------------ | ----------------------- |
| `Cmd/Ctrl+B`       | Toggle bold             |
| `Cmd/Ctrl+I`       | Toggle italic           |
| `Cmd/Ctrl+Z`       | Undo                    |
| `Cmd/Ctrl+Shift+Z` | Redo                    |
| `Cmd/Ctrl+A`       | Select all              |
| `Enter`            | Create new block        |
| `Arrow Up/Down`    | Navigate between blocks |
| `Shift+Arrow`      | Select text             |
| `/`                | Open slash command menu |
| `Escape`           | Close menus/cancel drag |

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

### Setting Editor Height

You can control the editor's height using the `height` and `minHeight` props:

```tsx
// Fixed height with scrollable content
<PubwaveEditor height="500px" />

// Minimum height (expands with content)
<PubwaveEditor minHeight="300px" />

// Combined: fixed height with minimum fallback
<PubwaveEditor
  height="600px"
  minHeight="400px"
/>

// Using viewport units
<PubwaveEditor height="80vh" />
```

**Important Notes:**

- The editor has default padding of **96px top and bottom** (192px total). Your `height` value should account for this padding to ensure content is visible.
- For example, `height="100px"` would leave no space for content (100px - 192px padding = negative space).
- **Recommended minimum height:** At least `300px` for desktop to accommodate padding and content.
- When `height` is set, the editor becomes a scrollable container - content will scroll vertically when it exceeds the height.
- When only `minHeight` is set, the editor will grow automatically with content but maintain at least the minimum height.
- Both props accept any valid CSS height value (`px`, `vh`, `rem`, `%`, etc.).

### Programmatic Content Manipulation

```tsx
const editorRef = useRef<EditorAPI | null>(null);

<PubwaveEditor
  ref={editorRef}
  onReady={(api) => {
    editorRef.current = api;
  }}
/>;

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
<PubwaveEditor editable={false} content={readOnlyContent} />
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

## 📊 Chart Support

The editor includes support for interactive charts powered by Chart.js. Charts are fully editable and support multiple chart types.

### Chart Types

Supported chart types:

- **Bar Chart** - Vertical/horizontal bars for comparisons
- **Line Chart** - Data trends over time
- **Pie Chart** - Proportional data representation
- **Doughnut Chart** - Variation of pie chart with hollow center
- **Radar Chart** - Multi-dimensional data comparison
- **Polar Area Chart** - Circular data visualization

### Adding Charts Programmatically

```tsx
import { PubwaveEditor } from '@pubwave/editor';
import type { JSONContent } from '@tiptap/core';

const contentWithChart: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'chart',
      attrs: {
        data: {
          type: 'bar',
          data: {
            labels: ['January', 'February', 'March', 'April'],
            datasets: [
              {
                label: 'Sales',
                data: [65, 59, 80, 81],
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Monthly Sales',
                color: 'var(--pubwave-text, #37352f)',
              },
              legend: {
                display: true,
                position: 'bottom',
              },
            },
          },
        },
      },
    },
  ],
};

<PubwaveEditor content={contentWithChart} />;
```

### Chart Features

- **Interactive Editing** - Click edit button on hover to modify chart data
- **Drag & Drop** - Charts can be reordered like other blocks
- **Theme Support** - Charts use CSS variables for colors that adapt to theme changes
- **Responsive** - Charts automatically adjust to container size
- **Multiple Datasets** - Support for comparing multiple data series
- **Customizable** - Edit title, labels, colors, and chart options

### Chart Data Structure

The chart node uses the following data structure:

```typescript
interface ChartNodeData {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  data: {
    labels: string[];
    datasets: Array<{
      label?: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
    }>;
  };
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      title?: {
        display?: boolean;
        text?: string;
        color?: string;
        font?: { size?: number; weight?: string };
      };
      legend?: {
        display?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
      };
    };
  };
}
```

### Chart Editing

When in editable mode:

1. Hover over a chart to reveal the edit button
2. Click the edit button to open the chart editor modal
3. Modify chart type, title, labels, datasets, and appearance options
4. Save changes to update the chart

---

## 🤖 AI

Pubwave ships built-in AI integration: the **AIBar** — a compact floating bar — drives the flow, while the model's output streams **directly into the editor as real Tiptap nodes** (heading, list, table, code block, …) marked as "pending" until you Apply or Discard.

You bring the model — any OpenAI-compatible endpoint, Anthropic, Gemini, or Ollama works out of the box; you can also drop in any custom adapter.

### Entry points (all open the same bar)

| Trigger | When |
|---|---|
| Type `/ai` | Anywhere in the editor |
| Click the ✨ button in the bubble toolbar | Text is selected |
| Press `⌘J` / `Ctrl+J` | Always |

### What it does

- **Streams into the editor**, not into a popover. AI's output appears in place — heading becomes a real heading, list becomes a real list, table becomes a real table — with a faded "pending" highlight while it's still in review.
- **Two implicit modes** based on what's selected when you open the bar:
  - **Selection present** → *transform* mode: the pending output replaces the selection
  - **No selection** → *generate* mode: the pending output flows in **at the cursor** (no extra blank line above)
- **Compact floating bar** carries only the controls — prompt input + Send/Stop and Apply / Discard / Try again. No context dropdowns or preset menus.
- **Conversational refinement**: after a reply, type "shorter" or "make it more formal" and Send — the previous output is dropped and the new one streams into the same spot, with the prior turns kept as conversation history.
- **Output language follows `theme.locale`** — Chinese editor → AI replies in Chinese, etc.
- **Markdown understood**: the model is asked to use standard Markdown for structured content (headings, lists, tables, code, quotes, links, marks). Pubwave parses it via Tiptap's HTML pipeline, so what lands in the doc is real schema-typed nodes.
- **Lossless Discard**: in transform mode the original selection is snapshotted as a ProseMirror `Slice` before the pending output replaces it. Discard restores the exact original — text, marks, links, custom attributes — as if AI had never touched it.

> ⚠️ **Phase 1 limitation**: custom blocks specific to Pubwave (`chart`, `layout`, colored `tag`) cannot be expressed in Markdown and so cannot be produced by AI in this release. The model will fall back to a Markdown table or paragraph. A later release will add tool calling for those.

### Keyboard shortcuts inside the bar

| Key | Action |
|---|---|
| `Enter` | Send the prompt to AI |
| `Shift + Enter` | Insert a newline in the input (multi-line prompts) |
| `Esc` | Close the bar; in transform mode this also restores the original selection |

The textarea starts as a single line and auto-grows as you type, capped at ~160px tall with internal scrolling beyond that.

### Apply / Discard / Try again

| Action | Generate mode (no selection) | Transform mode (with selection) |
|---|---|---|
| **Apply** (or click ✓) | Strips the pending decoration, content stays where streamed | Same — AI output stays in place of the original selection |
| **Discard** (or `Esc`) | Deletes the AI-streamed content | Deletes the AI output **and restores the original selection lossless** |
| **Try again** | Re-runs the same prompt; streams a fresh take into the same spot | Same — original selection stays preserved as snapshot until you Apply or Discard |

While streaming, the **Stop** button on the input row aborts the request — already-arrived content stays as pending so you can Apply, Discard, or refine it.

### Quick start

```tsx
import { PubwaveEditor, createAdapter } from '@pubwave/editor';
import type { AIConfig } from '@pubwave/editor';
import '@pubwave/editor/style.css';

const aiConfig: AIConfig = {
  adapter: createAdapter({
    provider: 'openai',
    baseURL: '/api/ai/openai',  // your server proxy (see below)
  }),
  defaultModel: 'gpt-4o-mini',
};

<PubwaveEditor ai={aiConfig} />
```

To turn AI off, just don't pass `ai` (or pass `undefined`). No surface appears.

### Provider switch — `createAdapter`

```ts
createAdapter({ provider: 'openai',    baseURL, apiKey, model })
createAdapter({ provider: 'anthropic', apiKey, model, anthropicVersion })
createAdapter({ provider: 'gemini',    apiKey, model })
createAdapter({ provider: 'ollama',    baseURL, model })
```

The `'openai'` provider covers OpenAI itself **plus any OpenAI-compatible endpoint** — Azure, Groq, Together, OpenRouter, DeepSeek, Moonshot, Zhipu GLM, Qwen DashScope (compat-mode), Volcengine Doubao, vLLM, LM Studio, your own proxy. Just override `baseURL`.

For something the union doesn't cover, use `defineAIAdapter({ id, stream })` and supply your own streaming function.

### Two deployment modes

#### A. Direct (browser → provider). Demo / local Ollama only.

```ts
adapter: createAdapter({
  provider: 'openai',
  apiKey: 'sk-...',  // ⚠️ ends up in JS bundle, anyone can DevTools it
}),
```

Fine for local Ollama (no key needed):
```ts
adapter: createAdapter({
  provider: 'openai',
  baseURL: 'http://localhost:11434/v1',
}),
defaultModel: 'llama3.2',
```

#### B. Server proxy (recommended for cloud providers in production).

The library ships a framework-agnostic proxy handler at `@pubwave/editor/server`. Use it from any Web-standard runtime (Next.js / Hono / Cloudflare Workers / Bun / Deno):

**Next.js** — one 3-line file covers all providers:

```ts
// app/api/ai/[...path]/route.ts
import { createAIProxyHandler } from '@pubwave/editor/server';
export const POST = createAIProxyHandler();
export const runtime = 'edge';
```

**Hono / Bun / Deno / Cloudflare Workers**:

```ts
import { createAIProxyHandler } from '@pubwave/editor/server';
const handler = createAIProxyHandler();

// Hono
app.post('/api/ai/*', (c) => handler(c.req.raw));

// Cloudflare Worker
export default {
  fetch: (req, env) => createAIProxyHandler({
    openai:    { apiKey: env.OPENAI_API_KEY },
    anthropic: { apiKey: env.ANTHROPIC_API_KEY },
    gemini:    { apiKey: env.GOOGLE_API_KEY },
  })(req),
};
```

Path routing (default prefix `/api/ai`):

| Client `baseURL` | Forwards to | Reads env |
|---|---|---|
| `/api/ai/openai` | `${OPENAI_BASE_URL}` (default: `https://api.openai.com/v1`) | `OPENAI_API_KEY`, `OPENAI_BASE_URL` |
| `/api/ai/anthropic` | `${ANTHROPIC_BASE_URL}` (default: Anthropic) | `ANTHROPIC_API_KEY`, `ANTHROPIC_BASE_URL`, `ANTHROPIC_VERSION` |
| `/api/ai/gemini` | `${GOOGLE_BASE_URL}` (default: Gemini) | `GOOGLE_API_KEY`, `GOOGLE_BASE_URL` |

Streaming (SSE) is piped through end-to-end without buffering.

### Configuring providers via env

Two env vars are needed for any **non-OpenAI** provider that uses the OpenAI protocol (OpenRouter, DeepSeek, Moonshot, Zhipu, 千问, Groq, etc.) — both `OPENAI_API_KEY` AND `OPENAI_BASE_URL`:

```bash
# .env (or .env.local, or system env on your platform)

# --- OpenRouter (covers OpenAI / Claude / Gemini / Llama / DeepSeek with one key) ---
OPENAI_API_KEY=sk-or-v1-...
OPENAI_BASE_URL=https://openrouter.ai/api/v1

# --- OR DeepSeek ---
# OPENAI_API_KEY=sk-...
# OPENAI_BASE_URL=https://api.deepseek.com/v1

# --- OR Zhipu GLM ---
# OPENAI_API_KEY=...
# OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4

# --- OR Qwen DashScope (must use compat-mode path) ---
# OPENAI_API_KEY=sk-...
# OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# --- Anthropic Claude (native) — only the key is required ---
# ANTHROPIC_API_KEY=sk-ant-...

# --- Google Gemini (native) — only the key is required ---
# GOOGLE_API_KEY=AIza...
```

For a fully-annotated reference of every provider's URL + model ids, see [`examples/nextjs/.env.example`](./examples/nextjs/.env.example).

> **Common pitfall**: setting only `OPENAI_API_KEY` (no URL) with a non-OpenAI key. The proxy will dutifully send your OpenRouter / DeepSeek / Zhipu key to OpenAI's default endpoint, which returns `401 invalid_api_key`. Always set both.

### Selecting the active provider in the client

Switch `baseURL` on the client adapter to choose which proxy path (and therefore which env vars) take effect:

```ts
createAdapter({ provider: 'openai',    baseURL: '/api/ai/openai' })     // → OPENAI_*
createAdapter({ provider: 'anthropic', baseURL: '/api/ai/anthropic' })  // → ANTHROPIC_*
createAdapter({ provider: 'gemini',    baseURL: '/api/ai/gemini' })     // → GOOGLE_*
```

### Vite / SPA users

Vite has no server runtime. Three options:

1. **Local Ollama** — direct from browser, no key needed.
2. **`VITE_OPENAI_API_KEY` in browser** — demo only, key visible to anyone.
3. **Separate backend** — Cloudflare Worker / Hono / Express running `createAIProxyHandler`. Vite app points at its URL.

See [Examples](./examples) for runnable code.

### Disabling specific surfaces

```ts
ai={{
  adapter,
  defaultModel: '...',
  enableInSlashMenu: false,    // hide /ai
  enableInToolbar: false,      // hide ✨ in bubble toolbar
  enableKeyboardShortcut: false, // disable ⌘J
}}
```

### Customizing strings (i18n)

The bar's labels (placeholder, button text, shortcut hint) are pulled from the active `theme.locale` and fall back to English when missing. To override per-instance, you can build your own bar and pass `strings` directly using the exported `<AIBar>` component, or — for most cases — just edit `ai.*` keys in your locale JSON. The relevant fields:

```jsonc
{
  "ai": {
    "askButton": "Ask AI",
    "promptPlaceholder": "Tell AI what to do…",
    "refinePlaceholder": "Tell AI what else needs to be changed…",
    "shortcutHint": "↵ Send · ⇧↵ Newline · Esc Discard",
    "buttons": {
      "send": "Send", "stop": "Stop",
      "apply": "Apply", "discard": "Discard", "retry": "Try again"
    },
    "errors": { "generic": "AI request failed" },
    "slashCommand": {
      "title": "Ask AI",
      "description": "Generate, transform, or refine with AI"
    }
  }
}
```

### Advanced: building your own UI

If the bundled bar doesn't fit, the lib also exports the lower-level pieces so you can wire your own:

| Export | What it is |
|---|---|
| `AIBar` | The default bar component |
| `runAI` | Async-iterable streaming helper around an `AIAdapter` |
| `createAIPreviewPlugin` / `aiPreviewPluginKey` / `getAIPreviewRange` | ProseMirror plugin that tracks the pending range and renders the faded decoration |
| `markdownToHTML` | The `marked` wrapper used internally (handles GFM tables + task lists) |
| `fallbackBarStrings` | Default English strings you can spread into your `strings` prop |
| `createAIProxyHandler` (from `@pubwave/editor/server`) | Server-side proxy for the OpenAI / Anthropic / Gemini protocols |

### Security checklist

- ❌ **Never** put a cloud API key (OpenAI / Anthropic / Gemini / OpenRouter / etc.) in client-side code that ships to public users. Even `VITE_*` / `NEXT_PUBLIC_*` prefixes mean "this WILL be visible in the bundle."
- ✅ Use the server proxy (`createAIProxyHandler`) and let env vars stay on the server.
- ✅ For paid providers, add rate-limiting / auth / quotas on your proxy. The bundled handler is intentionally minimal — wrap it.
- ✅ Local Ollama and other no-auth local servers are fine to call directly from the browser.

---

## 🐛 Troubleshooting

### Common Issues

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

**Q: Charts don't render**

- Ensure `chart.js` is installed: `npm install chart.js` (optional peer dependency)
- Check that Chart.js is compatible (v4.x or v5.x)
- Verify chart data structure is correct
- Check browser console for errors

**Q: Chart colors don't match theme**

- Charts use CSS variables for colors that adapt to theme changes
- Ensure CSS custom properties are defined: `--pubwave-text`, `--pubwave-text-muted`, `--pubwave-border`
- Chart colors will automatically update when theme changes

---

## 📄 License

MIT © [Pubwave](https://github.com/pubwave)
