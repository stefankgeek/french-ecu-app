/**
 * Navigation par « # » dans l'adresse (#/, #/outil/turbo, #/reglages).
 * Choix volontaire : fonctionne sur GitHub Pages, hors connexion et dans Capacitor
 * sans aucune configuration serveur.
 */
const routes = [];
let notFound = () => {};

export function route(pattern, handler) {
  // "/outil/:id" → /^\/outil\/([^/]+)$/
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  routes.push({ re, keys, handler });
}

export const fallback = (handler) => { notFound = handler; };
export const navigate = (path) => { location.hash = '#' + path; };
/** Chemin sans les paramètres (#/outil/turbo?v=… → /outil/turbo). */
export const currentPath = () => decodeURI(location.hash.replace(/^#/, '').split('?')[0]) || '/';
/** Paramètres après le « ? » (lien de partage d'un calcul). */
export const currentQuery = () => new URLSearchParams(location.hash.split('?')[1] || '');

function resolve() {
  const path = currentPath();
  for (const { re, keys, handler } of routes) {
    const m = path.match(re);
    if (m) {
      const params = Object.fromEntries(keys.map((k, i) => [k, m[i + 1]]));
      return handler(params);
    }
  }
  return notFound();
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
