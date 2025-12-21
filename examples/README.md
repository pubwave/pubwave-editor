# Pubwave Editor - Examples

This directory contains example integrations of Pubwave Editor with different frameworks and build tools.

## Available Examples

### [Vite + React](./vite-react)

A simple client-side React application using Vite for development.

- **Use case**: Standard single-page applications
- **Port**: http://localhost:5173

```bash
cd examples/vite-react
npm install
npm run dev
```

### [Next.js](./nextjs)

An SSR-safe integration with Next.js 15 using the App Router.

- **Use case**: Server-side rendered applications
- **Port**: http://localhost:3000

```bash
cd examples/nextjs
npm install
npm run dev
```

## Running All Examples

From the repository root:

```bash
# Install dependencies for all examples
npm install

# Run Vite example
cd examples/vite-react && npm run dev

# Or run Next.js example
cd examples/nextjs && npm run dev
```

## What to Test

Each example demonstrates the core features specified in the constitution:

1. **Premium Writing Experience** (US1 - Journey A)
   - Type naturally across blocks
   - No focus loss, cursor jumps, or flicker
   - Consistent spacing and typography

2. **Selection-Only Toolbar** (US2 - Journey B)
   - Toolbar appears only on non-empty selection
   - Hidden with cursor-only state
   - Clean hide/show transitions

3. **Block Drag & Drop** (US3 - Journey C)
   - Discoverable drag handles
   - Clear drop indicators
   - Cancel with Escape
   - Stable selection after drop

## Integration Patterns

Both examples show recommended integration patterns:

- **Vite**: Direct client-side integration
- **Next.js**: SSR-safe server component + client-only editor

Choose the example that matches your tech stack and use it as a starting point.
