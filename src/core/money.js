/**
 * Devises : devise par défaut selon le pays du téléphone + affichage au format local.
 * (Utilisé pour les calculs d'économies — aucun paiement dans l'appli.)
 */
import { lang } from './i18n.js';
import { getLanguage } from './i18n-core.js';

export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'PLN', 'TRY', 'MAD', 'DZD', 'TND', 'AED', 'SAR', 'BRL'];

const BY_REGION = {
  US: 'USD', GB: 'GBP', CH: 'CHF', CA: 'CAD', PL: 'PLN', TR: 'TRY', MA: 'MAD', DZ: 'DZD', TN: 'TND',
  AE: 'AED', SA: 'SAR', BR: 'BRL',
};

/** Devise par défaut d'après la région du téléphone (euro sinon). */
export function defaultCurrency() {
  const tag = (typeof navigator !== 'undefined' && (navigator.languages?.[0] || navigator.language)) || '';
  const region = (tag.split('-')[1] || '').toUpperCase();
  return BY_REGION[region] || 'EUR';
}

const loc = () => getLanguage(lang()).locale;

/** Symbole court (€, $, £, zł…). */
export function currencySymbol(code) {
  try {
    return new Intl.NumberFormat(loc(), { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
      .formatToParts(0).find((p) => p.type === 'currency')?.value || code;
  } catch { return code; }
}

/** Montant formaté (« 1 234 € », « $1,234 »). */
export function money(value, code, decimals = 0) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(loc(), { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol', maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(value);
}
