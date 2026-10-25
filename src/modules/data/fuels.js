/**
 * Base de données carburants — reprise à l'identique de l'ancien site (fuel_database.js).
 * Champs : ron, mon, density (kg/L), bsfc (lb/hp·h), pci (MJ/kg), afr (rapport air/carburant
 * stœchiométrique — appelé « lambda » dans l'ancien fichier), ethanol (%), viscosity (Pa·s à 20 °C).
 */
import { t } from '../../core/i18n.js';

import { FUELS } from './fuels-data.js';

export { FUELS };


const CATEGORY_ORDER = ['standard', 'premium', 'race', 'ethanol', 'diesel', 'methanol', 'special'];

/** Nom affiché (traduit pour les carburants génériques). */
export const fuelName = (key) => {
  const f = FUELS[key];
  return f.name || t(`fuels.${f.nameKey}`, { ron: f.ron });
};

/** Liste groupée pour un menu déroulant. @param {string[]} [only] limiter à certaines clés */
export function fuelOptions(only) {
  return CATEGORY_ORDER.map((cat) => ({
    group: t(`fuel_cat.${cat}`),
    items: Object.keys(FUELS).filter((k) => FUELS[k].category === cat && (!only || only.includes(k))).map((k) => ({ value: k, label: fuelName(k) })),
  })).filter((g) => g.items.length);
}
