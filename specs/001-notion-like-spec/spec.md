# Feature Specification: Notion-Level UI & Interaction Quality

**Feature Branch**: `001-notion-like-spec`  
**Created**: 2025-12-20  
**Status**: Draft  
**Input**: User description: "基于宪法文档创建 specification，要重点强调界面的美观性和优秀的交互性，必须达到 notion editor 的级别，并且一定要参考 https://template.tiptap.dev/preview/templates/notion-like/ncftTmGKtW 这个示例的美观性和交互性，一定不要做出丑陋难用的东西。"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Editing Feels Premium (Priority: P1)

As a user creating a document, I want the editor to feel as polished and intuitive as a high-quality Notion-style editor so I can focus on writing and organizing content without fighting the UI.

**Why this priority**: Visual polish and interaction quality are the core value bar. If the editor feels clunky or looks unprofessional, adoption fails even if features exist.

**Independent Test**: A user can write, select, format, and reorganize blocks in a short session while rating the experience as “polished and easy” and without encountering confusing UI states.

**Acceptance Scenarios**:

1. **Given** a new document, **When** the user types and navigates across blocks with keyboard and mouse, **Then** interactions feel consistent and predictable (no unexpected jumps, lost focus, or surprising tool visibility).
2. **Given** the user selects content, **When** the selection changes, **Then** the contextual toolbar appears only when content is selected and updates to match the selection.
3. **Given** the user compares the core editing experience to the reference demo, **When** performing the same actions, **Then** the perceived visual polish and interaction responsiveness are comparable (no obvious missing feedback like hover/focus states).

---

### User Story 2 - Discoverable Formatting (Priority: P2)

As a user, I want formatting controls to appear at the right time (only when I select content) so formatting is discoverable without cluttering the interface.

**Why this priority**: Keeps the UI clean (block editor mindset) while ensuring users can still format quickly.

**Independent Test**: A user can apply basic formatting without prior training, using only the contextual toolbar and standard shortcuts.

**Acceptance Scenarios**:

1. **Given** the cursor is placed with no selection, **When** the user is not selecting any content, **Then** no toolbar is shown.
2. **Given** a non-empty text selection, **When** the selection is made, **Then** a contextual toolbar appears near the selection with clear, readable controls.
3. **Given** the user changes the selection range, **When** the selection expands/contracts, **Then** the toolbar remains usable and updates state (enabled/active) without flicker.

---

### User Story 3 - Confident Block Reordering (Priority: P3)

As a user, I want block drag-and-drop to provide clear feedback while dragging and a stable result after dropping so I can reorganize content confidently.

**Why this priority**: Drag-and-drop is a signature Notion-like interaction; a weak DnD experience makes the product feel “cheap”.

**Independent Test**: A user can reorder blocks and immediately continue editing after drop without confusion.

**Acceptance Scenarios**:

1. **Given** the user hovers a block, **When** the drag handle becomes available, **Then** it is easy to discover and easy to grab.
2. **Given** the user is dragging a block, **When** hovering possible drop positions, **Then** a clear drop indicator communicates exactly where the block will land.
3. **Given** the user drops the block, **When** the move completes, **Then** the moved block remains selected and the user can continue keyboard interaction immediately.

---

### Edge Cases

- Toolbar visibility: selection becomes empty due to click/escape; toolbar must hide without leaving visual artifacts.
- Drag and drop cancellation: user presses Escape or releases outside editor; UI returns to pre-drag state without partial results.
- Long documents: scrolling while dragging; drop indicator and target clarity must remain reliable.
- Mixed content: selection spans multiple marks/links; toolbar state remains consistent.
- Read-only mode: editor remains visually polished but does not show editing affordances that imply editability.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The editor UI MUST meet a “Notion-level” bar of visual polish: consistent spacing, typography, and alignment with no obviously unfinished elements.
- **FR-002**: The editor’s interaction feedback MUST be complete for core actions: hover, focus, selection, drag, drop, loading, error.
- **FR-003**: The editor MUST treat block manipulation as a first-class interaction: users can select blocks, move blocks, and continue editing without mode confusion.
- **FR-004**: The formatting toolbar MUST be contextual: it MUST appear only when the user selects content and MUST NOT appear when there is only a cursor.
- **FR-005**: The editor MUST support a predictable “Enter-driven” writing flow: line breaks and continuation are achievable using Enter without requiring alternate newline shortcuts.
- **FR-006**: The editor’s core look-and-feel MUST be comparable to the reference demo at https://template.tiptap.dev/preview/templates/notion-like/ncftTmGKtW for the same core user journeys (writing, selecting, formatting, dragging blocks).
- **FR-007**: The UI MUST remain beautiful and usable across common viewport sizes (desktop baseline) without layout breakage in primary flows.
- **FR-008**: The editor MUST not introduce UI elements that create persistent clutter (e.g., always-visible toolbars) that contradict the contextual design intent.
- **FR-009**: Error states (e.g., upload/AI failures) MUST be communicated with clear, non-technical messages and must not leave the editor in a confusing partial state.

### Acceptance Criteria (by Requirement)

