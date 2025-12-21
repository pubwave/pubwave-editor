# Phase 1 Data Model: Notion-Level UI & Interaction Quality

This feature is primarily UX/interaction quality, but it relies on a stable block/document model.

## Entities

### Document
- Fields:
  - `id` (string)
  - `blocks` (ordered list of Block)
  - `createdAt` / `updatedAt` (timestamps)
- Relationships:
  - 1 Document → many Blocks (ordered)

### Block
- Fields:
  - `id` (string; SHOULD be stable across reorders)
  - `type` (string; e.g., paragraph, heading, listItem, image)
  - `attrs` (key/value attributes)
  - `content` (rich text / child nodes depending on type)
- Relationships:
  - Block belongs to exactly one Document
  - Block may contain nested Blocks in constrained cases (e.g., list nesting)

### Selection
- Purpose: Drives contextual toolbar visibility and formatting state.
- Forms:
  - Empty selection (cursor only)
  - Non-empty text selection
  - Block selection (single)
  - Block multi-selection (optional but supported by constitution behaviors)

### Toolbar State
- Derived state (not persisted):
  - `visible` (boolean; MUST be false when selection is empty)
  - `position` (near selection)
  - `enabledActions` / `activeMarks`

### Drag State
- Derived state (ephemeral):
  - `dragging` (boolean)
  - `draggedBlockIds` (string[])
  - `originIndex` / `originParent` (optional)
  - `currentDropTarget` (before/after block id)
  - `isDropAllowed` (boolean)

## Validation Rules (from spec + constitution)

- Toolbar MUST NOT be visible when selection is empty.
- DnD MUST be atomic on drop; invalid drop MUST revert with a user-visible message.
- After drop, moved block(s) MUST remain selected and keyboard interaction MUST work immediately.
- No new hard-coded colors; all styling MUST respect host tokens (Tailwind/theme primitives).

## State Transitions (high level)

- Typing: selection updates frequently; toolbar stays hidden unless selection becomes non-empty.
- Select text: selection empty → non-empty ⇒ toolbar visible.
- Clear selection (click/escape): non-empty → empty ⇒ toolbar hidden.
- Drag start: idle → dragging (placeholder + drag preview visible).
- Drag cancel: dragging → idle (document + selection revert).
- Drop success: dragging → idle (document reordered, selection preserved).
- Drop invalid: dragging → idle (revert + message).
