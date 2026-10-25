/**
 * Génère le logo French ECU (SVG) et toutes les icônes PNG de l'appli.
 * Usage : node scripts/logo.mjs
 * Le logo est dessiné en formes géométriques (aucune police requise).
 */
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';

// Contenu central : puce ECU + monogramme "FE" + bande tricolore
const mark = (s = 1) => `
  <g transform="translate(256 256) scale(${s}) translate(-256 -256)">
    <!-- Broches de la puce -->
    <g fill="url(#pin)">
      ${[176, 224, 272, 320].map(p => `
      <rect x="${p - 9}" y="74" width="18" height="44" rx="5"/>
      <rect x="${p - 9}" y="394" width="18" height="44" rx="5"/>
      <rect x="74" y="${p - 9}" width="44" height="18" rx="5"/>
      <rect x="394" y="${p - 9}" width="44" height="18" rx="5"/>`).join('')}
    </g>
    <!-- Corps de la puce -->
    <rect x="118" y="118" width="276" height="276" rx="44" fill="#111318" stroke="url(#grad)" stroke-width="14"/>
    <rect x="140" y="140" width="232" height="232" rx="30" fill="none" stroke="#00d4ff" stroke-opacity=".18" stroke-width="2"/>
    <!-- Monogramme F -->
    <g fill="url(#grad)">
      <rect x="168" y="182" width="30" height="148" rx="6"/>
      <rect x="168" y="182" width="78" height="28" rx="6"/>
      <rect x="168" y="242" width="64" height="26" rx="6"/>
    <!-- Monogramme E -->
      <rect x="264" y="182" width="30" height="148" rx="6"/>
      <rect x="264" y="182" width="80" height="28" rx="6"/>
      <rect x="264" y="242" width="66" height="26" rx="6"/>
      <rect x="264" y="302" width="80" height="28" rx="6"/>
    </g>
    <!-- Bande tricolore -->
    <rect x="200" y="346" width="37" height="10" rx="3" fill="#2f6bff"/>
    <rect x="237" y="346" width="38" height="10" fill="#f4f6fa"/>
    <rect x="275" y="346" width="37" height="10" rx="3" fill="#ff3b4a"/>
  </g>`;

const defs = `
  <defs>
    <linearGradient id="grad" gradientUnits="userSpaceOnUse" x1="118" y1="118" x2="394" y2="394">
      <stop offset="0" stop-color="#4a90e2"/><stop offset="1" stop-color="#00d4ff"/>
    </linearGradient>
    <linearGradient id="pin" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7d8799"/><stop offset="1" stop-color="#c9d3e3"/>
    </linearGradient>
    <radialGradient id="glow" cx=".5" cy=".42" r=".65">
      <stop offset="0" stop-color="#123a5c"/><stop offset=".55" stop-color="#0b1220"/><stop offset="1" stop-color="#05070b"/>
    </radialGradient>
  </defs>`;

// Icône standard : carré arrondi
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}
  <rect width="512" height="512" rx="112" fill="url(#glow)"/>${mark(1)}</svg>`;
// Icône "maskable" (Android) : fond plein, motif réduit dans la zone sûre (80 %)
const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}
  <rect width="512" height="512" fill="url(#glow)"/>${mark(0.78)}</svg>`;
// Logo seul (fond transparent) pour l'écran de démarrage
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}${mark(1)}</svg>`;

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon.svg', iconSvg);
writeFileSync('public/favicon.svg', iconSvg);
writeFileSync('public/icons/logo-mark.svg', markSvg);

const out = [
  ['icon-48.png', iconSvg, 48], ['icon-72.png', iconSvg, 72], ['icon-96.png', iconSvg, 96],
  ['icon-144.png', iconSvg, 144], ['icon-192.png', iconSvg, 192], ['icon-512.png', iconSvg, 512],
  ['maskable-192.png', maskSvg, 192], ['maskable-512.png', maskSvg, 512],
  ['apple-touch-icon.png', maskSvg, 180], ['favicon-32.png', iconSvg, 32],
];
for (const [name, svg, size] of out) {
  await sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toFile(`public/icons/${name}`);
}
console.log('Icônes générées :', out.length);
