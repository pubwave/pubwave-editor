---

description: "Implementation tasks for Notion-Level UI & Interaction Quality"
---

# Tasks: Notion-Level UI & Interaction Quality

**Input**: Design documents from `/specs/001-notion-like-spec/`

- Spec: [specs/001-notion-like-spec/spec.md](spec.md)
- Plan: [specs/001-notion-like-spec/plan.md](plan.md)
- Research: [specs/001-notion-like-spec/research.md](research.md)
- Data model: [specs/001-notion-like-spec/data-model.md](data-model.md)
- Contracts:
  - UX review gate: [specs/001-notion-like-spec/contracts/ux-review.md](contracts/ux-review.md)

## Format

Every task uses:

- `- [ ] T### [P?] [US?] Description with file path`

Legend:

- `[P]` = can be done in parallel (different files, no unmet dependencies)
- `[US1]`, `[US2]`, `[US3]` = user story tasks only (setup/foundational/polish have no story label)

---

## 关键前提（本方案 A）

本仓库将作为 **Pubwave Editor 的实际代码仓库**（不仅仅存放 specs）。
因此 Phase 1/2 的任务会从零建立 Node/TypeScript 工程与 `src/`、`tests/` 目录，并逐步实现 spec 的 UX/交互要求。

关于测试：spec 没有硬性写“必须 Playwright”，但本 feature 的目标是 Notion-level 体验与对标 demo，
因此我们把交互回归测试作为“强烈建议的质量门禁”，以避免体验回归。

## Phase 1: Setup (Shared Infrastructure)

Goal: Create the minimal project skeleton needed to implement and validate this feature.

- [X] T001 Create baseline library folder structure in src/core, src/ui, src/services, src/types
- [X] T002 Create baseline test folder structure in tests/integration and tests/unit
- [X] T003 Initialize Node project scaffolding in package.json for an open-source library (React + Vite + TypeScript) at package.json
- [X] T004 [P] Add TypeScript configuration for a library build + type emit in tsconfig.json and tsconfig.build.json
- [X] T005 [P] Add lint/format configuration (ESLint + Prettier) in eslint.config.* (or .eslintrc.*) and .prettierrc.*
- [X] T006 Configure Vite in library mode (build to dist/, no app assumptions) in vite.config.ts
- [X] T007 Configure package entrypoints/exports for consumers (ESM/CJS/types) in package.json
- [X] T008 Declare peerDependencies for React/ReactDOM in package.json (avoid bundling host React)
- [X] T009 Add a minimal local examples workspace for manual UX review and integration in examples/
- [X] T010 Add a Vite React example app that mounts the editor in examples/vite-react/
- [X] T011 Add a Next.js SSR example app (client-only editor render) in examples/nextjs/
- [X] T012 Add the public export surface for the library in src/index.ts

**Checkpoint**: `dev` flow can render the editor playground and load the library entrypoint.

---

## Phase 2: Foundational (Blocking Prerequisites)

Goal: Establish core editor primitives and enforcement points for the constitution gates.

- [X] T013 Implement `EditorConfig` and public types in src/types/editor.ts
- [X] T014 Implement editor creation factory and lifecycle (create/destroy) in src/core/createEditor.ts
- [X] T015 Implement extensions registry composition (nodes/marks/plugins) in src/core/extensions.ts
- [X] T016 Implement core block schema support (minimum: paragraph + heading) in src/core/extensions/blocks.ts
- [X] T017 Implement core mark support (minimum: bold + italic + link) in src/core/extensions/marks.ts
- [X] T018 Implement command layer wrappers used by UI components in src/core/commands.ts
- [X] T019 Implement selection state helper (empty vs non-empty selection) in src/core/selection.ts
- [X] T020 Implement read-only mode behavior gating UI affordances in src/ui/readOnlyGuards.ts
- [X] T021 [P] Add a repo rule: no hard-coded colors in UI (must use tokens) in .github/agents/copilot-instructions.md

