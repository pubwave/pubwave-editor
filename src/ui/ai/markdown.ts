/**
 * Markdown → HTML for AI output
 *
 * Wraps `marked` with GFM tables/task-lists and a small post-process step
 * that turns GFM task lists (`<ul><li><input type="checkbox">…</li></ul>`)
 * into the shape Tiptap's TaskList extension parses (`<ul data-type="taskList">`).
 *
 * The HTML produced here is fed straight to Tiptap via
 * `editor.commands.insertContentAt(pos, html)`, which routes each tag through
 * the registered schema. So `<table>` becomes a real table node, `<h2>` a
 * heading, `<ul>` a bullet list, etc. — no manual node mapping required.
 */

import { Marked } from 'marked';

const marked = new Marked({
  gfm: true,
  breaks: false,
});

export function markdownToHTML(input: string): string {
  if (!input) return '';
  let html = marked.parse(input, { async: false });
  if (typeof html !== 'string') html = '';
  return rewriteTaskLists(html);
}

/**
 * Tiptap's TaskList extension expects:
 *   <ul data-type="taskList"><li data-type="taskItem" data-checked="…">…</li></ul>
 *
 * `marked` emits GFM task lists as plain `<ul>` with `<input type="checkbox">`
 * children inside `<li>`. Rewrite that shape so Tiptap picks it up as task
 * items rather than regular bullets.
 */
function rewriteTaskLists(html: string): string {
  // Scan for `<li>` containing a checkbox input as its first child.
  // Wrap parent <ul> with data-type="taskList" and tag the <li>s.
  if (!html.includes('type="checkbox"')) return html;

  return html.replace(
    /<ul>\s*((?:<li>\s*<input\s+[^>]*type="checkbox"[^>]*>[\s\S]*?<\/li>\s*)+)<\/ul>/g,
    (_match, items: string) => {
      const rewrittenItems = items.replace(
        /<li>\s*<input\s+([^>]*?)type="checkbox"([^>]*)>\s*([\s\S]*?)<\/li>/g,
        (_m: string, before: string, after: string, content: string) => {
          const attrs = `${before} ${after}`;
          const checked = /\bchecked\b/.test(attrs);
          return `<li data-type="taskItem" data-checked="${String(checked)}"><p>${content.trim()}</p></li>`;
        }
      );
      return `<ul data-type="taskList">${rewrittenItems}</ul>`;
    }
  );
}
