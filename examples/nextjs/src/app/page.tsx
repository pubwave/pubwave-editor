'use client';

import EditorClientComponent from '@/components/EditorClientComponent';
import GitHubIcon from '@/components/GitHubIcon';

/**
 * Client-Side Rendered Example (Non-SSR)
 * 
 * This page demonstrates client-side rendering of the editor.
 * The editor component is marked with 'use client' and will only
 * render on the client side, making it safe for Next.js SSR.
 */
export default function Home() {
  return (
    <div className="app-container" style={{ position: 'relative' }}>
      <GitHubIcon />
      <header className="app-header">
        <h1>Pubwave Editor - Next.js Example</h1>
        <p>A Notion-level block editor with SSR-safe integration</p>
      </header>

      <main className="editor-container">
        <EditorClientComponent showThemeSwitcher={true} initialTheme="violet" />
      </main>

      <footer className="app-footer">
        <p>
          This example demonstrates <strong>client-side rendering</strong> of Pubwave Editor with Next.js.
        </p>
        <p>
          The editor is rendered client-side only, while the rest of the page can be server-rendered.
        </p>
        <nav className="example-nav">
          <a href="/ssr">View SSR Example →</a>
        </nav>
      </footer>
    </div>
  );
}