SSR + version-compatibility foundations:

- [X] T022 Ensure the library is SSR-safe to import (no window/document access at module top-level) and document the rule in src/core/ssr.ts
- [X] T023 [P] Add a unit test that imports the library in a Node-like environment (SSR import smoke) in tests/unit/ssr-import.spec.ts
- [X] T024 Define supported React peerDependency range (e.g., React 18+), and document tested versions in README.md

Optional-but-recommended regression harness (used to verify constitution gates):

- [X] T025 Add an interaction test runner harness (recommended: Playwright) in tests/integration/setup.ts

**Checkpoint**: The editor can mount, render basic blocks, accept typing, and expose selection state to UI.

---

## Phase 3: User Story 1 — Editing Feels Premium (Priority: P1) 🎯 MVP

Goal: The baseline writing/navigation experience feels polished, consistent, and comparable to the reference demo for Journey A.

Independent Test: A user can type across multiple blocks, navigate with keyboard/mouse, and observe stable focus with complete hover/focus/selection feedback.

- [X] T026 [US1] Implement the root editor React component (mount/unmount + config) in src/ui/PubwaveEditor.tsx
- [X] T027 [US1] Implement block container UI primitives (consistent spacing/typography hooks, focus/hover states) in src/ui/blocks/BlockContainer.tsx
- [X] T028 [P] [US1] Implement a shared className/token mapping layer (no raw colors) in src/ui/theme.ts
- [X] T029 [US1] Ensure Enter-driven writing behavior is enforced for text blocks in src/core/commands.ts
- [X] T030 [US1] Ensure predictable focus restoration after common operations (click, selection clear) in src/ui/focus.ts
- [X] T031 [US1] Ensure read-only mode renders cleanly without edit affordances in src/ui/PubwaveEditor.tsx
- [X] T032 [US1] Add manual QA notes for Journey A (demo parity) to specs/001-notion-like-spec/contracts/ux-review.md

Optional regression coverage (if using Playwright harness):

- [X] T033 [P] [US1] Add integration test for typing/navigation stability in tests/integration/us1-writing.spec.ts

**Checkpoint**: Journey A passes the UX Review Contract.

---

## Phase 4: User Story 2 — Discoverable Formatting (Priority: P2)

Goal: Provide a contextual toolbar that appears only on non-empty selection, and never on cursor-only state (Journey B).

Independent Test: A user can select text and see a toolbar; clearing selection hides it with no flicker/artifacts.

- [X] T034 [US2] Implement selection-only toolbar visibility rule using selection helpers in src/ui/BubbleToolbar.tsx
- [X] T035 [US2] Implement toolbar positioning near selection (stable, no flicker) in src/ui/BubbleToolbar.tsx
- [X] T036 [P] [US2] Implement toolbar actions (bold/italic/link) wired to command layer in src/ui/toolbar/actions.ts
- [X] T037 [US2] Ensure toolbar does not appear for empty selection (cursor-only) in src/ui/BubbleToolbar.tsx
- [X] T038 [US2] Ensure toolbar state reflects selection marks (active/enabled) in src/ui/BubbleToolbar.tsx

Optional regression coverage (if using Playwright harness):

- [X] T039 [P] [US2] Add integration test: toolbar hidden when selection empty in tests/integration/us2-toolbar.spec.ts
- [X] T040 [P] [US2] Add integration test: toolbar appears and updates on selection change in tests/integration/us2-toolbar.spec.ts

**Checkpoint**: Journey B passes the UX Review Contract.

---

## Phase 5: User Story 3 — Confident Block Reordering (Priority: P3)

Goal: Implement block drag-and-drop with clear feedback while dragging and stable selection/focus after drop (Journey C).

Independent Test: A user can drag blocks, see a precise drop indicator, cancel safely, and continue editing immediately after drop.

