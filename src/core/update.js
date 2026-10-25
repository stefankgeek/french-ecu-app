/**
 * Mises à jour automatiques.
 * Quand une nouvelle version est publiée sur GitHub, le téléphone la télécharge en arrière-plan,
 * puis propose « Nouvelle version disponible – Mettre à jour ». Rien n'est imposé.
 * Vérification au lancement, à chaque retour dans l'appli et toutes les heures.
 */
import { registerSW } from 'virtual:pwa-register';
import { banner, toast } from './ui.js';
import { t } from './i18n.js';

export function initUpdates() {
  if (!('serviceWorker' in navigator)) return;
  const updateSW = registerSW({
    onNeedRefresh() {
      banner({ id: 'update-banner', textKey: 'update.available', actionKey: 'update.action', onAction: () => updateSW(true) });
    },
    onOfflineReady() {
      toast(t('update.offline_ready'));
    },
    onRegisteredSW(_url, reg) {
      if (!reg) return;
      const check = () => reg.update().catch(() => {});
      setInterval(check, 60 * 60 * 1000);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    },
  });
}
