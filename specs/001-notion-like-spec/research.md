# Phase 0 Research: Notion-Level UI & Interaction Quality

## Decisions

### Decision: Target stack is React + Tiptap/ProseMirror + Tailwind (host tokens)
- Rationale: Matches the product constitution and is the intended integration surface for “Pubwave Editor”.
- Alternatives considered:
  - Slate-based editor: would diverge from constitution and existing design assumptions.
  - Quill-based editor: weaker block-first interaction model vs ProseMirror.

### Decision: Enforce “selection-only toolbar” via editor state, not ad-hoc UI rules
- Rationale: The constitution requires Bubble Menu to appear only when the selection is non-empty; tying visibility to selection state avoids flicker and inconsistent states.
- Alternatives considered:
  - Always-visible toolbar: rejected by FR-008 and constitution (contextual only).
  - Cursor-based floating menu: explicitly removed from constitution.

### Decision: Drag & Drop is implemented as a ProseMirror/Tiptap-native behavior with a dedicated drag-handle plugin
- Rationale: Block DnD must preserve document validity (schema constraints), keep selection stable after drop, and avoid scroll jumps. Tight coupling to PM transactions is required.
- Alternatives considered:
  - Generic DOM DnD libraries (e.g., list reordering): rejected due to mismatch with PM state and selection/transaction atomicity.

### Decision: Primary UX verification is Playwright-based interaction tests + a human review checklist against the Tiptap Notion-like reference demo
- Rationale: The spec is UX/polish heavy; we need automated regression checks for core journeys, plus a repeatable human “demo parity” gate.
- Alternatives considered:
  - Unit tests only: insufficient to validate selection/drag/toolbar behavior.
  - Visual-only snapshot testing: insufficient without interaction assertions.

### Decision: Performance budget is defined around “typing feels immediate” and “no flicker/jank” for selection/toolbar/drag
- Rationale: FR-001/002 and constitution performance redlines require measurable budgets; even without backend, the editor must meet 60fps interaction expectations.
- Alternatives considered:
  - No explicit budgets: leads to polish regressions and hard-to-debug UX complaints.

## Key Questions Resolved

- Language/platform: Web (desktop baseline), TypeScript/React.
- Storage: N/A for this feature (no persistence requirements defined in this spec).
- External API contracts: N/A (no network API introduced by this spec); focus is UI/interaction contracts.

## References

- Product constitution: `.specify/memory/constitution.md`
- Visual/interaction benchmark: https://template.tiptap.dev/preview/templates/notion-like/ncftTmGKtW
