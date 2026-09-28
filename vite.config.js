import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: 'frontend',
  server: {
    proxy: { '/api': 'http://127.0.0.1:43117' },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        login: fileURLToPath(new URL('./frontend/index.html', import.meta.url)),
        cadastro: fileURLToPath(new URL('./frontend/cadastro.html', import.meta.url)),
        questionario: fileURLToPath(new URL('./frontend/questionario.html', import.meta.url)),
      },
    },
  },
});
