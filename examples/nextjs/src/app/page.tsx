import EditorClientComponent from '@/components/EditorClientComponent';

export default function Home() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Pubwave Editor - Next.js Example</h1>
        <p>A Notion-level block editor with SSR-safe integration</p>
      </header>

      <main className="editor-container">
        <EditorClientComponent />
      </main>

      <footer className="app-footer">
        <p>
          This example demonstrates SSR-safe integration of Pubwave Editor with Next.js.
        </p>
        <p>
          The editor is rendered client-side only, while the rest of the page can be server-rendered.
        </p>
      </footer>
    </div>
  );
}
