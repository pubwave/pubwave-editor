/**
 * Layout Column Block Component
 *
 * Renders a single column within a layout.
 * This component wraps the column content in the proper CSS structure.
 */

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

/**
 * LayoutColumnBlock Component
 *
 * Wraps content in a column div with proper CSS classes.
 * The CSS Grid styles on the parent will arrange these columns.
 */
export function LayoutColumnBlock(_props: NodeViewProps) {
  return (
    <NodeViewWrapper
      className="pubwave-layout__column"
      data-type="layoutColumn"
    >
      <NodeViewContent as="div" className="pubwave-layout__column-content" />
    </NodeViewWrapper>
  );
}

export default LayoutColumnBlock;
