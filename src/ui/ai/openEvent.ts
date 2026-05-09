/**
 * AI open-event protocol
 *
 * The slash command, the toolbar button, the block-handle button and the
 * keyboard shortcut all dispatch the same custom event on the editor's DOM
 * node. The editor host (PubwaveEditor) listens once and mounts the
 * Composer accordingly. Decoupling via DOM events lets internal surfaces stay
 * small and avoids prop-drilling a Composer-open callback everywhere.
 */

import type { AIContextSource } from '../../core/ai/types';

export const AI_OPEN_EVENT = 'pubwave:ai-open';

export interface AIOpenEventDetail {
  source: 'slash' | 'toolbar' | 'blockHandle' | 'shortcut';
  /** Anchor rect for positioning. May be null for shortcut without selection. */
  rect: DOMRect | null;
  /** Document position for fallback insertion. */
  documentAnchor: number;
  /** Hint for which context source the Composer should pre-select. */
  preferredContext?: AIContextSource;
}

export type AIOpenEvent = CustomEvent<AIOpenEventDetail>;
