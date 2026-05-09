/**
 * AI public types
 *
 * Provider-agnostic contract used by the editor and the built-in adapters.
 * Consumers can implement custom adapters by satisfying `AIAdapter`.
 */

import type { Editor } from '@tiptap/core';
import type { ReactNode } from 'react';
import type { EditorLocale as EditorLocaleCode } from '../../types/editor';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIAdapter {
  /** Stable identifier for telemetry / debugging */
  readonly id: string;
  /** Stream completion as an async iterable of text chunks */
  stream: (request: AIRequest, signal: AbortSignal) => AsyncIterable<string>;
}

export class AIError extends Error {
  readonly cause?: unknown;
  readonly status?: number;
  readonly adapterId?: string;

  constructor(
    message: string,
    options?: { cause?: unknown; status?: number; adapterId?: string }
  ) {
    super(message);
    this.name = 'AIError';
    this.cause = options?.cause;
    this.status = options?.status;
    this.adapterId = options?.adapterId;
  }
}

/**
 * Where the AI output should land relative to the trigger.
 *
 * - `replace`: replace the selection or current block content.
 * - `insertBelow`: insert as a new block below the trigger position.
 * - `insertAtCursor`: insert inline at the current cursor.
 */
export type AIApplyMode = 'replace' | 'insertBelow' | 'insertAtCursor';

/** Where the AI gets its source text. */
export type AIContextSource =
  | 'selection'
  | 'currentBlock'
  | 'sectionAbove'
  | 'wholeDocument'
  | 'none';

export interface AIActionContext {
  /** User free-form prompt (when available) */
  prompt: string;
  /** Resolved source text passed as context */
  context: string;
  /** Source kind so prompts can reference it */
  contextSource: AIContextSource;
  /** Editor locale code so prompts can request the output language */
  locale: EditorLocaleCode;
  /** Underlying Tiptap editor for advanced action implementations */
  editor: Editor;
  /** Optional refinement history when user keeps iterating */
  history?: AIMessage[];
}

export interface AIAction {
  id: string;
  /** i18n key used to look up the label; falls back to `id` if missing */
  labelKey?: string;
  /** Hard-coded label used when no i18n entry exists */
  label?: string;
  icon?: ReactNode;
  group?: 'edit' | 'generate' | 'translate';
  applyMode: AIApplyMode;
  /** Optional default context source override */
  defaultContext?: AIContextSource;
  /** Build the request that will be sent to the adapter */
  buildPrompt: (ctx: AIActionContext) => AIRequest;
}

export interface AIConfig {
  adapter: AIAdapter;
  defaultModel?: string;
  systemPrompt?: string;
  /** Replace or extend default actions (extends if `extendDefaults` is true) */
  actions?: AIAction[];
  /** When true, `actions` are appended to `defaultAIActions`. Default false. */
  extendDefaults?: boolean;
  enableInSlashMenu?: boolean;
  enableInToolbar?: boolean;
  enableKeyboardShortcut?: boolean;
  maxTokens?: number;
  temperature?: number;
  onError?: (err: AIError) => void;
}
