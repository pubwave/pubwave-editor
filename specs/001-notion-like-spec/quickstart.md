# Quickstart: Notion-Level UI & Interaction Quality

This feature is defined by the spec and constitution; implementation should be validated primarily via interactive review and regression testing.

## What to read first

- Spec: [specs/001-notion-like-spec/spec.md](spec.md)
- Plan: [specs/001-notion-like-spec/plan.md](plan.md)
- Constitution: `.specify/memory/constitution.md`

## Repository-Specific Commands

```bash
# Install dependencies
npm install

# Start development server (opens playground at http://localhost:5173)
npm run dev

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run unit tests
npm run test:unit

# Run integration tests (requires Playwright browsers)
npm run test:integration

# Build the library
npm run build:lib

# Full quality check (lint + typecheck + unit tests)
npm run lint && npm run typecheck && npm run test:unit
```

## How to validate this feature

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173 in your browser.

3. Run the three core journeys side-by-side against the reference demo:
   - Writing & navigating blocks
   - Selecting text & formatting (toolbar appears only when selection is non-empty)
   - Dragging blocks (clear indicator while dragging; stable selection after drop)
   
4. Use the UX review contract checklist in `contracts/ux-review.md` and record pass/fail.

## SSR / Next.js integration (recommended)

Pubwave Editor is inherently client-side (it relies on DOM). However, it MUST be safe to integrate into SSR frameworks.

- Import safety: importing the library module during SSR MUST NOT throw (no `window`/`document` at module top-level).
- Next.js pattern: render the editor as a client component (e.g., `"use client"`), and optionally use dynamic import with `ssr: false` for the editor UI.
- Reference example: `examples/nextjs/` should demonstrate the supported integration pattern.

React versions:

- The library SHOULD support a reasonable peerDependency range (e.g., React 18+).
- Document which versions are tested (recommended: test at least React 18 and React 19).

## Suggested automated regression coverage

- Interaction tests (recommended):
  - Toolbar visibility toggles correctly on selection changes.
  - Drag cancel (Escape / drop outside) restores pre-drag state.
  - Drop success preserves selection and focus.
- Optional: screenshot-based checks for key states (hover, focus, selection, drag indicator).

## Notes

- This repo is intended to become the actual open-source editor library repo (React + Vite + TypeScript).
- Keep integration examples under `examples/` (Vite app + Next.js) to validate both CSR and SSR-host scenarios.

## Performance Sanity Checklist

Use this checklist to validate "Notion-level" interaction performance. These are manual checks intended for QA before release.

### Typing Latency

- [ ] Typing feels immediate (no perceivable lag during normal input)
- [ ] Holding down a key produces smooth repeated characters
- [ ] Backspace/delete operations feel instant
- [ ] Pasting large text (1000+ words) completes within 100ms

### Selection Performance

- [ ] Text selection with mouse feels responsive
- [ ] Shift+Arrow selection is smooth with no lag
- [ ] Triple-click to select paragraph is instant
- [ ] Toolbar appears within 100ms of selection

### Scroll Performance

- [ ] Scrolling through 100+ blocks is smooth (60fps)
- [ ] No visible jank during continuous scrolling
- [ ] Scroll position is maintained after block operations

### Drag & Drop Performance

- [ ] Drag handle appears within 50ms of block hover
- [ ] Drop indicator updates smoothly during drag
- [ ] Auto-scroll near edges is smooth (no stuttering)
- [ ] Block move operation completes within 50ms
- [ ] No layout jump when drag starts or ends

### Focus & State Transitions

- [ ] Focus transitions between blocks are smooth
- [ ] Toolbar show/hide has no flicker
- [ ] Mark state updates (bold/italic active) are instant
- [ ] Read-only mode toggle is immediate

### Initial Load

- [ ] Editor mounts and becomes interactive within 2 seconds
- [ ] No visible loading spinner needed for empty editor
- [ ] Initial content (50 blocks) renders within 500ms

### Measurement Tools

For detailed performance measurement, use:

```javascript
// Measure typing latency
const start = performance.now();
editor.commands.insertContent('a');
console.log('Insert latency:', performance.now() - start, 'ms');

// Measure selection update
const selStart = performance.now();
editor.commands.setTextSelection({ from: 0, to: 100 });
console.log('Selection latency:', performance.now() - selStart, 'ms');
```

Use Chrome DevTools Performance panel to:
- Record during typing to check for long tasks
- Monitor frame rate during scrolling
- Identify any layout thrashing during drag operations

