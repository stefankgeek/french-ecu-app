/**
 * Multilingue — couche appli (chargement des fichiers, DOM, changement instantané).
 *
 * Organisation des textes :
 *   src/locales/<langue>.json                              → textes communs (menu, réglages…)
 *   src/modules/<groupe>/<module>/locales/<langue>.json    → textes d'un simulateur,
 *                                                            accessibles sous "<module>.cle"
 * Seules la langue active et les langues de secours sont chargées (appli légère).
 */
import { LANGUAGES, FALLBACK_CHAIN, detectLanguage, getLanguage, translate, formatNumber, parseNumber } from './i18n-core.js';
import { load, save } from './store.js';

const coreFiles = import.meta.glob('../locales/*.json');
const moduleFiles = import.meta.glob('../modules/*/*/locales/*.json');

const dicts = {};
const loaded = new Set();
const listeners = new Set();
let current = 'fr';

async function loadLanguage(lang) {
  if (loaded.has(lang)) return;
  const dict = {};
  const core = coreFiles[`../locales/${lang}.json`];
  if (core) Object.assign(dict, (await core()).default);
  await Promise.all(Object.entries(moduleFiles).map(async ([path, importer]) => {
    const m = path.match(/modules\/[^/]+\/([^/]+)\/locales\/([a-z]{2})\.json$/);
    if (m && m[2] === lang) dict[m[1]] = (await importer()).default;
  }));
  dicts[lang] = dict;
  loaded.add(lang);
}

/** Langue active. */
export const lang = () => current;
export { LANGUAGES };

/** Traduction : t('menu.title'), t('results.count', { count: 3 }) */
export function t(key, params) {
  return translate(dicts, current, key, params, import.meta.env.DEV
    ? (k, l) => console.warn(`[i18n] clé manquante "${k}" (${l})`)
    : undefined);
}

/** Nombre au format de la langue active. */
export const fmt = (value, opts) => formatNumber(value, current, opts);
export { parseNumber };

/** Démarrage : langue enregistrée, sinon langue du téléphone. */
export async function initI18n() {
  const saved = load('lang');
  const code = saved && LANGUAGES.some((l) => l.code === saved) ? saved : detectLanguage(navigator.languages || [navigator.language]);
  await setLanguage(code, { persist: false });
}

/** Change la langue instantanément (sans recharger la page, valeurs saisies conservées). */
export async function setLanguage(code, { persist = true } = {}) {
  await Promise.all([code, ...FALLBACK_CHAIN].map(loadLanguage));
  current = code;
  if (persist) save('lang', code);
  const { dir, locale } = getLanguage(code);
  document.documentElement.lang = locale;
  document.documentElement.dir = dir; // l'arabe passe automatiquement de droite à gauche
  translateDom(document);
  listeners.forEach((fn) => fn(code));
}

/** Prévenir un composant quand la langue change (graphiques, PDF…). */
export function onLanguageChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Traduit le HTML :
 *   <h1 data-i18n="menu.title"></h1>
 *   <input data-i18n-attr="placeholder:search.placeholder,aria-label:search.label">
 */
export function translateDom(root) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      el.setAttribute(attr, t(key));
    });
  });
}
