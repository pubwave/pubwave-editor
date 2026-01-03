/**
 * Color Extensions
 *
 * Text color and background color support using custom marks
 */

import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textColor: {
      setColor: (color: string) => ReturnType;
      unsetColor: () => ReturnType;
    };
    backgroundColor: {
      setBackgroundColor: (backgroundColor: string) => ReturnType;
      unsetBackgroundColor: () => ReturnType;
    };
  }
}

/**
 * Text Color Extension
 * Uses a custom mark with color attribute
 */
export const TextColor = Mark.create({
  name: 'textColor',
  // Ensure textColor and backgroundColor can coexist
  excludes: '',
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => {
          if (typeof element === 'string') return null;
          const el = element as HTMLElement;
          return el.style.color || el.getAttribute('data-color') || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.color) {
            return {};
          }
          return {
            style: `color: ${attributes.color}`,
            'data-color': attributes.color,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'span[style*="color"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          const color = element.style.color || element.getAttribute('data-color');
          return color ? { color } : false;
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    // ProseMirror/Tiptap's mergeAttributes should handle style merging automatically
    // when multiple marks use the same tag. If not, we rely on the attribute's renderHTML
    // which already returns the correct style string.
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setColor: (color: string) => ({ chain, state }: { chain: any; state: any }) => {
        // If mark already exists with the same color, no need to update
        const currentAttrs = state.storedMarks?.find((m: any) => m.type.name === this.name)?.attrs ||
          state.selection.$from.marks().find((m: any) => m.type.name === this.name)?.attrs;
        
        if (currentAttrs?.color === color) {
          return true; // Already has this color, no change needed
        }

        // If there's a selection, apply the mark
        // Use unsetMark first to ensure the new color is applied
        if (!state.selection.empty) {
          return chain()
            .focus()
            .unsetMark(this.name)
            .setMark(this.name, { color })
            .run();
        }
        // If no selection, apply to the next typed character
        return chain()
          .focus()
          .unsetMark(this.name)
          .setMark(this.name, { color })
          .run();
      },
      unsetColor: () => ({ chain }: { chain: any }) => {
        return chain().unsetMark(this.name).run();
      },
    };
  },
});

/**
 * Background Color Extension
 * Uses a custom mark with backgroundColor attribute
 */
export const BackgroundColor = Mark.create({
  name: 'backgroundColor',
  // Ensure backgroundColor and textColor can coexist
  excludes: '',
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      backgroundColor: {
        default: null,
        parseHTML: (element) => {
          if (typeof element === 'string') return null;
          const el = element as HTMLElement;
          return el.style.backgroundColor || el.getAttribute('data-background-color') || null;
        },
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            style: `background-color: ${attributes.backgroundColor}`,
            'data-background-color': attributes.backgroundColor,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'span[style*="background-color"]',
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;
          const backgroundColor = element.style.backgroundColor || 
            element.getAttribute('data-background-color');
          return backgroundColor ? { backgroundColor } : false;
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    // ProseMirror/Tiptap's mergeAttributes should handle style merging automatically
    // when multiple marks use the same tag. If not, we rely on the attribute's renderHTML
    // which already returns the correct style string.
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setBackgroundColor: (backgroundColor: string) => ({ chain, state }: { chain: any; state: any }) => {
        // If mark already exists with the same color, no need to update
        const currentAttrs = state.storedMarks?.find((m: any) => m.type.name === this.name)?.attrs ||
          state.selection.$from.marks().find((m: any) => m.type.name === this.name)?.attrs;
        
        if (currentAttrs?.backgroundColor === backgroundColor) {
          return true; // Already has this color, no change needed
        }

        // If there's a selection, apply the mark
        // Use unsetMark first to ensure the new color is applied
        if (!state.selection.empty) {
          return chain()
            .focus()
            .unsetMark(this.name)
            .setMark(this.name, { backgroundColor })
            .run();
        }
        // If no selection, apply to the next typed character
        return chain()
          .focus()
          .unsetMark(this.name)
          .setMark(this.name, { backgroundColor })
          .run();
      },
      unsetBackgroundColor: () => ({ chain }: { chain: any }) => {
        return chain().unsetMark(this.name).run();
      },
    };
  },
});
