/**
 * Default AI actions
 *
 * Each action turns a context (selection / block / etc.) plus a free-form
 * prompt into an `AIRequest`. The output language is taken from the editor
 * locale, with the exception of translate-style actions that accept an
 * explicit target.
 *
 * Custom actions may be appended via `AIConfig.actions` (with
 * `extendDefaults: true`) or replace the defaults entirely.
 */

import type { AIAction, AIActionContext, AIRequest } from './types';
import { localeToLanguage } from './locale';

function languageHint(ctx: AIActionContext): string {
  return `Respond in ${localeToLanguage(ctx.locale)}. Output plain text only without commentary or markdown fences.`;
}

function buildEditRequest(
  ctx: AIActionContext,
  instruction: string
): AIRequest {
  const userPayload =
    `${instruction}\n\n` +
    `--- Source text ---\n${ctx.context}\n--- End ---\n\n` +
    languageHint(ctx);
  const messages = ctx.history?.length
    ? [...ctx.history, { role: 'user' as const, content: userPayload }]
    : [{ role: 'user' as const, content: userPayload }];
  return { messages };
}

function buildGenerateRequest(
  ctx: AIActionContext,
  instruction: string
): AIRequest {
  const parts = [instruction];
  if (ctx.context) {
    parts.push(`Reference text:\n${ctx.context}`);
  }
  parts.push(languageHint(ctx));
  const userPayload = parts.join('\n\n');
  const messages = ctx.history?.length
    ? [...ctx.history, { role: 'user' as const, content: userPayload }]
    : [{ role: 'user' as const, content: userPayload }];
  return { messages };
}

export const defaultAIActions: AIAction[] = [
  {
    id: 'improve',
    labelKey: 'improve',
    label: 'Improve writing',
    group: 'edit',
    applyMode: 'replace',
    defaultContext: 'selection',
    buildPrompt: (ctx) =>
      buildEditRequest(
        ctx,
        'Rewrite the source text to be clearer, more vivid, and better flowing while preserving its meaning, structure and approximate length.'
      ),
  },
  {
    id: 'shorten',
    labelKey: 'shorten',
    label: 'Make shorter',
    group: 'edit',
    applyMode: 'replace',
    defaultContext: 'selection',
    buildPrompt: (ctx) =>
      buildEditRequest(
        ctx,
        'Rewrite the source text to be significantly shorter while preserving the key points and meaning.'
      ),
  },
  {
    id: 'lengthen',
    labelKey: 'lengthen',
    label: 'Make longer',
    group: 'edit',
    applyMode: 'replace',
    defaultContext: 'selection',
    buildPrompt: (ctx) =>
      buildEditRequest(
        ctx,
        'Expand the source text with additional supporting detail, examples, or context. Preserve voice and meaning.'
      ),
  },
  {
    id: 'fixGrammar',
    labelKey: 'fixGrammar',
    label: 'Fix grammar & spelling',
    group: 'edit',
    applyMode: 'replace',
    defaultContext: 'selection',
    buildPrompt: (ctx) =>
      buildEditRequest(
        ctx,
        'Correct grammar, spelling and punctuation issues in the source text. Make minimal stylistic changes; keep the original wording and meaning wherever possible.'
      ),
  },
  {
    id: 'changeToneFormal',
    labelKey: 'changeToneFormal',
    label: 'Change tone: formal',
    group: 'edit',
    applyMode: 'replace',
    defaultContext: 'selection',
    buildPrompt: (ctx) =>
      buildEditRequest(
        ctx,
        'Rewrite the source text in a formal, professional tone suitable for business communication. Preserve the original meaning.'
      ),
  },
  {
    id: 'changeToneCasual',
    labelKey: 'changeToneCasual',
    label: 'Change tone: casual',
    group: 'edit',
    applyMode: 'replace',
    defaultContext: 'selection',
    buildPrompt: (ctx) =>
      buildEditRequest(
        ctx,
        'Rewrite the source text in a casual, friendly tone suitable for informal writing. Preserve the original meaning.'
      ),
  },
  {
    id: 'summarize',
    labelKey: 'summarize',
    label: 'Summarize',
    group: 'generate',
    applyMode: 'insertBelow',
    defaultContext: 'selection',
    buildPrompt: (ctx) =>
      buildGenerateRequest(
        ctx,
        'Write a concise summary of the reference text in 1-3 sentences capturing the key points.'
      ),
  },
  {
    id: 'continue',
    labelKey: 'continue',
    label: 'Continue writing',
    group: 'generate',
    applyMode: 'insertAtCursor',
    defaultContext: 'sectionAbove',
    buildPrompt: (ctx) =>
      buildGenerateRequest(
        ctx,
        'Continue the reference text in the same voice and style. Produce 1-2 short paragraphs that flow naturally from where it ends.'
      ),
  },
  {
    id: 'explain',
    labelKey: 'explain',
    label: 'Explain',
    group: 'generate',
    applyMode: 'insertBelow',
    defaultContext: 'selection',
    buildPrompt: (ctx) =>
      buildGenerateRequest(
        ctx,
        'Explain the reference text in plain language so a general reader can understand it. Keep it short.'
      ),
  },
  {
    id: 'translateEnglish',
    labelKey: 'translateEnglish',
    label: 'Translate to English',
    group: 'translate',
    applyMode: 'replace',
    defaultContext: 'selection',
    buildPrompt: (ctx) =>
      buildEditRequest(
        ctx,
        'Translate the source text into idiomatic English. Output only the translation.'
      ),
  },
  {
    id: 'translateChinese',
    labelKey: 'translateChinese',
    label: 'Translate to Chinese',
    group: 'translate',
    applyMode: 'replace',
    defaultContext: 'selection',
    buildPrompt: (ctx) => ({
      messages: [
        ...(ctx.history ?? []),
        {
          role: 'user',
          content:
            `Translate the source text into idiomatic Simplified Chinese. Output only the translation.\n\n` +
            `--- Source text ---\n${ctx.context}\n--- End ---`,
        },
      ],
    }),
  },
];

export function getAction(
  id: string,
  actions: AIAction[] = defaultAIActions
): AIAction | undefined {
  return actions.find((a) => a.id === id);
}
