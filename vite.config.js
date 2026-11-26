import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function copyLegacyAssets() {
  const filesToCopy = [
    'furniture-library.js',
    'canvas-engine.js',
    'three-engine.js',
    'app.js',
    'style.css',
    'favicon.svg',
  ];

  return {
    name: 'copy-legacy-assets',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      for (const file of filesToCopy) {
        const src = path.resolve(__dirname, file);
        const dest = path.resolve(distDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      }

      const libSrc = path.resolve(__dirname, 'lib');
      const libDest = path.resolve(distDir, 'lib');
      if (fs.existsSync(libSrc)) {
        fs.cpSync(libSrc, libDest, { recursive: true });
      }
    },
  };
}

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [copyLegacyAssets()],
});
