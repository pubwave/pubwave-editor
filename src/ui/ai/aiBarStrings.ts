/**
 * Strings for the AIBar UI.
 *
 * Caller (the editor) builds this from the active locale and passes it in.
 * Decoupling the bar from the locale schema keeps it portable for tests.
 */

export interface AIBarStrings {
  promptPlaceholder: string;
  refinePlaceholder: string;
  shortcutHint: string;
  buttons: {
    send: string;
    stop: string;
    apply: string;
    discard: string;
    retry: string;
    askAI: string;
  };
  errors: {
    generic: string;
  };
}

export function fallbackBarStrings(): AIBarStrings {
  return {
    promptPlaceholder: 'Tell AI what to do…',
    refinePlaceholder: 'Tell AI what else needs to be changed…',
    shortcutHint: '↵ Send · ⇧↵ Newline · Esc Discard',
    buttons: {
      send: 'Send',
      stop: 'Stop',
      apply: 'Apply',
      discard: 'Discard',
      retry: 'Try again',
      askAI: 'Ask AI',
    },
    errors: {
      generic: 'AI request failed',
    },
  };
}
