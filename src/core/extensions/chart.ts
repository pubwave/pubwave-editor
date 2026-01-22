/**
 * Chart Extension
 *
 * A TipTap extension that adds Chart.js chart support as block nodes.
 * Charts are first-class block elements that can be dragged and edited.
 *
 * Constitution 4.1.1: Block Node Types
 * - Chart is a block-level node with atom: true (treated as a single unit)
 * - Charts are draggable via the DnD plugin
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ChartBlock } from '../../ui/blocks/ChartBlock';
import type { ChartNodeData } from '../../ui/blocks/chartTypes';

/**
 * Chart Extension for TipTap
 *
 * Defines the schema for chart nodes and provides the React component renderer.
 */
export const Chart = Node.create({
  name: 'chart',

  /**
   * Priority determines the order of extension execution
   */
  priority: 1000,

  /**
   * Charts are block-level nodes
   * atom: true means the node is treated as a single unit (content is not editable inline)
   * draggable: true allows the node to be dragged by the DnD plugin
   */
  group: 'block',
  atom: true,
  draggable: true,

  /**
   * Add attributes to the chart node
   * These are stored in the ProseMirror document
   */
  addAttributes() {
    return {
      // The chart data structure (type, data, options)
      data: {
        default: null,
        parseHTML: (element) => {
          const dataAttr = element.getAttribute('data-chart-data');
          if (dataAttr) {
            try {
              return JSON.parse(dataAttr) as ChartNodeData;
            } catch {
              return null;
            }
          }
          return null;
        },
        renderHTML: (attributes) => {
          if (!attributes.data) {
            return {};
          }
          return {
            'data-chart-data': JSON.stringify(attributes.data),
          };
        },
      },
    };
  },

  /**
   * Parse HTML to create chart nodes
   * This allows charts to be pasted from external sources
   */
  parseHTML() {
    return [
      {
        tag: 'div[data-type="chart"]',
      },
    ];
  },

  /**
   * Render HTML from chart nodes
   * This is used for copy/paste and serialization
   */
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'chart' }, HTMLAttributes)];
  },

  /**
   * Use React component to render the chart node
   */
  addNodeView() {
    return ReactNodeViewRenderer(ChartBlock);
  },
});
