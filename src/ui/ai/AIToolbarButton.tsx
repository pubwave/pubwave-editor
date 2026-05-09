/**
 * Bubble-toolbar AI button
 *
 * Lives next to the existing format buttons in `DefaultToolbarContent`. Click
 * dispatches a custom event the editor listens for to mount the Composer
 * anchored to the current selection.
 */

import React from 'react';
import { ToolbarButton } from '../toolbar/ToolbarButton';
import { AISparkleIcon } from './AIIcon';
import { AI_OPEN_EVENT, type AIOpenEventDetail } from './openEvent';

export interface AIToolbarButtonProps {
  editor: import('@tiptap/core').Editor;
  label: string;
}

export function AIToolbarButton({
  editor,
  label,
}: AIToolbarButtonProps): React.ReactElement {
  const handleClick = (): void => {
    const { from, to } = editor.state.selection;
    let rect: DOMRect | null = null;
    try {
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      rect = new DOMRect(
        Math.min(start.left, end.left),
        Math.min(start.top, end.top),
        Math.abs(end.left - start.left) || 1,
        Math.max(start.bottom, end.bottom) - Math.min(start.top, end.top) || 16
      );
    } catch {
      // ignore
    }

    const detail: AIOpenEventDetail = {
      source: 'toolbar',
      rect,
      documentAnchor: to,
      preferredContext: 'selection',
    };
    editor.view.dom.dispatchEvent(
      new CustomEvent(AI_OPEN_EVENT, { detail, bubbles: true })
    );
  };

  return (
    <ToolbarButton
      onClick={handleClick}
      data-tooltip={label}
      data-testid="toolbar-ai"
      aria-label={label}
    >
      <AISparkleIcon size={16} />
    </ToolbarButton>
  );
}
