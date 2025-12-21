# Implementation Plan: Notion-Level UI & Interaction Quality

**Branch**: `001-notion-like-spec` | **Date**: 2025-12-20 | **Spec**: [specs/001-notion-like-spec/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-notion-like-spec/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

Raise Pubwave Editor’s baseline UI and interaction quality to a Notion-level bar, explicitly benchmarked against the Tiptap Notion-like demo, without changing the product direction (block-first, contextual selection-only toolbar, Enter-driven writing flow).

Approach:

- Treat the constitution as non-negotiable interaction contract.
- Validate UX via a repeatable “demo parity” checklist plus automated interaction regression coverage.
- Keep scope strict: no always-visible toolbar, no floating formatting UI on empty selection, and no Shift+Enter requirement.

## Technical Context

**Language/Version**: TypeScript (version pinned by repo when source is added)  
**Primary Dependencies**: React, Tiptap, ProseMirror; built with Vite (library mode); Tailwind CSS tokens provided by the host application  
**Storage**: N/A (this spec defines UX quality; persistence is out of scope)  
**Testing**: Interaction regression tests (recommended: Playwright) + unit tests for non-UI helpers (recommended: Vitest/Jest)  
**Target Platform**: Web (desktop baseline)  
**Project Type**: Open-source embeddable editor library (npm package), implemented with React + Vite + TypeScript  
**Performance Goals**: 60fps interactions for typing/selection/drag; typing feels immediate (see SC-004)  
**Constraints**: No hard-coded colors; must use theme primitives/tokens; avoid UX regressions vs reference demo; must be safe to integrate into SSR frameworks (e.g., Next.js)  
**Scale/Scope**: Core journeys only (writing, selection formatting, block drag) — no new feature surfaces beyond the spec

SSR/Framework Integration Requirements:

- The library MUST be safe to import in SSR environments (Node/server render) without throwing (no `window`/`document` access at module top-level).
- The actual editor view initialization can be client-only (expected), but the package import and React component module load MUST be SSR-safe.
- The library SHOULD support a reasonable React version range (e.g., React 18+), and MUST document tested versions.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md`.

Gates (MUST pass):

1) Block-first interaction model is preserved
- Requirement: Editing, selection, and reordering behave as block-oriented interactions.
- Verify: Manual journey review (A/B/C in `contracts/ux-review.md`) + interaction tests for selection and drag flows.

2) Contextual toolbar is selection-only
- Requirement: Bubble Menu shows only on non-empty selection; never on cursor-only state.
- Verify: Automated interaction test that asserts toolbar visibility toggles correctly + manual “Journey B”.

3) Enter-driven writing flow (no Shift+Enter requirement)
- Requirement: Users can write and continue using Enter; do not require alternate newline shortcuts.
- Verify: Manual “Journey A” and keyboard navigation smoke test.

4) Drag & drop has complete feedback and stable after-drop state
- Requirement: Drag start placeholder stability; clear drop indicator; cancel works; after drop selection/focus preserved.
- Verify: Manual “Journey C” + interaction tests for cancel + drop + focus continuity.

5) Styling respects host tokens (no new hard-coded colors)
- Requirement: All new UI states (hover/focus/drag indicator) use existing theme primitives.
- Verify: Code review gate + style review against design system (no raw color literals introduced).

6) Performance/stability redlines are honored
- Requirement: No noticeable typing lag; avoid scroll jumps after drop.
- Verify: Manual perf sanity on representative doc + basic performance profiling during development.

7) AI is optional and must not be assumed
- Requirement: This feature must not require AI to be enabled.
- Verify: Feature works with `ai.enabled=false` (if AI exists in host); otherwise N/A.

8) SSR frameworks (e.g., Next.js) can integrate safely
- Requirement: Importing the library in an SSR build/runtime must not crash; client-only rendering pattern is documented.
- Verify: An SSR import smoke test + an `examples/nextjs` integration example.

## Project Structure

### Documentation (this feature)

```text
specs/001-notion-like-spec/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
```text
src/
├── core/                 # Tiptap editor setup, extensions registry, commands
├── ui/                   # Bubble menu, drag handle, menus
├── services/             # Optional providers: upload/ai/telemetry adapters
└── types/                # Public TS types (EditorConfig, EditorAPI)

tests/
├── integration/          # Interaction tests for selection/toolbar/drag flows
└── unit/                 # Non-UI helper tests
examples/                # Local integration examples (Vite app, Next.js SSR app)
```

**Structure Decision**: Single library structure oriented around `core/` + `ui/`, aligned to the constitution’s suggested modules.

## Phase 0 — Research Output (complete)

- Produced: [specs/001-notion-like-spec/research.md](research.md)
- Key result: This feature has no new network APIs; validation is a UX contract + regression tests.

## Phase 1 — Design & Contracts Output (complete)

- Data model: [specs/001-notion-like-spec/data-model.md](data-model.md)
- Contracts:
  - UX review gate: [specs/001-notion-like-spec/contracts/ux-review.md](contracts/ux-review.md)
  - API note: [specs/001-notion-like-spec/contracts/api.md](contracts/api.md)
- Quickstart: [specs/001-notion-like-spec/quickstart.md](quickstart.md)

Post-design Constitution Check: No violations identified; all constraints are captured as gates and contracts.

## Phase 2 — Implementation Planning (next)

This phase is executed via `/speckit.tasks` and should produce `tasks.md` with:

- A dedicated task for each FR (FR-001..FR-009), mapping to explicit verification steps.
- A “demo parity review” task that must pass before merge, using `contracts/ux-review.md`.
- Interaction regression tests for:
  - Toolbar visibility (selection-only)
  - Drag cancel + drop + selection preservation
  - No scroll jump / stable focus after drop (as feasible to assert)

Exit criteria for Phase 2:

- Every gate in “Constitution Check” has an explicit verification step in tasks.
- The reference demo parity review is runnable as a repeatable checklist.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
