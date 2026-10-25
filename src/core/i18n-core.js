/**
 * Cœur du système multilingue — fonctions pures, sans DOM (testables).
 *
 * Règles :
 *  - Chaîne de secours : langue choisie → anglais → français.
 *    Jamais de nom de clé technique affiché à l'utilisateur en production.
 *  - Variables : "Bonjour {name}"  → t('hello', { name: 'Stef' })
 *  - Pluriels  : { "one": "{count} calcul", "other": "{count} calculs" }
 *    (règles officielles de chaque langue via Intl.PluralRules : le polonais
 *    et l'arabe ont plusieurs formes de pluriel, c'est géré automatiquement)
 */

/** Langues disponibles. Ajouter une langue = ajouter une ligne + ses fichiers JSON. */
export const LANGUAGES = [
  { code: 'fr', name: 'Français', locale: 'fr-FR', dir: 'ltr' },
  { code: 'en', name: 'English', locale: 'en-GB', dir: 'ltr' },
  { code: 'es', name: 'Español', locale: 'es-ES', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', locale: 'de-DE', dir: 'ltr' },
  { code: 'it', name: 'Italiano', locale: 'it-IT', dir: 'ltr' },
  { code: 'pt', name: 'Português', locale: 'pt-PT', dir: 'ltr' },
  { code: 'nl', name: 'Nederlands', locale: 'nl-NL', dir: 'ltr' },
  { code: 'pl', name: 'Polski', locale: 'pl-PL', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', locale: 'tr-TR', dir: 'ltr' },
  { code: 'ar', name: 'العربية', locale: 'ar', dir: 'rtl' },
];

export const FALLBACK_CHAIN = ['en', 'fr'];

export const getLanguage = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[1];

/**
 * Choisit la langue au premier lancement d'après les préférences du téléphone.
 * @param {string[]} preferred ex. navigator.languages = ['pt-BR', 'en-US']
 */
export function detectLanguage(preferred = []) {
  for (const tag of preferred) {
    const base = String(tag).toLowerCase().split('-')[0];
    if (LANGUAGES.some((l) => l.code === base)) return base;
  }
  return 'en';
}

/** Lit une clé "a.b.c" dans un dictionnaire imbriqué. */
function lookup(dict, key) {
  if (!dict) return undefined;
  if (key in dict) return dict[key];
  return key.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), dict);
}

/** Remplace {variables} dans un texte. */
export function interpolate(text, params = {}) {
  return String(text).replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m));
}

/**
 * Traduit une clé.
 * @param {Record<string, object>} dicts dictionnaires chargés par langue { fr: {...}, en: {...} }
 * @param {string} lang langue active
 * @param {string} key clé ("menu.title")
 * @param {object} params variables (+ count pour les pluriels)
 * @param {(key:string, lang:string)=>void} [onMissing] appelé si la clé manque dans la langue active
 */
export function translate(dicts, lang, key, params = {}, onMissing) {
  const chain = [lang, ...FALLBACK_CHAIN.filter((l) => l !== lang)];
  for (let i = 0; i < chain.length; i++) {
    let value = lookup(dicts[chain[i]], key);
    if (value === undefined) continue;
    if (i > 0 && onMissing) onMissing(key, lang);
    if (value && typeof value === 'object') {
      // Pluriel
      const count = Number(params.count ?? 0);
      const rule = new Intl.PluralRules(getLanguage(chain[i]).locale).select(count);
      value = value[rule] ?? value.other ?? '';
      params = { ...params, count: formatNumber(count, chain[i]) };
    }
    return interpolate(value, params);
  }
  if (onMissing) onMissing(key, lang);
  return key; // ne devrait jamais arriver : le script check-i18n bloque la publication
}

/**
 * Affiche un nombre au format de la langue (virgule ou point décimal, séparateur de milliers).
 * @param {number} value
 * @param {string} lang
 * @param {{decimals?:number, min?:number}} [opts] decimals = nb max de décimales
 */
export function formatNumber(value, lang, opts = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const { decimals = 2, min = 0 } = opts;
  return new Intl.NumberFormat(getLanguage(lang).locale, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: Math.min(min, decimals),
  }).format(Number(value));
}

/**
 * Lit un nombre tapé par l'utilisateur, quel que soit son format :
 * "2,5"  "2.5"  "1 234,5"  "1,234.5"  "1.234,5"  "٢٫٥" (chiffres arabes).
 * @returns {number} NaN si la saisie n'est pas un nombre
 */
export function parseNumber(input) {
  if (typeof input === 'number') return input;
  if (input === null || input === undefined) return NaN;
  let s = String(input).trim();
  if (!s) return NaN;
  // Chiffres arabes / persans → chiffres latins
  s = s.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
       .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
       .replace(/٫/g, '.')            // séparateur décimal arabe
       .replace(/[٬\s  ']/g, '') // séparateurs de milliers / espaces
       .replace(/^−/, '-');           // signe moins typographique
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > -1 && lastDot > -1) {
    // Les deux sont présents : le dernier est le séparateur décimal
    const dec = lastComma > lastDot ? ',' : '.';
    const thou = dec === ',' ? '.' : ',';
    s = s.split(thou).join('').replace(dec, '.');
  } else if (lastComma > -1) {
    // Une seule virgule = décimale ; plusieurs = milliers
    s = (s.match(/,/g).length === 1) ? s.replace(',', '.') : s.split(',').join('');
  } else if (lastDot > -1 && s.match(/\./g).length > 1) {
    s = s.split('.').join('');
  }
  if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN;
  return Number(s);
}
