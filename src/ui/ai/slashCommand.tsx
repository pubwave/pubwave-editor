/**
 * `/ai` slash command factory
 *
 * Returns a `SlashCommand` whose action dispatches the open event the host
 * editor listens for. Importing this is cheap (no React rendering) so the
 * core extensions module can call it conditionally.
 */

import type { Editor } from '@tiptap/core';
import type { SlashCommand } from '../slashMenu/commands';
import { AISparkleIcon } from './AIIcon';
import { AI_OPEN_EVENT, type AIOpenEventDetail } from './openEvent';

export interface AISlashCommandStrings {
  title: string;
  description: string;
  groupLabel: string;
}

export function createAISlashCommand(
  strings: AISlashCommandStrings
): SlashCommand {
  return {
    id: 'ai',
    title: strings.title,
    description: strings.description,
    icon: <AISparkleIcon size={16} />,
    aliases: ['ai', 'ask', 'composer'],
    group: 'ai' as SlashCommand['group'],
    action: (editor: Editor) => {
      openComposerAtCursor(editor);
    },
  };
}

export function openComposerAtCursor(editor: Editor): void {
  const { from } = editor.state.selection;
  let rect: DOMRect | null = null;
  try {
    const coords = editor.view.coordsAtPos(from);
    rect = new DOMRect(
      coords.left,
      coords.top,
      1,
      coords.bottom - coords.top || 16
    );
  } catch {
    // ignore
  }
  const detail: AIOpenEventDetail = {
    source: 'slash',
    rect,
    documentAnchor: from,
    preferredContext: editor.state.selection.empty
      ? 'currentBlock'
      : 'selection',
  };
  editor.view.dom.dispatchEvent(
    new CustomEvent(AI_OPEN_EVENT, { detail, bubbles: true })
  );
}
