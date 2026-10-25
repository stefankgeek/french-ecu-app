/**
 * Icônes de l'appli (traits SVG 24×24, dessinées pour French ECU — aucune dépendance).
 * Usage : icon('turbo') → chaîne SVG
 */
const P = {
  injector: '<path d="M9 2h6v5H9z"/><path d="M10 7h4v9l-2 3-2-3z"/><path d="M8 21l2-2M16 21l-2-2M12 22v-3"/>',
  pump: '<rect x="4" y="6" width="12" height="14" rx="2"/><path d="M8 10h4M16 9h2a2 2 0 0 1 2 2v5a1 1 0 0 0 2 0V8l-2-3"/><path d="M7 3h6v3H7z"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>',
  lambda: '<path d="M6 21l6-12M8 3h2l8 18"/><circle cx="19" cy="6" r="2"/>',
  bottle: '<rect x="7" y="7" width="10" height="15" rx="3"/><path d="M10 7V4h4v3M10 2h4"/><path d="M7 13h10"/>',
  turbo: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 4c2 3 2 5 0 6M20 12c-3 2-5 2-6 0M12 20c-2-3-2-5 0-6M4 12c3-2 5-2 6 0"/>',
  gauge: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/><circle cx="12" cy="16" r="1.5"/><path d="M6 19h12"/>',
  cooler: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M11 5v14M15 5v14M19 5v14"/>',
  exhaust: '<path d="M2 12h10l3-3h4a3 3 0 0 1 0 6h-4l-3-3"/><path d="M5 8c0-2 2-2 2-4M9 8c0-2 2-2 2-4"/>',
  piston: '<rect x="6" y="3" width="12" height="8" rx="2"/><path d="M6 6h12M10 11l-1 6M14 11l1 6"/><circle cx="12" cy="19" r="2.5"/>',
  cam: '<path d="M12 3c4 0 7 3.5 7 8s-3 10-7 10-7-5.5-7-10 3-8 7-8z"/><circle cx="12" cy="10" r="2.5"/>',
  speed: '<path d="M3 17a9 9 0 0 1 18 0"/><path d="M12 17l5-6"/><path d="M6 13l1 1M12 8v1.5M18 13l-1 1"/>',
  spring: '<path d="M8 3h8M8 21h8M8 6l8 2-8 2 8 2-8 2 8 2-8 2"/>',
  ring: '<path d="M18.5 8A8 8 0 1 0 20 12"/><path d="M15.5 9.5A4 4 0 1 0 16 12"/>',
  conrod: '<circle cx="12" cy="5" r="2.5"/><circle cx="12" cy="18" r="4"/><circle cx="12" cy="18" r="1.5"/><path d="M10.5 7l-1 7.5M13.5 7l1 7.5"/>',
  wave: '<path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0"/><path d="M2 20h20"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><path d="M10 10h4v4h-4z"/>',
  brake: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M16 5.5A8 8 0 0 1 19.5 10"/><path d="M5 12h1M18 12h1M12 5v1M12 18v1"/>',
  oil: '<path d="M3 14l4-4h6l2 2 6-3-6 7H5z"/><path d="M19 15s1.5 1.8 1.5 3a1.5 1.5 0 0 1-3 0c0-1.2 1.5-3 1.5-3z"/>',
  book: '<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
};

export const icon = (name, cls = 'ico') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.chip}</svg>`;
