import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    fs: {
      allow: [
        new URL('../../library/', import.meta.url).pathname,
        new URL('../../', import.meta.url).pathname
      ]
    }
  },
  build: {
    sourcemap: true
  },
  publicDir: new URL('public', import.meta.url).pathname
});


