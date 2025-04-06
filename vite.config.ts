import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Configure assets to be copied to the dist folder
  build: {
    outDir: 'dist',
  },
  // Configure server to handle static assets
  server: {
    watch: {
      usePolling: true,
    },
  },
  // Use public directory for static assets
  publicDir: 'public',
});
