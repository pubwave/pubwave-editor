import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@pubwave/editor': resolve(__dirname, '../../src/index.ts'),
      '@pubwave/editor/styles.css': resolve(__dirname, '../../src/styles.css'),
    },
  },
});
