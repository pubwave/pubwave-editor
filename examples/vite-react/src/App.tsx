import { PubwaveEditor } from '../../../src/ui/PubwaveEditor';
import '../../../src/index.css';

// Initial content for the editor - Comprehensive showcase
const initialContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Welcome to Pubwave Editor 🚀' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'A premium, ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'Notion-style' },
        { type: 'text', text: ' block editor designed for ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'focus' },
        { type: 'text', text: ' and ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'clarity' },
        { type: 'text', text: '. Every element is a block that you can ' },
        { type: 'text', marks: [{ type: 'underline' }], text: 'drag' },
        { type: 'text', text: ', ' },
        { type: 'text', marks: [{ type: 'underline' }], text: 'drop' },
        { type: 'text', text: ', and reorder with ease.' },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: '💡 Pro Tip:' },
            { type: 'text', text: ' Hover over any block to see the drag handle. You can even drag items into or out of this quote block!' },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Text Formatting Examples' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Bold text' },
        { type: 'text', text: ' • ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'Italic text' },
        { type: 'text', text: ' • ' },
        { type: 'text', marks: [{ type: 'underline' }], text: 'Underlined text' },
        { type: 'text', text: ' • ' },
        { type: 'text', marks: [{ type: 'strike' }], text: 'Strikethrough text' },
        { type: 'text', text: ' • ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'inline code' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'You can also combine formats: ' },
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'bold and italic' },
        { type: 'text', text: ', ' },
        { type: 'text', marks: [{ type: 'bold' }, { type: 'underline' }], text: 'bold and underlined' },
        { type: 'text', text: ', or even ' },
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'underline' }], text: 'all three together' },
        { type: 'text', text: '!' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Links work too: ' },
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: 'https://github.com/pubwave/pubwave-editor', target: '_blank' } }],
          text: 'Visit our GitHub repository',
        },
        { type: 'text', text: ' to learn more.' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Headings' }],
    },
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Heading 1 - Main Title' }],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Heading 2 - Section Title' }],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Heading 3 - Subsection' }],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Lists' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Unordered list:' }],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Block-based editing' },
                { type: 'text', text: ': Every element is a draggable block' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Rich text formatting' },
                { type: 'text', text: ': Bold, italic, underline, strikethrough, code, and links' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Slash commands' },
                { type: 'text', text: ': Type ' },
                { type: 'text', marks: [{ type: 'code' }], text: '/' },
                { type: 'text', text: ' to quickly insert new blocks' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Task lists' },
                { type: 'text', text: ': Beautiful checkboxes for staying organized' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Ordered list:' }],
    },
    {
      type: 'orderedList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'First, install the package' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Then, import the editor component' }],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Finally, start building amazing content!' }],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Task Lists' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Stay organized with beautiful task lists:' }],
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Explore all editor features' }],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'strike' }], text: 'Try dragging tasks to reorder them' },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Experiment with different block types' }],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Star the repository on GitHub ⭐' }],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Share your feedback and suggestions' }],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Code Blocks' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Perfect for sharing code snippets:' }],
    },
    {
      type: 'codeBlock',
      content: [
        {
          type: 'text',
          text: 'import { PubwaveEditor } from "@pubwave/editor";\n\nfunction App() {\n  return (\n    <PubwaveEditor\n      placeholder="Start writing..."\n      onChange={(content) => console.log(content)}\n    />\n  );\n}',
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Blockquotes' }],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Design is not just what it looks like and feels like.' },
            { type: 'text', text: ' Design is how it works.' },
          ],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', marks: [{ type: 'italic' }], text: '— Steve Jobs' }],
        },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'You can nest different block types inside quotes, like ' },
            { type: 'text', marks: [{ type: 'code' }], text: 'code' },
            { type: 'text', text: ' or ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'bold text' },
            { type: 'text', text: '.' },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Dividers' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Use dividers to separate sections:' }],
    },
    {
      type: 'horizontalRule',
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Interactive Features' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Try these interactive features:' },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Drag & Drop' },
                { type: 'text', text: ': Hover over any block and use the handle to reorder' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Slash Menu' },
                { type: 'text', text: ': Type ' },
                { type: 'text', marks: [{ type: 'code' }], text: '/' },
                { type: 'text', text: ' to see all available block types' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Bubble Toolbar' },
                { type: 'text', text: ': Select text to format it with the floating toolbar' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Keyboard Shortcuts' },
                { type: 'text', text: ': Use ' },
                { type: 'text', marks: [{ type: 'code' }], text: 'Ctrl/Cmd + B' },
                { type: 'text', text: ' for bold, ' },
                { type: 'text', marks: [{ type: 'code' }], text: 'Ctrl/Cmd + I' },
                { type: 'text', text: ' for italic, and more' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'horizontalRule',
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Get Started' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Ready to start creating? Just click anywhere and start typing, or use ' },
        { type: 'text', marks: [{ type: 'code' }], text: '/' },
        { type: 'text', text: ' to insert a new block. ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'Happy writing! ✍️' },
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
