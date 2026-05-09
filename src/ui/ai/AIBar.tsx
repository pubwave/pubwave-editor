/**
 * AIBar
 *
 * Compact floating bar that drives the AI flow. Unlike a chat panel, the
 * model's output streams *into the editor itself* as real Tiptap nodes,
 * marked as "pending" via the AIPreview ProseMirror plugin (faded
 * background, accent border). The bar carries only the controls — input
 * + Try again / Discard / Apply — and floats below the pending content.
 *
 *   ┌─ pending range in the editor ─────────────┐
 *   │ [streaming markdown → real nodes]         │
 *   └───────────────────────────────────────────┘
 *   ┌─ AIBar (this component) ───────────────┐
 *   │ ✨ Tell AI what else to change…   [↑]  │
 *   │ ↻ Try again       ✕ Discard   ✓ Apply  │
 *   └────────────────────────────────────────┘
 *
 * Lifecycle:
 *   open → idle (waiting for prompt)
 *        → streaming (chunks appending into editor)
 *        → done (Apply / Discard / Refine)
 *
 * On open:
 *   - if a selection exists → transform mode (selection becomes pending)
 *   - otherwise            → generate mode (new paragraph below current block)
 *
 * Apply:    keep the inserted nodes, drop the pending decoration
 * Discard:  delete the pending range
 * Try:      delete + rerun the same prompt
 * Refine:   add prev output to history, delete + rerun with new prompt
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/core';
import type { Slice } from '@tiptap/pm/model';
import type { EditorLocale as EditorLocaleCode } from '../../types/editor';
import type { AIConfig, AIMessage } from '../../core/ai/types';
import { runAI } from '../../core/ai/dispatcher';
import { localeToLanguage } from '../../core/ai/locale';
import {
  aiPreviewPluginKey,
  getAIPreviewRange,
} from '../../core/plugins/aiPreview';
import { tokens } from '../theme';
import { canUseDOM } from '../../core/util';
import { fallbackBarStrings, type AIBarStrings } from './aiBarStrings';
import { markdownToHTML } from './markdown';

export interface AIBarProps {
  editor: Editor;
  config: AIConfig;
  /** Anchor used for the very first render, before any pending range exists. */
  initialRect: DOMRect | null;
  /** Reserved — kept for backward compat with the open event payload. */
  documentAnchor?: number;
  /** Editor locale used to instruct the model on output language. */
  locale: EditorLocaleCode;
  strings?: Partial<AIBarStrings>;
  onClose: () => void;
}

type Mode = 'transform' | 'generate';
type Status = 'idle' | 'streaming' | 'done' | 'error';

const BAR_WIDTH = 520;
const BAR_OFFSET = 10;

