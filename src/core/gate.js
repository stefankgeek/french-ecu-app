/**
 * Installation obligatoire : l'appli n'est utilisable qu'une fois installée (icône sur l'écran
 * d'accueil, ou fenêtre d'appli sur PC). Ouverte dans un navigateur, elle n'affiche qu'un écran
 * « Installer French ECU » adapté à l'appareil. Décision de Stéphane du 25/10/2026.
 *
 * Remarque : c'est un verrou d'usage (côté navigateur), pas une protection absolue.
 * Les futures applis des stores (Capacitor) passent automatiquement.
 */
import { t, lang, setLanguage, LANGUAGES, onLanguageChange } from './i18n.js';
import { esc } from './ui.js';
import { isStandalone, isIOS, installMode, promptInstall, onInstallChange } from './install.js';

const DISPLAY_MODES = ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay'];

/** L'appli tourne-t-elle installée (ou dans une appli native des stores) ? */
export function isInstalledContext() {
  if (window.Capacitor?.isNativePlatform?.()) return true;
  if (isStandalone()) return true;
  return DISPLAY_MODES.some((m) => window.matchMedia(`(display-mode: ${m})`).matches);
}

/** Type d'appareil / navigateur pour choisir les bonnes explications. */
export function platform(ua = navigator.userAgent) {
  if (/FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|Snapchat|TikTok|musical_ly|LinkedInApp|Twitter|; wv\)/i.test(ua)) return 'inapp';
  if (/iphone|ipad|ipod/i.test(ua) || (ua === navigator.userAgent && isIOS())) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Firefox\//i.test(ua)) return 'unsupported';
  if (/Macintosh/i.test(ua) && /Safari\//i.test(ua) && !/Chrome|Chromium|Edg\//i.test(ua)) return 'mac_safari';
  if (/Chrome|Chromium|Edg\//i.test(ua)) return 'desktop';
  return 'unsupported';
}

let justInstalled = false;

function stepsHtml(key) {
  return `<ol class="gate__steps">${[1, 2, 3].map((n) => `<li>${esc(t(`gate.${key}_s${n}`))}</li>`).join('')}</ol>`;
}

function body() {
  if (justInstalled) return `<p class="note is-ok">${esc(t('gate.installed'))}</p>`;
  const p = platform();
  if (p === 'inapp') {
    return `<h2 class="gate__subtitle">${esc(t('gate.inapp_title'))}</h2>
      <p>${esc(t('gate.inapp_text'))}</p>
      <button class="btn btn--primary gate__btn" data-act="copy">${esc(t('gate.copy'))}</button>`;
  }
  if (p === 'unsupported') return `<p class="note is-warn">${esc(t('gate.unsupported'))}</p>`;
  if (installMode() === 'native') {
    return `<button class="btn btn--primary gate__btn" data-act="install">${esc(t('gate.install_btn'))}</button>
      <p class="hint">${esc(t('gate.native_hint'))}</p>`;
  }
  const key = { ios: 'ios', android: 'android', mac_safari: 'mac', desktop: 'desktop' }[p];
  return `<h2 class="gate__subtitle">${esc(t('gate.how'))}</h2>${stepsHtml(key)}`;
}

/** Affiche l'écran d'installation à la place de l'appli. */
export function mountGate(root = document.getElementById('app')) {
  const render = () => {
    root.innerHTML = `
      <main class="gate">
        <div class="gate__card">
          <img class="gate__logo" src="${import.meta.env.BASE_URL}icons/icon-192.png" alt="" width="96" height="96" />
          <h1 class="gate__title">${esc(t('gate.title'))}</h1>
          <p class="gate__intro">${esc(t('gate.intro'))}</p>
          <ul class="gate__benefits">
            <li>${esc(t('gate.benefit_offline'))}</li>
            <li>${esc(t('gate.benefit_updates'))}</li>
            <li>${esc(t('gate.benefit_free'))}</li>
          </ul>
          <div class="gate__body">${body()}</div>
          <p class="hint gate__already">${esc(t('gate.already'))}</p>
          <label class="gate__lang">
            <span>${esc(t('gate.language'))}</span>
            <select>${LANGUAGES.map((l) => `<option value="${l.code}" ${l.code === lang() ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select>
          </label>
        </div>
      </main>`;
    root.querySelector('.gate__lang select').addEventListener('change', (e) => setLanguage(e.target.value));
    root.querySelector('[data-act="install"]')?.addEventListener('click', async () => {
      if (await promptInstall()) { justInstalled = true; render(); }
    });
    root.querySelector('[data-act="copy"]')?.addEventListener('click', async (e) => {
      try { await navigator.clipboard.writeText(location.href.split('#')[0]); e.target.textContent = t('gate.copied'); }
      catch { window.prompt(t('gate.copy'), location.href.split('#')[0]); }
    });
  };
  render();
  onLanguageChange(render);
  onInstallChange(render);
  window.addEventListener('appinstalled', () => { justInstalled = true; render(); });
  // Si l'utilisateur ouvre l'appli installée dans cet onglet (Chrome le propose), on bascule.
  window.matchMedia('(display-mode: standalone)').addEventListener?.('change', (e) => { if (e.matches) location.reload(); });
}
