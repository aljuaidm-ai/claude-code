import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `--mode artifact` inlines everything into one HTML file for sharing as a single page.
export default defineConfig(({ mode }) => ({
  plugins: mode === 'artifact' ? [react(), viteSingleFile()] : [react()],
  build: { outDir: mode === 'artifact' ? 'dist-artifact' : 'dist' },
}));