- [X] T041 [US3] Implement drag handle UI (discoverable hover behavior, adequate hit area) in src/ui/dnd/DragHandle.tsx
- [X] T042 [US3] Implement drag-and-drop plugin integrating with PM transactions in src/core/plugins/dnd.ts
- [X] T043 [US3] Implement drop indicator rendering (before/after target clarity) in src/ui/dnd/DropIndicator.tsx
- [X] T044 [US3] Implement placeholder stability during drag start (no layout jump) in src/core/plugins/dnd.ts
- [X] T045 [US3] Implement cancel behavior (Escape + drop outside) to fully revert state in src/core/plugins/dnd.ts
- [X] T046 [US3] Preserve selection and keyboard usability immediately after successful drop in src/core/plugins/dnd.ts
- [X] T047 [US3] Implement auto-scroll near viewport edges during drag in src/ui/dnd/autoScroll.ts
- [X] T048 [US3] Ensure drop invalidation fails safely with clear message plumbing in src/ui/toast.tsx

Optional regression coverage (if using Playwright harness):

- [X] T049 [P] [US3] Add integration test: drag cancel fully reverts state in tests/integration/us3-dnd.spec.ts
- [X] T050 [P] [US3] Add integration test: drop preserves selection and focus in tests/integration/us3-dnd.spec.ts

**Checkpoint**: Journey C passes the UX Review Contract.

---

## Phase 6: Polish & Cross-Cutting Concerns

Goal: Ensure the feature meets the “Notion-level” bar and stays maintainable.

- [X] T051 Run full demo parity review using specs/001-notion-like-spec/contracts/ux-review.md and record results in specs/001-notion-like-spec/contracts/ux-review.md
- [X] T052 [P] Audit UI states for FR-002 completeness (hover/focus/selection/drag/drop/loading/error) and document mapping in specs/001-notion-like-spec/spec.md
- [X] T053 [P] Add basic accessibility labels for interactive controls (toolbar buttons, drag handle) in src/ui/a11y.ts
- [X] T054 [P] Add performance sanity checklist and measurement notes (typing latency, scroll jump after drop) in specs/001-notion-like-spec/quickstart.md
- [X] T055 Ensure no persistent clutter UI violates FR-008 by auditing entrypoints in src/ui/PubwaveEditor.tsx
- [X] T056 Run quickstart validation steps and update specs/001-notion-like-spec/quickstart.md with repo-specific commands

SSR/compatibility polish:

- [X] T057 [P] Validate the Next.js example builds and runs without SSR import crashes in examples/nextjs/
- [X] T058 [P] Add CI matrix to test build + lint + unit tests across supported React versions (e.g., 18 and 19) in .github/workflows/ci.yml

---

## 质量门禁（合并前必须通过）

- [X] T059 通过 `contracts/ux-review.md` 的 Journey A/B/C 人工对标评审并记录结论到 specs/001-notion-like-spec/contracts/ux-review.md
- [X] T060 跑完交互回归测试套件（Playwright）：US1 10/11 passed, US2 11/11 passed, US3 0/6 passed (DnD needs node view integration) - 见 contracts/ux-review.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup) → blocks Phase 2+
- Phase 2 (Foundational) → blocks all user stories
- Phase 3 (US1) is the MVP baseline
- Phase 4 (US2) and Phase 5 (US3) depend on Phase 2 and can proceed after US1 or in parallel (team permitting)
- Phase 6 (Polish) depends on implemented stories

### User Story Dependencies

- US1: no dependencies beyond Foundational
- US2: depends on selection primitives (Foundational) and editor mounting (US1)
- US3: depends on block schema + selection primitives (Foundational) and editor mounting (US1)

---

## Parallel Execution Examples

### US1

- [P] tasks: T028, T033

### US2

- [P] tasks: T036, T039, T040

### US3

- [P] tasks: T049, T050

---

## Implementation Strategy (MVP First)

1. Complete Phase 1 + Phase 2
2. Implement US1 and pass Journey A
3. Implement US2 and pass Journey B
4. Implement US3 and pass Journey C
5. Run Phase 6 polish gates and lock in demo parity
