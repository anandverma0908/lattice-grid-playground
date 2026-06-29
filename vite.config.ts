import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@lattice-grid-lib/core': path.resolve(__dirname, '../lattice-grid/src/index.ts'),
    },
  },
  server: {
    port: 5174,
  },
});
