/**
 * Text Align Extension
 *
 * Adds text alignment attributes and commands for block nodes.
 */

import { Extension } from '@tiptap/core';

export type TextAlignValue = 'left' | 'center' | 'right';

export interface TextAlignOptions {
  types: string[];
  alignments: TextAlignValue[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (alignment: TextAlignValue) => ReturnType;
      unsetTextAlign: () => ReturnType;
    };
  }
}

export const TextAlign = Extension.create<TextAlignOptions>({
  name: 'textAlign',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      alignments: ['left', 'center', 'right'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element: HTMLElement) => {
              const align =
                element.style.textAlign || element.getAttribute('data-text-align') || null;
              return this.options.alignments.includes(align as TextAlignValue) ? align : null;
            },
            renderHTML: (attributes: { textAlign?: TextAlignValue | null }) => {
              if (!attributes.textAlign) {
                return {};
              }
              return {
                style: `text-align: ${attributes.textAlign}`,
                'data-text-align': attributes.textAlign,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment: TextAlignValue) =>
        ({ commands }) => {
          if (!this.options.alignments.includes(alignment)) {
            return false;
          }

          let success = false;
          for (const type of this.options.types) {
            if (commands.updateAttributes(type, { textAlign: alignment })) {
              success = true;
            }
          }
          return success;
        },
      unsetTextAlign:
        () =>
        ({ commands }) => {
          let success = false;
          for (const type of this.options.types) {
            if (commands.updateAttributes(type, { textAlign: null })) {
              success = true;
            }
          }
          return success;
        },
    };
  },
});