export function AIBar({
  editor,
  config,
  initialRect,
  locale,
  strings: stringsProp,
  onClose,
}: AIBarProps): React.ReactElement | null {
  const strings = useMemo<AIBarStrings>(
    () => mergeStrings(stringsProp),
    [stringsProp]
  );

  // Mode + source text are decided at mount time so subsequent edits to the
  // selection don't surprise the user mid-flow.
  const initialMode = useRef<Mode>(
    !editor.state.selection.empty ? 'transform' : 'generate'
  );
  const initialSourceText = useRef<string>(
    initialMode.current === 'transform'
      ? editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to,
          '\n\n',
          '\n'
        )
      : ''
  );

  const [status, setStatus] = useState<Status>('idle');
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const accumulatedTextRef = useRef<string>('');
  const lastPromptRef = useRef<string>('');
  const conversationRef = useRef<AIMessage[]>([]);
  // For transform mode: snapshot of the original selection content (with all
  // marks / structure) so Discard can put it back exactly as it was.
  const originalSliceRef = useRef<Slice | null>(null);

  // Recompute bar position from the pending range (or fall back to the
  // initial anchor before any content exists).
  const computePosition = useCallback((): {
    top: number;
    left: number;
  } | null => {
    const range = getAIPreviewRange(editor.state);
    let top: number;
    let left: number;
    const editorRect = editor.view.dom.getBoundingClientRect();
    if (range && range.to > range.from) {
      try {
        const coords = editor.view.coordsAtPos(range.to);
        top = coords.bottom + BAR_OFFSET;
        left = editorRect.left;
      } catch {
        return null;
      }
    } else if (initialRect) {
      top = initialRect.bottom + BAR_OFFSET;
      left = editorRect.left;
    } else {
      return null;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const barHeight = barRef.current?.offsetHeight ?? 110;

    if (top + barHeight > viewportHeight - 16) {
      top = Math.max(16, viewportHeight - barHeight - 16);
    }
    if (left + BAR_WIDTH > viewportWidth - 16) {
      left = Math.max(16, viewportWidth - BAR_WIDTH - 16);
    }
    if (left < 16) left = 16;
    return { top, left };
  }, [editor, initialRect]);

  const refreshPosition = useCallback((): void => {
    const next = computePosition();
    if (next) setPosition(next);
  }, [computePosition]);

  useEffect(() => {
    refreshPosition();
    const onScroll = (): void => {
      refreshPosition();
    };
    const onResize = (): void => {
      refreshPosition();
    };
    const onTransaction = (): void => {
      refreshPosition();
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    editor.on('transaction', onTransaction);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      editor.off('transaction', onTransaction);
    };
  }, [editor, refreshPosition]);

  // Focus input once it actually exists in the DOM. We can't focus on the
  // first render because the bar returns null until `position` is computed,
  // so the textarea isn't mounted yet — we wait until position is ready.
  // rAF lets any synchronous focus() the editor dispatched (e.g. from the
  // slash command chain) settle first so we don't lose to it.
  useEffect(() => {
    if (!position) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
    };
  }, [position]);
  useEffect(() => {
    if (status === 'done') {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [status]);

  // Auto-grow the textarea to fit its content (clamped by CSS max-height).
  const autosize = useCallback((): void => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, []);
  useEffect(() => {
    autosize();
  }, [query, autosize]);

  // Cancel any in-flight request on unmount.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const clearPendingRange = useCallback((): void => {
    const tr = editor.state.tr.setMeta(aiPreviewPluginKey, { type: 'clear' });
    editor.view.dispatch(tr);
  }, [editor]);

  const deletePendingContent = useCallback((): void => {
    const range = getAIPreviewRange(editor.state);
    if (!range || range.from >= range.to) {
      clearPendingRange();
      return;
    }
    const tr = editor.state.tr
      .delete(range.from, range.to)
      .setMeta(aiPreviewPluginKey, { type: 'clear' });
    editor.view.dispatch(tr);
  }, [editor, clearPendingRange]);

  /**
   * Replace the pending range with raw streaming text. We insert plain text
   * + hard-breaks instead of paragraph nodes so the content flows inside the
   * current block (or empty paragraph) without splitting it. Block-level
   * structure is recovered later by `replacePendingWithMarkdown` on finish.
   */
  const replacePendingWithText = useCallback(
    (text: string): void => {
      const range = getAIPreviewRange(editor.state);
      if (!range) return;
      const schema = editor.state.schema;
      const hardBreak = schema.nodes.hardBreak;
      const tr = editor.state.tr;
      if (range.to > range.from) tr.delete(range.from, range.to);

      // Render \n\n as TWO hard-breaks so paragraphs feel separated; \n as ONE.
      // (Real paragraph splits happen on the markdown reparse step.)
      const segments = text.split('\n');
      let pos = range.from;
      segments.forEach((segment, index) => {
        if (index > 0 && hardBreak) {
          tr.insert(pos, hardBreak.create());
          pos += 1;
        }
        if (segment.length > 0) {
          tr.insertText(segment, pos);
          pos += segment.length;
        }
      });

      tr.setMeta(aiPreviewPluginKey, {
        type: 'set',
        from: range.from,
        to: pos,
      });
      editor.view.dispatch(tr);
    },
    [editor]
  );

  /**
   * Replace the pending range with the markdown-parsed final HTML.
   *
   * `marked` wraps even single-line plain text in a `<p>` tag, so naively
   * inserting that HTML would force Tiptap to split the current paragraph
   * (the AI text would jump to its own line). To avoid that, when the
   * parsed result is a *single* `<p>` we strip the wrapper and insert the
   * inner inline content; multi-block output (headings, lists, tables, …)
   * is inserted as-is and naturally creates new blocks.
   */
  const replacePendingWithMarkdown = useCallback(
    (text: string): void => {
      const range = getAIPreviewRange(editor.state);
      if (!range) return;
      const html = markdownToHTML(text).trim();
      if (!html) return;
      const { content } = inlineOrBlock(html);
      const initialFrom = range.from;
      // Let Tiptap update the selection to the end of the inserted content
      // so we can read the correct end position from `state.selection.from`
      // — that becomes the new pending-range `to`. Setting
      // `updateSelection: false` here would silently leave us with a stale
      // position and Discard would chew into the following block.
      editor
        .chain()
        .insertContentAt(
          { from: range.from, to: range.to },
          content,
          { parseOptions: { preserveWhitespace: false } }
        )
        .run();
      const newTo = editor.state.selection.from;
      const tr = editor.state.tr.setMeta(aiPreviewPluginKey, {
        type: 'set',
        from: initialFrom,
        to: newTo,
      });
      editor.view.dispatch(tr);
    },
    [editor]
  );

  const startStream = useCallback(
    (prompt: string, history: AIMessage[]): void => {
      // Establish or reset the pending range.
      const existingRange = getAIPreviewRange(editor.state);
      if (existingRange) {
        // Refining: drop previous output, keep the same insertion point.
        const tr = editor.state.tr
          .delete(existingRange.from, existingRange.to)
          .setMeta(aiPreviewPluginKey, {
            type: 'set',
            from: existingRange.from,
            to: existingRange.from,
          });
        editor.view.dispatch(tr);
      } else if (initialMode.current === 'transform') {
        // First run, transform: snapshot the original selection (so Discard
        // can restore it lossless) and replace it with an empty pending range
        // we can stream into.
        const { from, to } = editor.state.selection;
        originalSliceRef.current = editor.state.doc.slice(from, to);
        const tr = editor.state.tr
          .delete(from, to)
          .setMeta(aiPreviewPluginKey, { type: 'set', from, to: from });
        editor.view.dispatch(tr);
      } else {
        // First run, generate: pin the pending range at the cursor itself
        // — zero-width. Streaming inserts plain text (with hard-breaks for
        // newlines), so the AI's text flows into whichever block the cursor
        // is currently in, without inserting extra paragraphs above or below.
        const cursorPos = clampPos(
          editor.state.selection.from,
          editor.state.doc.content.size
        );
        const tr = editor.state.tr.setMeta(aiPreviewPluginKey, {
          type: 'set',
          from: cursorPos,
          to: cursorPos,
        });
        editor.view.dispatch(tr);
      }

      lastPromptRef.current = prompt;
      accumulatedTextRef.current = '';
      setError(null);
      setStatus('streaming');

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const messages: AIMessage[] = [
        ...history,
        { role: 'user' as const, content: buildPromptContent(prompt, locale, initialSourceText.current) },
      ];

      void (async () => {
        try {
          for await (const chunk of runAI({
            adapter: config.adapter,
            request: { messages },
            config: {
              systemPrompt: config.systemPrompt,
              defaultModel: config.defaultModel,
              maxTokens: config.maxTokens,
              temperature: config.temperature,
            },
            signal: controller.signal,
          })) {
            if (controller.signal.aborted) return;
            accumulatedTextRef.current += chunk;
            replacePendingWithText(accumulatedTextRef.current);
          }
          if (controller.signal.aborted) return;

          // Finalize: re-render accumulated text as parsed markdown so
          // headings / lists / tables / code blocks become real nodes.
          if (accumulatedTextRef.current.trim()) {
            replacePendingWithMarkdown(accumulatedTextRef.current);
            conversationRef.current = [
              ...messages,
              {
                role: 'assistant' as const,
                content: accumulatedTextRef.current,
              },
            ];
            setStatus('done');
          } else {
            setStatus('idle');
            clearPendingRange();
          }
        } catch (err) {
          if (controller.signal.aborted) return;
          const message =
            err instanceof Error ? err.message : strings.errors.generic;
          setError(message);
          setStatus('error');
          if (err instanceof Error) {
            config.onError?.(err as never);
          }
        }
      })();
    },
    [
      editor,
      config,
      locale,
      replacePendingWithText,
      replacePendingWithMarkdown,
      clearPendingRange,
      strings.errors.generic,
    ]
  );

  const handleSubmit = useCallback((): void => {
    if (status === 'streaming') return;
    const trimmed = query.trim();
    if (!trimmed) return;

    if (status === 'done') {
      // Refine: include prior turns as conversation history.
      startStream(trimmed, conversationRef.current);
    } else {
      conversationRef.current = [];
      startStream(trimmed, []);
    }
    setQuery('');
  }, [query, status, startStream]);

  const handleStop = useCallback((): void => {
    abortRef.current?.abort();
    if (accumulatedTextRef.current.trim()) {
      replacePendingWithMarkdown(accumulatedTextRef.current);
      setStatus('done');
    } else {
      clearPendingRange();
      setStatus('idle');
    }
  }, [replacePendingWithMarkdown, clearPendingRange]);

  const handleApply = useCallback((): void => {
    abortRef.current?.abort();
    clearPendingRange();
    onClose();
  }, [clearPendingRange, onClose]);

  const handleDiscard = useCallback((): void => {
    abortRef.current?.abort();
    const range = getAIPreviewRange(editor.state);
    const originalSlice = originalSliceRef.current;
    if (
      initialMode.current === 'transform' &&
      originalSlice &&
      originalSlice.size > 0 &&
      range
    ) {
      // Restore the original selection content in place of the AI output.
      const tr = editor.state.tr
        .replace(range.from, range.to, originalSlice)
        .setMeta(aiPreviewPluginKey, { type: 'clear' });
      editor.view.dispatch(tr);
    } else {
      deletePendingContent();
    }
    onClose();
  }, [editor, deletePendingContent, onClose]);

  const handleRetry = useCallback((): void => {
    if (!lastPromptRef.current) return;
    // Drop the assistant turn we just produced and rerun from the same
    // user prompt — gives the user a fresh take.
    const historyWithoutLast = conversationRef.current.slice(0, -2);
    startStream(lastPromptRef.current, historyWithoutLast);
  }, [startStream]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleDiscard();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleDiscard, handleSubmit]
  );

  if (!canUseDOM) return null;
  if (!position) return null;

  const placeholder =
    status === 'done' || status === 'error'
      ? strings.refinePlaceholder
      : strings.promptPlaceholder;
  const showApplyBar = status === 'done' || status === 'error';

  const bar = (
    <div
      ref={barRef}
      className="pubwave-ai-bar"
      data-testid="ai-bar"
      role="dialog"
      aria-label={strings.buttons.askAI}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: BAR_WIDTH,
        zIndex: tokens.zIndex.dropdown + 1,
      }}
    >
      <div className="pubwave-ai-bar__input-row">
        <span className="pubwave-ai-bar__icon" aria-hidden="true">
          ✨
        </span>
        <textarea
          ref={inputRef}
          className="pubwave-ai-bar__input"
          rows={1}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          disabled={status === 'streaming'}
          aria-label={strings.buttons.askAI}
        />
        {status === 'streaming' ? (
          <button
            type="button"
            className="pubwave-ai-bar__icon-button pubwave-ai-bar__icon-button--stop"
            onClick={handleStop}
            aria-label={strings.buttons.stop}
            title={strings.buttons.stop}
          >
            <StopGlyph />
          </button>
        ) : (
          <button
            type="button"
            className="pubwave-ai-bar__icon-button pubwave-ai-bar__icon-button--send"
            onClick={handleSubmit}
            disabled={query.trim().length === 0}
            aria-label={strings.buttons.send}
            title={strings.buttons.send}
          >
            <SendGlyph />
          </button>
        )}
      </div>

      {error ? (
        <div className="pubwave-ai-bar__error" role="alert">
          {error}
        </div>
      ) : null}

      {showApplyBar ? (
        <div className="pubwave-ai-bar__action-row">
          <button
            type="button"
            className="pubwave-ai-bar__ghost"
            onClick={handleRetry}
            disabled={!lastPromptRef.current}
          >
            <RetryGlyph /> <span>{strings.buttons.retry}</span>
          </button>
          <span className="pubwave-ai-bar__spacer" />
          <button
            type="button"
            className="pubwave-ai-bar__ghost"
            onClick={handleDiscard}
          >
            <CrossGlyph /> <span>{strings.buttons.discard}</span>
          </button>
          <button
            type="button"
            className="pubwave-ai-bar__primary"
            onClick={handleApply}
          >
            <CheckGlyph /> <span>{strings.buttons.apply}</span>
          </button>
        </div>
      ) : (
        <div className="pubwave-ai-bar__hint">{strings.shortcutHint}</div>
      )}
    </div>
  );

  return createPortal(bar, document.body);
}

