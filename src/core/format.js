/**
 * Affichage des valeurs physiques : conversion vers l'unité choisie + format de la langue.
 * Les petites valeurs gardent assez de décimales pour rester lisibles (0,0034 bar ≠ 0,00 bar).
 */
import { fmt, t } from './i18n.js';
import { getUnit, fromBase, unitInfo } from './units.js';

/** Nombre de décimales pour garder ~3 chiffres significatifs sur les petites valeurs. */
export function smartDecimals(value, decimals) {
  const a = Math.abs(value);
  if (!a || !Number.isFinite(a) || a >= 1) return decimals;
  return Math.max(decimals, Math.min(6, 2 - Math.floor(Math.log10(a))));
}

/** Symbole d'unité (traduit pour les unités « texte » comme tr/min). */
export function symbolOf(quantityOrUnit) {
  if (!quantityOrUnit) return '';
  if (quantityOrUnit.startsWith('u:')) return t(`unit.${quantityOrUnit.slice(2)}`);
  return unitInfo(quantityOrUnit, getUnit(quantityOrUnit)).symbol;
}

/** Valeur de base → valeur affichée (nombre) dans l'unité choisie. */
export function toDisplay(quantity, base, opts) {
  if (!quantity || quantity.startsWith('u:')) return base;
  return fromBase(quantity, base, getUnit(quantity), opts);
}

/**
 * Formate une valeur de base pour l'affichage.
 * @param {string} quantity grandeur ('pressure'…) ou unité fixe 'u:percent', 'u:ms'…
 * @param {number} base valeur en unité de base
 * @param {{decimals?:number, withUnit?:boolean, opts?:object}} [o]
 */
export function formatQ(quantity, base, o = {}) {
  if (base === null || base === undefined || !Number.isFinite(base)) return '—';
  const display = toDisplay(quantity, base, o.opts);
  let decimals = o.decimals;
  if (decimals === undefined) {
    decimals = quantity && !quantity.startsWith('u:') ? unitInfo(quantity, getUnit(quantity)).decimals : 2;
  }
  const text = fmt(display, { decimals: smartDecimals(display, decimals) });
  if (o.withUnit === false) return text;
  const sym = symbolOf(quantity);
  return sym ? `${text} ${sym}` : text;
}
