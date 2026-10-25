/**
 * Contre-pression d'échappement.
 *
 * L'ancien site (exhaust_backpressure.php) contenait des erreurs majeures, corrigées ici
 * (validation générale de Stéphane du 25/10/2026) :
 *  1. Débit : la formule CFM = cylindrée × tr/min × RV / 3456 attend des POUCES CUBES ; l'ancien site
 *     y mettait des cm³ → débit ×16. Ici : débit massique des gaz déduit de la puissance.
 *  2. Pertes : valeurs fixes en psi multipliées par (tr/min/4000). Une perte de charge varie avec le
 *     CARRÉ du débit : ΔP = K·ρ·v²/2 pour chaque élément, avec des coefficients K étalonnés sur les
 *     anciennes valeurs (même ordre de grandeur pour un 200 ch atmosphérique en Ø 60 mm).
 *  3. Perte de puissance : travail de pompage réel ΔP × cylindrée × cycles/s (au lieu de 3 %/psi
 *     appliqué à « puissance/100 »). C'est une valeur minimale : le balayage peut aussi en souffrir.
 *  4. Diamètre conseillé : règle de section usuelle (≈ 1 in² pour 50 hp en atmo, 40 hp en turbo)
 *     au lieu de « cylindrée × 26 ».
 * Les diamètres des primaires et du collecteur, ignorés par l'ancien site, sont maintenant utilisés.
 */
export const R_GAS = 287;
export const BSFC_KG_KWH = { na: 0.3, turbo: 0.33, supercharger: 0.33 };
export const AFR_WOT = { na: 12.9, turbo: 12.5, supercharger: 12.5 };
export const T_LINE_K = 873; // ≈ 600 °C dans la ligne
export const T_HEADER_K = 1073; // ≈ 800 °C au collecteur
export const K_HEADER = { stock: 3.0, tubular: 1.5, equal: 1.0 };
export const K_CAT = { stock: 4.4, high_flow: 1.5, race: 0.75, none: 0 };
export const K_MUFFLER = { stock: 3.0, sport: 1.2, straight: 0.3 };
export const K_BEND = 0.3; // coude 90° cintré
export const FRICTION = 0.02;

/** Diamètre intérieur conseillé (mm) : section ≈ puissance / 50 hp·in⁻² (atmo) ou / 40 (suralimenté). */
export function recommendedPipeMm(powerKw, boosted) {
  const hp = powerKw / 0.745699872;
  const areaIn2 = hp / (boosted ? 40 : 50);
  return Math.sqrt((4 * areaIn2) / Math.PI) * 25.4;
}

const area = (dMm) => Math.PI * (dMm / 2000) ** 2;

/**
 * @param {object} i dispL, cylinders, rpm, powerKw, type ('na'|'turbo'|'supercharger'), boostBar,
 *   header, primaryMm, collectorMm, pipeMm, pipeLenM, cat, muffler, bends
 */
export function computeExhaust(i, scale = 1) {
  const boosted = i.type !== 'na';
  const fuelKgS = (i.powerKw * BSFC_KG_KWH[i.type]) / 3600;
  const massKgS = fuelKgS * (1 + AFR_WOT[i.type]) * scale;
  const rhoLine = 101325 / (R_GAS * T_LINE_K);
  const rhoHeader = 101325 / (R_GAS * T_HEADER_K);
  const qLine = massKgS / rhoLine;
  const qHeader = massKgS / rhoHeader;
  const vPipe = qLine / area(i.pipeMm);
  const vCollector = qHeader / area(i.collectorMm);
  const vPrimary = qHeader / i.cylinders / area(i.primaryMm);
  const dynLine = 0.5 * rhoLine * vPipe ** 2;
  const dynHeader = 0.5 * rhoHeader * vCollector ** 2;

  const losses = {
    header: i.type === 'turbo' ? 0 : K_HEADER[i.header] * dynHeader, // turbo : collecteur en amont de la turbine
    cat: K_CAT[i.cat] * dynLine,
    muffler: K_MUFFLER[i.muffler] * dynLine,
    piping: (K_BEND * i.bends + FRICTION * (i.pipeLenM / (i.pipeMm / 1000))) * dynLine,
  };
  const totalPa = losses.header + losses.cat + losses.muffler + losses.piping;
  // Travail de pompage : ΔP × volume balayé par seconde (4 temps)
  const pumpingKw = (totalPa * (i.dispL / 1000) * (i.rpm / 120)) / 1000;
  const totalBar = totalPa / 1e5;
  const level = totalBar < 0.2 ? 'low' : totalBar < 0.4 ? 'moderate' : totalBar < 0.7 ? 'high' : 'very_high';
  return {
    massKgS, qLineM3s: qLine, vPipe, vPrimary, losses, totalPa, pumpingKw, level,
    recommendedMm: recommendedPipeMm(i.powerKw, boosted),
    turboManifoldBarA: i.type === 'turbo' ? (1.01325 + i.boostBar) * 1.7 : null,
  };
}

/** Courbes selon le régime : débit ∝ régime à pleine charge (couple constant). */
export function rpmCurve(i) {
  const pts = [];
  for (let rpm = 1000; rpm <= i.rpm + 1; rpm += 500) {
    const s = rpm / i.rpm;
    const r = computeExhaust({ ...i, rpm }, s);
    pts.push({ rpm, bar: r.totalPa / 1e5, lossKw: r.pumpingKw });
  }
  return pts;
}
