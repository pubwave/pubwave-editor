import EditorClientComponent from '@/components/EditorClientComponent';

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
          <a
            href="https://github.com/pubwave/pubwave-editor"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              color: 'var(--color-text)',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-hover)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-background)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            aria-label="View on GitHub"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
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

