import { defineConfig } from 'vite';
import path from 'node:path';

// Relative paths so the build runs from /games/jimmyx/ (or any folder). The shared
// QuickBASIC runtime lives two folders up, so the dev server may serve from there too.
export default defineConfig({
  base: './',
  build: { target: 'es2022' },
  server: { fs: { allow: [path.resolve(__dirname, '../..')] } },
});
