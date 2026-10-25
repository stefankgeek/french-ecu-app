/**
 * Installation de l'appli sur l'écran d'accueil.
 * - Android / Chrome / Edge (et PC) : bouton « Installer » natif.
 * - iPhone / iPad : Apple n'autorise pas de bouton → on affiche la marche à suivre.
 */
let deferredPrompt = null;
const listeners = new Set();

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** 'native' (bouton dispo) | 'ios' (instructions) | null (déjà installée / impossible) */
export function installMode() {
  if (isStandalone()) return null;
  if (deferredPrompt) return 'native';
  if (isIOS()) return 'ios';
  return null;
}

export function initInstall() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    listeners.forEach((fn) => fn());
  });
}

export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  listeners.forEach((fn) => fn());
  return outcome === 'accepted';
}

export const onInstallChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
