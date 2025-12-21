# pubwave-editor Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-20

## Active Technologies
- TypeScript (version pinned by repo when source is added) + React, Tiptap, ProseMirror; built with Vite (library mode); Tailwind CSS tokens provided by the host application (001-notion-like-spec)
- N/A (this spec defines UX quality; persistence is out of scope) (001-notion-like-spec)

## Project Structure

```text
src/
tests/
```

## Commands

After the Node/TypeScript scaffold exists (package.json + scripts): `npm test` and `npm run lint`

## Code Style

TypeScript (version pinned by repo when source is added): Follow standard conventions

## Recent Changes
- 001-notion-like-spec: Added TypeScript (version pinned by repo when source is added) + React, Tiptap, ProseMirror; built with Vite (library mode); Tailwind CSS tokens provided by the host application

<!-- MANUAL ADDITIONS START -->

## Constitution Rules

### No Hard-Coded Colors in UI (MUST)

All styling in this codebase MUST use theme tokens (CSS custom properties) instead of hard-coded color values.

**Forbidden:**
- `color: #ff0000`
- `background: rgb(255, 0, 0)`
- `border-color: red`
- Any raw color literals in CSS/JS/TSX

**Required:**
- `color: var(--color-text)`
- `background: var(--color-background)`
- `border-color: var(--color-border)`
- Use CSS custom properties from the theme system

This ensures the editor can be styled by host applications and maintains visual consistency.

### Selection-Only Toolbar

The bubble menu/toolbar MUST appear only when the selection is non-empty.
Never show the toolbar on cursor-only state.

### Block-First Interaction Model

Editing, selection, and reordering behave as block-oriented interactions.
Preserve stable focus and selection after all operations.

<!-- MANUAL ADDITIONS END -->
