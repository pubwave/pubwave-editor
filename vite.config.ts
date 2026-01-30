import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib';

  return {
    plugins: [
      react(),
      ...(isLib
        ? [
            dts({
              tsconfigPath: './tsconfig.build.json',
              rollupTypes: true,
              insertTypesEntry: true,
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: isLib
      ? {
          lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'PubwaveEditor',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
          },
          rollupOptions: {
            external: [
              'react',
              'react-dom',
              'react/jsx-runtime',
              /^@tiptap\//,
              /^prosemirror-/,
              /^chart\.js(\/.*)?$/,
            ],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
              },
              preserveModules: false,
              assetFileNames: (assetInfo) => {
                if (assetInfo.name === 'style.css') {
                  return 'index.css';
                }
                return assetInfo.name || 'asset';
              },
            },
          },
          cssMinify: true,
          cssCodeSplit: false,
        }
      : {
          outDir: 'dist-dev',
        },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['tests/integration/**/*.spec.ts', 'node_modules/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.d.ts', 'src/index.ts'],
      },
    },
  };
});
