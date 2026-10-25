/**
 * Configuration Vite + PWA de French ECU.
 *
 * - base './' : chemins relatifs → fonctionne sur GitHub Pages (sous-dossier)
 *   ET plus tard dans une appli Capacitor (Android / iOS) sans modification.
 * - registerType 'prompt' : une nouvelle version n'est jamais imposée,
 *   l'utilisateur voit « Nouvelle version disponible – Mettre à jour ».
 */
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)));

export default defineConfig({
  base: './',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    target: 'es2019', // compatible iOS 13+ / Android 7+
    sourcemap: false,
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      injectRegister: false, // enregistrement manuel dans src/core/update.js
      includeAssets: ['favicon.svg', 'icons/*.png', 'icons/*.svg'],
      manifest: {
        id: './',
        name: 'French ECU',
        short_name: 'French ECU',
        description: 'Simulateurs de préparation moteur et aide-mémoire technique',
        lang: 'fr',
        dir: 'auto',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#05070b',
        theme_color: '#0a0a0a',
        categories: ['utilities', 'productivity'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tout est mis en cache → l'appli fonctionne entièrement hors connexion
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    environment: 'node',
  },
});
