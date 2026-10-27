import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset paths relative, so the build works on Vercel and on GitHub Pages sub-paths.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Vendor chunks cache well across deploys. three.js is only reached through lazy imports,
        // so it downloads after the page content is already on screen.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/node_modules\/three\//.test(id)) return 'three';
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          if (/node_modules\/(gsap|@gsap)\//.test(id)) return 'gsap';
          return undefined;
        },
      },
    },
  },
});
