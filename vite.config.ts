import { defineConfig } from 'vite';

// GitHub Pages serves this project from a sub-path:
//   https://jiasheen.github.io/catch-the-living-things/
// so Vite must prefix every built asset URL with the repo name. Without this,
// the page loads but the JS/CSS 404 (a classic "blank Pages deploy" mistake).
// If you fork/rename the repo, change this to '/<your-repo-name>/'.
const REPO_BASE = '/catch-the-living-things/';

export default defineConfig({
  base: REPO_BASE,
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        // Split Phaser (the largest dependency) into its own chunk so it can be
        // cached separately from our game code — repeat visits only re-download
        // the small app bundle when we change gameplay.
        manualChunks: (id) => (id.includes('node_modules/phaser') ? 'phaser' : undefined),
      },
    },
  },
});