function mergeStrings(partial?: Partial<AIBarStrings>): AIBarStrings {
  const base = fallbackBarStrings();
  if (!partial) return base;
  return {
    ...base,
    ...partial,
    buttons: { ...base.buttons, ...(partial.buttons ?? {}) },
    errors: { ...base.errors, ...(partial.errors ?? {}) },
  };
}

function buildPromptContent(
  prompt: string,
  locale: EditorLocaleCode,
  sourceText: string
): string {
  const lines = [prompt];
  if (sourceText) {
    lines.push(`--- Source text ---\n${sourceText}\n--- End ---`);
  }
  lines.push(
    `Format any structured output (headings, lists, tables, code blocks, quotes) using standard Markdown. Inline marks like **bold**, *italic*, \`code\` and [links](url) are supported. Do NOT wrap your entire reply in a single code fence. Reply in ${localeToLanguage(
      locale
    )} unless the user asks for another language.`
  );
  return lines.join('\n\n');
}

function clampPos(value: number, max: number): number {
  if (value < 0) return 0;
  if (value > max) return max;
  return value;
}

/**
 * Decide whether the parsed markdown HTML should be treated as block-level
 * (insert as new nodes, splitting the current block at the cursor) or
 * inline-only (merge into the current block, no split).
 *
 * Returns the HTML that should actually be inserted: with the outer `<p>`
 * stripped when the whole reply is a single paragraph.
 */
