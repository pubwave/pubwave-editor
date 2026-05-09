/**
 * AI keyboard extension
 *
 * Registers the global ⌘J / Ctrl+J shortcut that opens the Composer at the
 * current selection. The Composer itself is a React component owned by
 * `PubwaveEditor`; this extension only emits an event the host listens for.
 */

import { Extension } from '@tiptap/core';
import { openComposerAtCursor } from '../../ui/ai/slashCommand';

export interface AIKeymapOptions {
  enabled: boolean;
}

export const AIKeymap = Extension.create<AIKeymapOptions>({
  name: 'aiKeymap',

  addOptions() {
    return { enabled: true };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-j': () => {
        if (!this.options.enabled) return false;
        openComposerAtCursor(this.editor);
        return true;
      },
    };
  },
});
