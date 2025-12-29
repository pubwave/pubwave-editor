/**
 * Pubwave Editor Tailwind CSS Plugin
 * 
 * This file exports a Tailwind preset that can be used in your project.
 * 
 * Usage in your tailwind.config.js or tailwind.config.ts:
 * 
 * ```js
 * import pubwavePreset from '@pubwave/editor/tailwind';
 * 
 * export default {
 *   presets: [pubwavePreset],
 *   content: [
 *     './src/**\/*.{js,ts,jsx,tsx}',
 *     './node_modules/@pubwave/editor/dist/**\/*.js',
 *   ],
 *   // ... rest of your config
 * };
 * ```
 */

import type { Config } from 'tailwindcss';

const pubwavePreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        pubwave: {
          bg: 'var(--pubwave-bg, #ffffff)',
          surface: 'var(--pubwave-surface, #ffffff)',
          text: 'var(--pubwave-text, #1a1a1a)',
          'text-muted': 'var(--pubwave-text-muted, #6b7280)',
          border: 'var(--pubwave-border, #e5e7eb)',
          'border-light': 'var(--pubwave-border-light, #f3f4f6)',
          hover: 'var(--pubwave-hover, rgba(0, 0, 0, 0.03))',
          focus: 'var(--pubwave-focus, rgba(0, 0, 0, 0.05))',
          selection: 'var(--pubwave-selection, #3b82f6)',
          'selection-bg': 'var(--pubwave-selection-bg, rgba(59, 130, 246, 0.1))',
          primary: 'var(--pubwave-primary, #3b82f6)',
          'primary-faded': 'var(--pubwave-primary-faded, rgba(59, 130, 246, 0.1))',
          'drop-indicator': 'var(--pubwave-drop-indicator, #3b82f6)',
          'drop-target': 'var(--pubwave-drop-target, rgba(59, 130, 246, 0.05))',
          error: 'var(--pubwave-error, #ef4444)',
          success: 'var(--pubwave-success, #10b981)',
          warning: 'var(--pubwave-warning, #f59e0b)',
        },
      },
      spacing: {
        'pubwave-xs': 'var(--pubwave-spacing-xs, 0.25rem)',
        'pubwave-sm': 'var(--pubwave-spacing-sm, 0.5rem)',
        'pubwave-md': 'var(--pubwave-spacing-md, 1rem)',
        'pubwave-lg': 'var(--pubwave-spacing-lg, 1.5rem)',
        'pubwave-xl': 'var(--pubwave-spacing-xl, 2rem)',
      },
      borderRadius: {
        'pubwave-sm': 'var(--pubwave-radius-sm, 0.25rem)',
        'pubwave': 'var(--pubwave-radius, 0.375rem)',
        'pubwave-lg': 'var(--pubwave-radius-lg, 0.5rem)',
      },
      boxShadow: {
        'pubwave-sm': 'var(--pubwave-shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05))',
        'pubwave': 'var(--pubwave-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06))',
        'pubwave-lg': 'var(--pubwave-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
      },
      fontFamily: {
        pubwave: 'var(--pubwave-font-family, inherit)',
        'pubwave-mono': 'var(--pubwave-font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)',
      },
      fontSize: {
        'pubwave-sm': 'var(--pubwave-font-size-sm, 0.875rem)',
        'pubwave-base': 'var(--pubwave-font-size-base, 1rem)',
        'pubwave-lg': 'var(--pubwave-font-size-lg, 1.125rem)',
        'pubwave-xl': 'var(--pubwave-font-size-xl, 1.25rem)',
        'pubwave-2xl': 'var(--pubwave-font-size-2xl, 1.5rem)',
        'pubwave-3xl': 'var(--pubwave-font-size-3xl, 2rem)',
      },
      lineHeight: {
        'pubwave': 'var(--pubwave-line-height, 1.625)',
        'pubwave-heading': 'var(--pubwave-line-height-heading, 1.25)',
      },
      zIndex: {
        'pubwave-handle': '40',
        'pubwave-toolbar': '50',
        'pubwave-dropdown': '60',
        'pubwave-toast': '100',
      },
      transitionDuration: {
        'pubwave-fast': '100ms',
        'pubwave': '150ms',
      },
      animation: {
        'pubwave-fade-in': 'pubwave-fade-in 0.15s ease-out',
        'pubwave-slide-up': 'pubwave-slide-up 0.15s ease-out',
        'pubwave-cursor-blink': 'pubwave-cursor-blink 1.1s steps(2, start) infinite',
      },
      keyframes: {
        'pubwave-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pubwave-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pubwave-cursor-blink': {
          'to': { visibility: 'hidden' },
        },
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
};

export default pubwavePreset;
