/**
 * AI Preview ProseMirror plugin
 *
 * Tracks a single "pending" range in the document — the chunk of text the AI
 * is currently writing or has just produced and is awaiting the user's
 * Apply / Discard. Renders it via inline + node decorations so consumers can
 * style the pending block (faded background, accent border, shimmer) without
 * touching the schema.
 *
 * State is mutated through transaction `meta`:
 *
 *   tr.setMeta(aiPreviewPluginKey, { type: 'set', from, to });
 *   tr.setMeta(aiPreviewPluginKey, { type: 'clear' });
 *
 * The range auto-maps through any subsequent transaction so streaming inserts
 * keep the marker glued to the correct positions without callers tracking
 * positions manually.
 */

import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

const PENDING_CLASS = 'pubwave-ai-pending';

export interface AIPreviewRange {
  from: number;
  to: number;
}

interface AIPreviewState {
  range: AIPreviewRange | null;
}

type AIPreviewMeta =
  | { type: 'set'; from: number; to: number }
  | { type: 'clear' };

export const aiPreviewPluginKey = new PluginKey<AIPreviewState>('aiPreview');

export function createAIPreviewPlugin(): Plugin<AIPreviewState> {
  return new Plugin<AIPreviewState>({
    key: aiPreviewPluginKey,
    state: {
      init(): AIPreviewState {
        return { range: null };
      },
      apply(tr, prev): AIPreviewState {
        const meta = tr.getMeta(aiPreviewPluginKey) as AIPreviewMeta | undefined;
        if (meta) {
          if (meta.type === 'clear') return { range: null };
          // meta.type === 'set'
          const docSize = tr.doc.content.size;
          const from = clamp(meta.from, 0, docSize);
          const to = clamp(meta.to, from, docSize);
          return { range: { from, to } };
        }
        if (!prev.range) return prev;
        // Map existing range through this transaction.
        const docSize = tr.doc.content.size;
        const from = clamp(tr.mapping.map(prev.range.from, 1), 0, docSize);
        const to = clamp(tr.mapping.map(prev.range.to, -1), from, docSize);
        if (from === prev.range.from && to === prev.range.to) return prev;
        if (from >= to) return { range: null };
        return { range: { from, to } };
      },
    },
    props: {
      decorations(state): DecorationSet | null {
        const pluginState = aiPreviewPluginKey.getState(state);
        if (!pluginState?.range) return null;
        const { from, to } = pluginState.range;
        if (from >= to) return null;
        return DecorationSet.create(state.doc, [
          Decoration.inline(from, to, { class: PENDING_CLASS }),
          Decoration.node(
            Math.max(0, from - 1),
            to,
            { class: `${PENDING_CLASS}__node` },
            { inclusiveStart: false, inclusiveEnd: false }
          ),
        ]);
      },
    },
  });
}

export function getAIPreviewRange(state: EditorState): AIPreviewRange | null {
  return aiPreviewPluginKey.getState(state)?.range ?? null;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
