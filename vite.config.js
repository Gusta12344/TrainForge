import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: 'frontend',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        login: fileURLToPath(new URL('./frontend/index.html', import.meta.url)),
        cadastro: fileURLToPath(new URL('./frontend/cadastro.html', import.meta.url)),
      },
    },
  },
});
