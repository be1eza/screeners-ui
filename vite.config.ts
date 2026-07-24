import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// GitHub Pages project site is served under /<repo>/ — this MUST match the repo name,
// or the built asset URLs 404. Change here if the repo is renamed.
const REPO = 'screeners-ui';

// https://vite.dev/config/
export default defineConfig({
  base: `/${REPO}/`,
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
