/**
 * Layout Extension
 *
 * Adds multi-column layout support to the editor.
 * Supports 2-column and 3-column layouts.
 *
 * Constitution 4.1.1: Block Node Types
 * - Layout is a container node that holds multiple layoutColumn nodes
 * - LayoutColumn is a block node that contains standard block content
 * - Layouts are draggable and cannot be nested (no layouts inside layouts)
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { LayoutColumnBlock } from '../../ui/blocks/LayoutColumnBlock';

/**
 * Layout Extension for TipTap
 *
 * Container node for multi-column layouts.
 * Has a `columns` attribute (2 or 3) to specify the number of columns.
 *
 * IMPORTANT: Does NOT use a custom node view. Uses renderHTML to define
 * the structure, and child layoutColumn nodes use their own node views.
 * This ensures each column renders correctly with its own content.
 */
export const Layout = Node.create({
  name: 'layout',

  /**
   * Priority determines the order of extension execution
   */
  priority: 1000,

  /**
   * Layout is a block-level node
   * draggable: true allows the node to be dragged by the DnD plugin
   */
  group: 'block',
  draggable: true,

  /**
   * Layout must contain at least one layoutColumn
   * The content model is defined in the schema
   */
  content: 'layoutColumn+',

  /**
   * Add attributes to the layout node
   * columns: number of columns (2 or 3)
   */
  addAttributes() {
    return {
      columns: {
        default: 2,
        parseHTML: (element) => {
          const colsAttr = element.getAttribute('data-layout-columns');
          return colsAttr ? parseInt(colsAttr, 10) : 2;
        },
        renderHTML: (attributes) => {
          return {
            'data-layout-columns': String(attributes.columns),
          };
        },
      },
    };
  },

  /**
   * Parse HTML to create layout nodes
   */
  parseHTML() {
    return [
      {
        tag: 'div[data-type="layout"]',
        // Validate that the columns attribute is 2 or 3
        getAttrs: (element) => {
          const colsAttr = (element as HTMLElement).getAttribute('data-layout-columns');
          const columns = colsAttr ? parseInt(colsAttr, 10) : 2;
          if (columns !== 2 && columns !== 3) {
            return false;
          }
          return { columns };
        },
      },
    ];
  },

  /**
   * Render HTML from layout nodes
   *
   * Defines the container structure with proper CSS classes.
   * Child layoutColumn nodes will be rendered inside (0 placeholder).
   */
  renderHTML({ node, HTMLAttributes }) {
    const columns = node.attrs.columns as number;
    const classNames = [
      'pubwave-editor__layout',
      `pubwave-layout--${columns}-cols`,
    ];

    return [
      'div',
      mergeAttributes({
        'data-type': 'layout',
        'data-layout-columns': String(columns),
        'class': classNames.join(' '),
      }, HTMLAttributes),
      0, // Render all child nodes (layoutColumn) into this div
    ];
  },
});

/**
 * LayoutColumn Extension for TipTap
 *
 * Represents a single column within a layout.
 * Contains standard block content (paragraphs, headings, lists, etc.).
 * isolating: true means keyboard navigation is confined to this node
 */
export const LayoutColumn = Node.create({
  name: 'layoutColumn',

  priority: 1000,

  /**
   * LayoutColumn is a block-level node
   * isolating: true confines keyboard navigation to within the column
   */
  group: 'block',
  isolating: true,

  /**
   * LayoutColumn contains any block content
   */
  content: 'block+',

  /**
   * Parse HTML to create layoutColumn nodes
   */
  parseHTML() {
    return [
      {
        tag: 'div[data-type="layoutColumn"]',
      },
      {
        tag: 'div.pubwave-layout__column',
      },
    ];
  },

  /**
   * Render HTML from layoutColumn nodes
   *
   * Since we use a custom node view (LayoutColumnBlock),
   * this is primarily for HTML serialization/export.
   */
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({
      'data-type': 'layoutColumn',
      'class': 'pubwave-layout__column',
    }, HTMLAttributes), 0];
  },

  /**
   * Use React component to render the column node
   * This ensures proper CSS structure for grid layout
   */
  addNodeView() {
    return ReactNodeViewRenderer(LayoutColumnBlock);
  },
});
