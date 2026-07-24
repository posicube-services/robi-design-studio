import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the built `dist/` works when loaded from a file path or a
// nested daemon static route (Open Design's static preview serves it without a
// fixed origin). Single-file-friendly output keeps the preview simple.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
