/**
 * Build AIBar strings from an `EditorLocale`.
 *
 * Locale data lives under an optional `ai` key on the locale JSON. Missing
 * fields fall back to the English defaults from `fallbackBarStrings`.
 */

import type { EditorLocale } from '../../i18n';
import { fallbackBarStrings, type AIBarStrings } from './aiBarStrings';

interface AILocaleData {
  askButton?: string;
  promptPlaceholder?: string;
  refinePlaceholder?: string;
  shortcutHint?: string;
  buttons?: {
    send?: string;
    stop?: string;
    apply?: string;
    discard?: string;
    retry?: string;
    submit?: string; // legacy name kept as fallback for `send`
  };
  errors?: { generic?: string };
  slashCommand?: { title?: string; description?: string };
}

export function buildAIStrings(locale: EditorLocale): AIBarStrings {
  const base = fallbackBarStrings();
  const ai = (locale as { ai?: AILocaleData }).ai;
  if (!ai) return base;
  const buttons = ai.buttons ?? {};
  return {
    promptPlaceholder: ai.promptPlaceholder ?? base.promptPlaceholder,
    refinePlaceholder: ai.refinePlaceholder ?? base.refinePlaceholder,
    shortcutHint: ai.shortcutHint ?? base.shortcutHint,
    buttons: {
      send: buttons.send ?? buttons.submit ?? base.buttons.send,
      stop: buttons.stop ?? base.buttons.stop,
      apply: buttons.apply ?? base.buttons.apply,
      discard: buttons.discard ?? base.buttons.discard,
      retry: buttons.retry ?? base.buttons.retry,
      askAI: ai.askButton ?? base.buttons.askAI,
    },
    errors: {
      generic: ai.errors?.generic ?? base.errors.generic,
    },
  };
}
