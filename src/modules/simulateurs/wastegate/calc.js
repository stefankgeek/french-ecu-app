/**
 * Wastegate & pression de suralimentation.
 *
 * L'ancien site (wastegate_boost.php) donnait des résultats inutilisables, corrigés ici
 * (validation générale de Stéphane du 25/10/2026) :
 *  1. Dimensionnement : « 70 CFM par mm² » appliqué à TOUT le débit d'échappement → soupape
 *     recommandée d'environ 3 mm et toute wastegate jugée « surdimensionnée ». Remplacé par une règle
 *     empirique étalonnée sur les guides des fabricants : Ø 38 mm ≈ 450 hp à 1 bar ; le diamètre requis
 *     croît avec √puissance et diminue quand la pression augmente (le gaz traverse la soupape sous une
 *     pression plus forte et la turbine a besoin de plus d'énergie).
 *  2. Ressort : sans contrôleur, la pression obtenue = pression du ressort → ressort = pression visée.
 *     Avec contrôleur (manuel ou électronique) : ressort ≈ 70 % de la cible (et ≥ 50 %).
 *  3. Pression obtenue avec contrôleur = cible, dans la limite d'environ 2 × la pression du ressort
 *     (l'ancien site appliquait des facteurs arbitraires ×1,3 et +0,5 bar).
 *  4. Rapport cyclique électronique estimé entre 0 % (pression ressort) et 100 % (≈ 2 × ressort).
 *     Une soupape plus grande que nécessaire reste acceptable (seulement signalée au-delà de 2 × la surface).
 *  5. « Boost creep » : présenté comme un niveau de risque selon la capacité de la soupape, au lieu
 *     d'une valeur en bar inventée ; régime d'ouverture et courbe de boost supprimés (ils dépendent
 *     de la turbine, inconnue ici).
 */
export const REF_DIAMETER_MM = 38;
export const REF_POWER_HP = 450;
export const REF_BOOST_ABS = 2.0; // 1 bar relatif
export const INTERNAL_MAX_MM = 32; // capacité typique d'un clapet interne
export const VALVE_SIZES = [32, 35, 38, 40, 44, 46, 50, 60];

const HP_PER_KW = 1 / 0.745699872;

/** Diamètre de soupape requis (mm). */
export function requiredValveMm(powerKw, boostBar) {
  return REF_DIAMETER_MM * Math.sqrt(((powerKw * HP_PER_KW) / REF_POWER_HP) * (REF_BOOST_ABS / (1 + boostBar)));
}

/** Verdict selon la capacité (surface réelle / surface requise). */
export function sizing(capacity) {
  if (capacity < 1 / 1.2) return { key: 'undersized', status: 'danger', creep: 'high' };
  if (capacity < 1 / 1.1) return { key: 'undersized', status: 'warn', creep: 'moderate' };
  if (capacity > 2) return { key: 'oversized', status: 'warn', creep: 'none' }; // > 1,41 × le diamètre requis
  return { key: 'optimal', status: 'ok', creep: 'low' };
}

/**
 * @param {object} i powerKw, boostBar (relatif), type ('internal'|'external'), valveMm, springBar, control ('manual'|'mbc'|'ebc')
 */
export function computeWastegate(i) {
  const req = requiredValveMm(i.powerKw, i.boostBar);
  const capacity = (i.valveMm / req) ** 2;
  const fit = sizing(capacity);
  const controlled = i.control !== 'manual';
  const recommendedSpring = controlled ? i.boostBar * 0.7 : i.boostBar;
  const maxControllable = controlled ? i.springBar * 2 : i.springBar;
  const expectedBoost = controlled ? Math.min(i.boostBar, maxControllable) : i.springBar;
  const ebcDuty = i.control === 'ebc' ? Math.max(0, Math.min(100, ((i.boostBar - i.springBar) / i.springBar) * 100)) : null;
  const internalTooSmall = i.type === 'internal' && req > INTERNAL_MAX_MM;
  // Débit de gaz d'échappement estimé (kg/s) : 0,33 kg/kWh de carburant × (1 + AFR 12,5)
  const exhaustKgS = ((i.powerKw * 0.33) / 3600) * 13.5;
  const warnings = [];
  if (fit.creep === 'high') warnings.push({ key: 'creep_high', status: 'danger' });
  else if (fit.creep === 'moderate') warnings.push({ key: 'creep_moderate', status: 'warn' });
  if (internalTooSmall) warnings.push({ key: 'use_external', status: 'warn' });
  if (!controlled && Math.abs(i.springBar - i.boostBar) > 0.05) warnings.push({ key: 'spring_manual', status: 'warn' });
  if (controlled && i.springBar < i.boostBar * 0.5) warnings.push({ key: 'spring_low', status: 'warn' });
  if (controlled && i.springBar > i.boostBar * 0.9) warnings.push({ key: 'spring_high', status: 'warn' });
  if (controlled && i.boostBar > maxControllable) warnings.push({ key: 'target_unreachable', status: 'danger' });
  if (fit.key === 'oversized') warnings.push({ key: 'oversized', status: 'warn' });
  return { req, capacity, fit, recommendedSpring, expectedBoost, maxControllable, ebcDuty, internalTooSmall, exhaustKgS, warnings };
}

/** Comparateur de tailles de soupape. */
export const valveTable = (req) => VALVE_SIZES.map((d) => ({ d, capacity: (d / req) ** 2, fit: sizing((d / req) ** 2) }));

/** Pression obtenue selon le rapport cyclique électronique (approximation linéaire). */
export const ebcCurve = (springBar) => [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((d) => ({ duty: d, boost: springBar * (1 + d / 100) }));
