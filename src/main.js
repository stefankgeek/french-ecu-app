/**
 * Point d'entrée de French ECU.
 * Ordre : langue + unités → interface → fin de l'écran de démarrage (3 s) → mises à jour.
 */
import '@fontsource/orbitron/700.css';
import './styles/app.css';
import { initI18n } from './core/i18n.js';
import { initUnits } from './core/units.js';
import { initInstall } from './core/install.js';
import { hideSplash } from './core/splash.js';
import { startApp } from './app.js';
import { isInstalledContext, mountGate, platform } from './core/gate.js';
import { initAnalytics, setSuperProps, track, trackLaunch } from './core/analytics.js';
import { askConsentIfNeeded } from './core/consent.js';
import { lang, onLanguageChange } from './core/i18n.js';
import { getSystem, onUnitsChange } from './core/units.js';
import { load, save } from './core/store.js';

async function boot() {
  initInstall();
  initUnits();
  await initI18n();
  // Installation obligatoire : dans un navigateur, seul l'écran « Installer » est proposé.
  // (Exception en développement local pour pouvoir travailler.)
  const installed = isInstalledContext();
  setSuperProps({ app_version: __APP_VERSION__, installed, device: platform(), lang: lang(), units: getSystem() });
  initAnalytics();
  if (installed || import.meta.env.DEV) startApp();
  else mountGate();
  await hideSplash();
  // Statistiques : consentement au premier lancement, puis suivi des réglages et de l'installation
  askConsentIfNeeded();
  if (installed && !load('first_open_done')) { save('first_open_done', true); trackLaunch('app_first_open_installed', { device: platform() }); }
  trackLaunch('app_open', { installed });
  onLanguageChange((code) => { setSuperProps({ lang: code }); track('language_changed', { lang: code }); });
  onUnitsChange(() => { setSuperProps({ units: getSystem() }); track('units_changed', { units: getSystem() }); });
  if (import.meta.env.PROD) {
    const { initUpdates } = await import('./core/update.js');
    initUpdates();
  }
}

boot().catch((err) => {
  console.error(err);
  document.getElementById('splash')?.remove();
  document.getElementById('app').innerHTML = '<p style="padding:24px;color:#fff">Erreur de démarrage / Startup error. Rechargez la page / Please reload.</p>';
});
