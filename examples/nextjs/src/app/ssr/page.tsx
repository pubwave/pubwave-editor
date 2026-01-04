import EditorClientComponent from '@/components/EditorClientComponent';
import GitHubIcon from '@/components/GitHubIcon';

/**
 * Server-Side Rendered Example (SSR)
 * 
 * This page demonstrates server-side rendering with the editor.
 * The page itself is server-rendered, but the editor component
 * is client-side only (marked with 'use client').
 * 
 * This approach allows:
 * - Fast initial page load with server-rendered content
 * - SEO-friendly HTML structure
 * - Progressive enhancement with client-side editor
 */
export default function SSRExample() {
  // This content is server-rendered
  const serverRenderedContent = {
    title: 'Server-Side Rendered Example',
    description: 'This page is server-rendered, while the editor hydrates on the client.',
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ position: 'relative', width: '100%' }}>
          <GitHubIcon />
        </div>
        <h1>{serverRenderedContent.title}</h1>
        <p>{serverRenderedContent.description}</p>
      </header>

      {/* Server-rendered content */}
      <section className="info-section">
        <h2>How This Works</h2>
        <ul>
          <li>The page HTML is generated on the server</li>
          <li>The editor component hydrates on the client</li>
          <li>Initial content can be passed from the server</li>
          <li>Perfect for SEO and fast initial page loads</li>
        </ul>
      </section>

      <main className="editor-container">
        <EditorClientComponent showThemeSwitcher={true} initialTheme="dark" />
      </main>

      <footer className="app-footer">
        <p>
          This example demonstrates <strong>server-side rendering</strong> with Pubwave Editor.
        </p>
        <p>
          The page structure is server-rendered, while the editor hydrates on the client.
        </p>
        <nav className="example-nav">
          <a href="/">← View Client-Side Example</a>
        </nav>
      </footer>
    </div>
  );
}

