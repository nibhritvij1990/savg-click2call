import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      name: 'SavgClick2Call',
      fileName: (format) => (format === 'es' ? 'click2call.esm.js' : 'click2call.umd.js'),
      formats: ['es', 'umd']
    },
    rollupOptions: {}
  },
  publicDir: 'public'
});


