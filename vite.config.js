import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Relative base for GitHub Pages compatibility
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
});
