import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: {
    host: true,
    fs: {
      allow: [
        resolve(__dirname, '../../library'),
        resolve(__dirname, '../../')
      ]
    }
  },
  build: {
    sourcemap: true
  },
  publicDir: resolve(__dirname, 'public')
});


