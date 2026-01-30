/**
 * Editor behavior plugin
 *
 * - Click below the last block creates an empty paragraph
 * - Double Enter in a layout column exits the layout
 */

import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';

const editorBehaviorsKey = new PluginKey('editorBehaviors');

function isClickBelowLastBlock(view: EditorView, event: MouseEvent): boolean {
  const editor = view.dom;
  const editorRect = editor.getBoundingClientRect();

  // Only handle clicks inside editor bounds
  if (
    event.clientX < editorRect.left ||
    event.clientX > editorRect.right ||
    event.clientY < editorRect.top ||
    event.clientY > editorRect.bottom
  ) {
    return false;
  }

  const lastChild = editor.lastElementChild as HTMLElement | null;
  if (!lastChild) {
    return true;
  }

  const lastRect = lastChild.getBoundingClientRect();
  return event.clientY > lastRect.bottom + 1;
}

function handleClickCreateTrailingParagraph(
  view: EditorView,
  event: MouseEvent
): boolean {
  if (event.button !== 0 || event.defaultPrevented) {
    return false;
  }

  if (!isClickBelowLastBlock(view, event)) {
    return false;
  }

  const { state } = view;
  const paragraphType = state.schema.nodes.paragraph;
  if (!paragraphType) {
    return false;
  }

  const endPos = state.doc.content.size;
  const lastNode = state.doc.lastChild;
  const tr = state.tr;

  if (
    lastNode &&
    lastNode.type === paragraphType &&
    lastNode.content.size === 0
  ) {
    tr.setSelection(TextSelection.create(state.doc, Math.max(1, endPos - 1)));
    view.dispatch(tr);
    view.focus();
    return true;
  }

  tr.insert(endPos, paragraphType.create());
  tr.setSelection(TextSelection.create(tr.doc, endPos + 1));
  view.dispatch(tr.scrollIntoView());
  view.focus();
  return true;
}

function handleDoubleEnterExitLayout(view: EditorView, event: KeyboardEvent): boolean {
  if (event.key !== 'Enter' || event.defaultPrevented) {
    return false;
  }

  const { state } = view;
  const { selection } = state;
  if (!selection.empty) {
    return false;
  }

  const { $from } = selection;
  const paragraphType = state.schema.nodes.paragraph;
  if (!paragraphType || $from.parent.type !== paragraphType) {
    return false;
  }

  if ($from.parent.content.size !== 0) {
    return false;
  }

  let layoutColumnDepth = -1;
  let layoutDepth = -1;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === 'layoutColumn' && layoutColumnDepth === -1) {
      layoutColumnDepth = d;
    }
    if (node.type.name === 'layout' && layoutDepth === -1) {
      layoutDepth = d;
    }
  }

  if (layoutColumnDepth === -1 || layoutDepth === -1) {
    return false;
  }

  const columnNode = $from.node(layoutColumnDepth);
  const indexInColumn = $from.index(layoutColumnDepth);
  if (indexInColumn !== columnNode.childCount - 1) {
    return false;
  }

  event.preventDefault();

  const tr = state.tr;
  const paragraphPos = $from.before($from.depth);
  const paragraphSize = $from.parent.nodeSize;

  if (columnNode.childCount > 1) {
    tr.delete(paragraphPos, paragraphPos + paragraphSize);
  }

  const layoutPos = $from.before(layoutDepth);
  const mappedLayoutPos = tr.mapping.map(layoutPos);
  const layoutNode = tr.doc.nodeAt(mappedLayoutPos);
  if (!layoutNode) {
    return false;
  }

  const insertPos = mappedLayoutPos + layoutNode.nodeSize;
  tr.insert(insertPos, paragraphType.create());
  tr.setSelection(TextSelection.create(tr.doc, insertPos + 1));

  view.dispatch(tr.scrollIntoView());
  view.focus();
  return true;
}

export function createEditorBehaviorsPlugin(): Plugin {
  return new Plugin({
    key: editorBehaviorsKey,
    props: {
      handleClick(view, _pos, event) {
        if (!(event instanceof MouseEvent)) {
          return false;
        }
        return handleClickCreateTrailingParagraph(view, event);
      },
      handleKeyDown(view, event) {
        return handleDoubleEnterExitLayout(view, event);
      },
    },
  });
}