- **AC-FR-001**: Visual consistency checks (spacing/typography/alignment) across primary screens reveal no obvious misalignments, unfinished styling, or inconsistent control sizing.
- **AC-FR-002**: For each core action (hover, focus, selection, drag, drop, loading, error), users receive a visible and understandable feedback state.
- **AC-FR-003**: After selecting/moving a block, users can immediately continue editing with keyboard without needing to “re-enter” editing mode.
- **AC-FR-004**: The toolbar never appears when selection is empty; it appears within a reasonable proximity to the selection when selection is non-empty.
- **AC-FR-005**: In text blocks, users can keep writing and create new lines/blocks using Enter only; no alternate newline shortcut is required to complete basic writing.
- **AC-FR-006**: In a side-by-side comparison against the reference demo for the defined journeys, reviewers identify no major missing interaction feedback and no major visual polish regressions.
- **AC-FR-007**: On common desktop viewport widths, primary flows remain usable without overlapping controls, clipped content, or unreadable menus.
- **AC-FR-008**: Outside of explicit selection, the UI remains uncluttered (no persistent toolbar occupying space or distracting from content).
- **AC-FR-009**: When an error occurs during a user-visible operation, users see a plain-language message describing what happened and what they can do next; the editor returns to a stable state.

### Assumptions

- Desktop web usage is the baseline for the “Notion-level” polish bar.
- This spec focuses on single-user editing UX; collaboration is out of scope unless separately specified.
- The product direction follows the existing constitution constraints (block-first model, contextual toolbar only on selection, Enter-driven writing flow).

### Dependencies

- Product constitution: `.specify/memory/constitution.md` defines non-negotiable interaction constraints.
- Visual/interaction benchmark: https://template.tiptap.dev/preview/templates/notion-like/ncftTmGKtW is the reference experience for polish and feedback completeness.

### Key Entities *(include if feature involves data)*

- **Document**: A user-authored page composed of ordered blocks.
- **Block**: A discrete unit of content (e.g., paragraph, heading, list item, media) that can be selected, moved, and edited.
- **Selection**: The current user-highlighted content range; drives contextual toolbar visibility.
- **Toolbar State**: What controls are visible/enabled based on selection and context.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a usability test with at least 10 participants, ≥ 90% can complete the primary editing journey (write, select, format, reorder blocks) without assistance.
- **SC-002**: In the same test, the median user rating for “visual polish” is ≥ 4/5 and for “interaction smoothness” is ≥ 4/5.
- **SC-003**: In side-by-side comparison sessions, reviewers agree the editor is “comparable in polish” to the reference demo for the defined journeys (no major missing feedback or obvious rough edges).
- **SC-004**: Users can start typing within 2 seconds of the editor being shown, and typing interactions feel immediate (no perceivable lag during normal input).

---

## FR-002 State Mapping — Interaction Feedback Completeness

This section documents how each core action feedback state (FR-002) is implemented.

### Hover States

| Element | Implementation | File |
|---------|---------------|------|
| Block | Block hover shows drag handle | `src/ui/dnd/DragHandle.tsx` |
| Toolbar Button | Button highlight on hover via tokens | `src/ui/BubbleToolbar.tsx` |
| Drag Handle | Handle opacity/color change on hover | `src/ui/dnd/DragHandle.tsx` |

### Focus States

| Element | Implementation | File |
|---------|---------------|------|
| Editor | Editor receives focus ring via CSS | `src/ui/PubwaveEditor.tsx` |
| Toolbar Button | Button focus ring via `:focus-visible` | `src/ui/BubbleToolbar.tsx` |
| Block | Block focus tracked in editor state | `src/ui/focus.ts` |

### Selection States

| Element | Implementation | File |
|---------|---------------|------|
| Text Selection | Native selection styling preserved | Browser default |
| Empty Selection | Cursor blink, no toolbar | `src/core/selection.ts` |
| Non-Empty Selection | Toolbar appears near selection | `src/ui/BubbleToolbar.tsx` |
| Mark State | Toolbar buttons reflect active marks | `src/core/selection.ts` |

### Drag States

| Element | Implementation | File |
|---------|---------------|------|
| Drag Start | Block enters dragging visual state | `src/core/plugins/dnd.ts` |
| Dragging | Cursor changes to grabbing | `src/ui/dnd/DragHandle.tsx` |
| Placeholder | Original position maintained | `src/core/plugins/dnd.ts` |
| Auto-scroll | Viewport scrolls near edges | `src/ui/dnd/autoScroll.ts` |

### Drop States

| Element | Implementation | File |
|---------|---------------|------|
| Drop Indicator | Visual line shows insertion point | `src/ui/dnd/DropIndicator.tsx` |
| Before/After | Indicator shows above/below target | `src/ui/dnd/DropIndicator.tsx` |
| Drop Success | Block moves, focus restored | `src/core/plugins/dnd.ts` |
| Drop Cancel | Block returns to original position | `src/core/plugins/dnd.ts` |

### Loading States

| Element | Implementation | File |
|---------|---------------|------|
| Editor Mount | Initial loading handled by React | `src/ui/PubwaveEditor.tsx` |
| Async Operations | (Future: media upload, AI) | Planned |

### Error States

| Element | Implementation | File |
|---------|---------------|------|
| Drop Failure | Toast notification with message | `src/ui/toast.tsx` |
| Invalid Operation | Clear user feedback via toast | `src/ui/toast.tsx` |
| Error Recovery | Editor returns to stable state | `src/core/plugins/dnd.ts` |

### Accessibility

| Concern | Implementation | File |
|---------|---------------|------|
| Screen Reader Labels | ARIA labels for all controls | `src/ui/a11y.ts` |
| Keyboard Shortcuts | Documented shortcuts for formatting | `src/ui/a11y.ts` |
| Live Announcements | Dynamic content announced | `src/ui/a11y.ts` |

