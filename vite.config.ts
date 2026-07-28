import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    appType: 'spa' as const,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          // A single vendor chunk, not split further by package. The
          // previous attempt split react into its own vendor-react chunk
          // alongside a catch-all vendor chunk, which created a circular
          // reference between the two (vendor -> vendor-react -> vendor)
          // that surfaced as `createContext` being undefined at runtime.
          // One undivided vendor chunk still gets the real caching win
          // (vendor code changes far less often than app code, so it stays
          // cached across app-only redeploys) without any inter-vendor-
          // chunk ordering to get wrong.
          manualChunks(id) {
            if (id.includes('node_modules')) return 'vendor';
          },
        },
      },
    },
  };
});
