import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  // The MUI minimal sources read Next.js-style `process.env.*` (see
  // src/global-config.ts and src/components/progress-bar). Next injects
  // `process.env`, but Vite's browser runtime does not — without this shim
  // every `process.env` access throws `ReferenceError: process is not defined`
  // at module-eval time and the React tree never mounts (blank page). Map the
  // values Vite knows and expose an empty object so `?? ''` fallbacks take over.
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env': '{}',
  },
}));
