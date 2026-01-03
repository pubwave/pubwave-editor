import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      '@pubwave/editor': resolve(__dirname, '../../src/index.ts'),
    },
  },
});
