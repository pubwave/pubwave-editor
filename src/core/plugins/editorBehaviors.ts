/**
 * Editor behavior plugin
 *
 * - Click below the last block creates an empty paragraph
 * - Double Enter in a layout column exits the layout
 */

import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { liftListItem } from '@tiptap/pm/schema-list';
import type { EditorView } from '@tiptap/pm/view';
import type { Node as ProseMirrorNode, NodeType } from '@tiptap/pm/model';

const editorBehaviorsKey = new PluginKey('editorBehaviors');

function isEmptyParagraph(node: ProseMirrorNode, paragraphType: NodeType): boolean {
  return node.type === paragraphType && node.content.size === 0;
}

function isLayoutCompletelyEmpty(
  layoutNode: ProseMirrorNode,
  paragraphType: NodeType
): boolean {
  return layoutNode.content.content.every((column) => {
    if (column.type.name !== 'layoutColumn') {
      return false;
    }
    if (column.childCount !== 1) {
      return false;
    }
    return isEmptyParagraph(column.child(0), paragraphType);
  });
}

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

  if (columnNode.childCount < 2) {
    return false;
  }

  const lastChild = columnNode.child(columnNode.childCount - 1);
  const prevChild = columnNode.child(columnNode.childCount - 2);
  if (
    !isEmptyParagraph(lastChild, paragraphType) ||
    !isEmptyParagraph(prevChild, paragraphType)
  ) {
    return false;
  }

  event.preventDefault();

  const tr = state.tr;
  const paragraphPos = $from.before($from.depth);
  const paragraphSize = $from.parent.nodeSize;
  const layoutPos = $from.before(layoutDepth);
  const layoutNode = $from.node(layoutDepth);
  let removedLayout = false;

  if (columnNode.childCount > 1) {
    tr.delete(paragraphPos, paragraphPos + paragraphSize);
  } else if (layoutNode && isLayoutCompletelyEmpty(layoutNode, paragraphType)) {
    tr.delete(layoutPos, layoutPos + layoutNode.nodeSize);
    removedLayout = true;
  }

  const mappedLayoutPos = tr.mapping.map(layoutPos);
  let insertPos = mappedLayoutPos;
  if (!removedLayout) {
    const currentLayoutNode = tr.doc.nodeAt(mappedLayoutPos);
    if (!currentLayoutNode) {
      return false;
    }
    insertPos = mappedLayoutPos + currentLayoutNode.nodeSize;
  }
  tr.insert(insertPos, paragraphType.create());
  tr.setSelection(TextSelection.create(tr.doc, insertPos + 1));

  view.dispatch(tr.scrollIntoView());
  view.focus();
  return true;
}

function handleEnterEmptyListInLayout(view: EditorView, event: KeyboardEvent): boolean {
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
  let listItemType: NodeType | null = null;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === 'layoutColumn' && layoutColumnDepth === -1) {
      layoutColumnDepth = d;
    }
    if (
      (node.type.name === 'listItem' || node.type.name === 'taskItem') &&
      listItemType === null
    ) {
      listItemType = node.type;
    }
  }

  if (layoutColumnDepth === -1 || !listItemType) {
    return false;
  }

  event.preventDefault();
  return liftListItem(listItemType)(state, view.dispatch);
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
        if (handleEnterEmptyListInLayout(view, event)) {
          return true;
        }
        return handleDoubleEnterExitLayout(view, event);
      },
    },
  });
}
