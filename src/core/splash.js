/**
 * Écran de démarrage : logo affiché 2 secondes minimum, puis fondu vers le menu.
 * Affiché une seule fois par lancement de l'appli (pas à chaque changement de page).
 */
const MIN_DURATION_MS = 2000;
const SESSION_KEY = 'fe:splash-seen';

export function hideSplash() {
  const el = document.getElementById('splash');
  if (!el) return Promise.resolve();

  let alreadySeen = false;
  try { alreadySeen = sessionStorage.getItem(SESSION_KEY) === '1'; } catch { /* ignore */ }

  // Temps déjà écoulé depuis l'ouverture de la page
  const elapsed = performance.now();
  const wait = alreadySeen ? 0 : Math.max(0, MIN_DURATION_MS - elapsed);

  return new Promise((resolve) => {
    setTimeout(() => {
      el.classList.add('is-hidden');
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
      setTimeout(() => { el.remove(); resolve(); }, 450);
    }, wait);
  });
}