function inlineOrBlock(html: string): { content: string; inline: boolean } {
  const trimmed = html.trim();
  if (!trimmed) return { content: '', inline: true };
  if (typeof DOMParser === 'undefined') {
    return { content: trimmed, inline: false };
  }
  const doc = new DOMParser().parseFromString(
    `<body>${trimmed}</body>`,
    'text/html'
  );
  const body = doc.body;
  const elements = Array.from(body.children);
  const only = elements.length === 1 ? elements[0] : null;
  if (only && only.tagName === 'P') {
    return { content: only.innerHTML, inline: true };
  }
  return { content: trimmed, inline: false };
}

// ─── icons ──────────────────────────────────────────────────────────

function SendGlyph(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 13V3" />
      <path d="M3 8l5-5 5 5" />
    </svg>
  );
}
function StopGlyph(): React.ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
      <rect x="2" y="2" width="8" height="8" rx="1" />
    </svg>
  );
}
function CheckGlyph(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 5" />
    </svg>
  );
}
function CrossGlyph(): React.ReactElement {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}
function RetryGlyph(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8a5 5 0 0 1 8.6-3.5L13 6" />
      <path d="M13 3v3h-3" />
      <path d="M13 8a5 5 0 0 1-8.6 3.5L3 10" />
      <path d="M3 13v-3h3" />
    </svg>
  );
}
