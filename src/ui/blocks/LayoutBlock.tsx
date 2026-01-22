/**
 * Layout Block Component
 *
 * Renders a multi-column layout block in the editor.
 *
 * Implementation note:
 * - Layout uses a simple React component with NodeViewContent
 * - LayoutColumn nodes have their own node view that handles content rendering
 * - This ensures each column renders its content correctly
 */

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

/**
 * LayoutBlock Component - Container for layout columns
 *
 * Simple wrapper that renders the grid container and lets ProseMirror
 * render the layoutColumn children into it.
 */
export function LayoutBlock(props: NodeViewProps) {
  const { node, selected } = props;
  const columns = node.attrs.columns as number; // 2 or 3

  return (
    <NodeViewWrapper
      className={`pubwave-editor__layout pubwave-layout--${columns}-cols`}
      data-selected={selected}
      data-type="layout"
      data-layout-columns={String(columns)}
    >
      <NodeViewContent as="div" className="pubwave-layout__columns-wrapper" />
    </NodeViewWrapper>
  );
}

export default LayoutBlock;
