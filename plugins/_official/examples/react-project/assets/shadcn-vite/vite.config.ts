import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// `base: './'` keeps the built asset URLs relative, so `dist/` can be served
// from any path — which is how the workspace preview loads it.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { src: path.resolve(__dirname, 'src') },
  },
});
