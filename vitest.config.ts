import path from 'path';
import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts (which defineConfig from 'vite' doesn't type
// the `test` field for) so `tsc --noEmit` stays clean either way.
//
// No @vitejs/plugin-react here deliberately: Vite's built-in esbuild JSX
// transform (driven by tsconfig's "jsx": "react-jsx") already compiles
// .tsx test files fine for a one-shot test run with no HMR involved, and
// pulling the plugin in caused a real type conflict between the root
// `vite` and vitest's own bundled peer `vite` (two copies, incompatible
// Plugin<T> types) -- confirmed by removing it and re-running `tsc --noEmit`.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: false,
    // Default excludes only cover node_modules/dist/etc, not nested project
    // trees -- a background-agent worktree under .claude/worktrees has its
    // own copies of every *.test.tsx file, which the default include glob
    // picks up and runs alongside the real ones, corrupting results with
    // duplicate/racing DOM state.
    exclude: ['**/node_modules/**', '**/dist/**', '.claude/worktrees/**'],
  },
});
