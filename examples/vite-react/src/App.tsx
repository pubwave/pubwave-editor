import { PubwaveEditor } from '../../../src/ui/PubwaveEditor';
import '../../../src/index.css';

// Initial content for the editor - Notion-like welcome
const initialContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Welcome to Notion-like template ✨' }],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '💌 ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'Invite your colleagues to make this fun!' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Just copy the URL from your browser and share it — everyone with the link can join in and collaborate in real time.' },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Start writing your thoughts here ... ✏️' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Try some ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'Markdown' },
        { type: 'text', text: ':' },
      ],
    },
    {
      type: 'codeBlock',
      content: [
        { type: 'text', text: '# Headings\n- Lists\n> Quotes\n`Inline code`' },
      ],
    },
  ],
};

function App() {
  return (
    <div className="app-container">
      <main className="editor-container">
        <PubwaveEditor
          content={initialContent}
          placeholder="Write, type '/' for commands..."
          onChange={(newContent) => {
            console.log('Content changed:', newContent);
          }}
          theme={{
            containerClassName: 'editor-wrapper',
            contentClassName: 'editor-content',
          }}
        />
      </main>
    </div>
  );
}

export default App;
