# Next.js Example

This example demonstrates how to integrate Pubwave Editor in a Next.js application, including both client-side and server-side rendering approaches.

## 🚀 Quick Start

```bash
## Install dependencies
npm install

# Start development server
npm run dev
```

Then open in your browser:
- **Client-side example**: http://localhost:3000
- **SSR example**: http://localhost:3000/ssr

## 📄 Example Overview

### 1. Client-Side Rendering Example (`/`)

**File location**: `src/app/page.tsx`

This is the simplest integration approach where the editor is fully rendered on the client side.

**Use cases:**
- No SEO optimization needed
- Editor content is user-private
- Fast development setup

**Features:**
- ✅ Simple setup
- ✅ Great development experience
- ✅ All editor features supported
- ✅ Theme switcher included

### 2. Server-Side Rendered Example (`/ssr`)

**File location**: `src/app/ssr/page.tsx`

This example demonstrates SSR usage in Next.js, where the page structure is server-rendered and the editor hydrates on the client.

**Use cases:**
- SEO optimization needed
- Faster initial page load
- Page structure needs server rendering

**Features:**
- ✅ SEO friendly
- ✅ Fast initial load
- ✅ Progressive enhancement
- ✅ All editor features supported

## 💻 Usage

### Basic Integration

```tsx
'use client';

import { PubwaveEditor } from '@pubwave/editor';
import '@pubwave/editor/style.css';
import { useState } from 'react';

export default function Page() {
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

### Using Reusable Component

The example provides a reusable editor component `EditorClientComponent`:

```tsx
import EditorClientComponent from '@/components/EditorClientComponent';

export default function Page() {
  return (
    <div>
      <h1>My Editor</h1>
      <EditorClientComponent
        showThemeSwitcher={true}
        initialTheme="dark"
      />
    </div>
  );
}
```

**Component Props:**
- `showThemeSwitcher?: boolean` - Show/hide theme switcher (default: `true`)
- `initialTheme?: string` - Initial theme name (default: `'violet'`)

## 🖼️ Image Upload Configuration

### Base64 Mode (Default)

```tsx
<PubwaveEditor
  content={content}
  onChange={setContent}
/>
```

### Custom Upload Service

```tsx
<PubwaveEditor
  content={content}
  onChange={setContent}
  imageUpload={{
    handler: async (file: File) => {
      // Upload to your server
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      return data.url;
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  }}
/>
```

## 🎨 Theme Configuration

The example includes 5 predefined themes:

- **Light** - Light theme
- **Dark** - Dark theme
- **Violet** - Purple gradient
- **Rose** - Rose gradient
- **Sky** - Sky blue gradient

You can also create custom themes:

```tsx
<PubwaveEditor
  theme={{
    locale: 'en', // Optional: Set locale for internationalization (default: 'en')
    colors: {
      background: '#ffffff',
      text: '#1f2937',
      textMuted: '#6b7280',
      border: '#e5e7eb',
      primary: '#3b82f6',
    },
  }}
/>
```

**Note:** The editor supports multiple locales through the `locale` option in the theme. Currently, only English (`'en'`) is fully implemented. See the [main documentation](../../README.md#internationalization-i18n) for more details.

## 🔧 Customizing the Component

You can modify `EditorClientComponent.tsx` to:

- Add custom event handlers
- Integrate with your backend API
- Add custom features
- Modify theme configuration

## 📦 Building for Production

```bash
npm run build
npm start
```

## 📚 More Information

- [Next.js Documentation](https://nextjs.org/docs)
- [Pubwave Editor Complete Documentation](../../README.md)
