# Pubwave Editor - Next.js Example

This example demonstrates SSR-safe integration of Pubwave Editor with Next.js.

## Key Features

- **SSR-Safe**: The editor library can be imported server-side without errors
- **Client-Side Rendering**: The editor component itself renders only on the client
- **App Router**: Uses Next.js 15 App Router pattern
- **TypeScript**: Fully typed

## Running the Example

```bash
# From the repository root
npm install
cd examples/nextjs
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## SSR Integration Pattern

The editor is wrapped in a client component (marked with `'use client'`):

```tsx
'use client';

import { PubwaveEditor } from '@pubwave/editor';

export default function EditorClientComponent() {
  // Client-only editor logic
}
```

This ensures the editor only renders in the browser, while the rest of your Next.js app can use server components and SSR.

## Important Notes

1. **Import Safety**: `@pubwave/editor` can be imported server-side - it doesn't throw on module load
2. **Rendering**: The actual editor view must render client-side (expected for DOM manipulation)
3. **Transpilation**: The `transpilePackages` config ensures the editor works with Next.js
