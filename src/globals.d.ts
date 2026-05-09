/**
 * Ambient module declarations for non-TS assets bundled with the library.
 *
 * Lets TypeScript accept side-effect imports of CSS files both inside the
 * library and in external consumers that import directly from `src/`
 * during development.
 */

declare module '*.css';
