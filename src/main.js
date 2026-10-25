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
import { isInstalledContext, mountGate } from './core/gate.js';

async function boot() {
  initInstall();
  initUnits();
  await initI18n();
  // Installation obligatoire : dans un navigateur, seul l'écran « Installer » est proposé.
  // (Exception en développement local pour pouvoir travailler.)
  if (isInstalledContext() || import.meta.env.DEV) startApp();
  else mountGate();
  await hideSplash();
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
