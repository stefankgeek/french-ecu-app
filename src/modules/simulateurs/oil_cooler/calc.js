/**
 * Radiateur d'huile — dimensionnement.
 *
 * Ancien site (oil_cooler.php) — vérifié le 25/10/2026, modèle FAUX :
 *  - Chute de température = chaleur / (débit × cp) sans limite : l'huile pouvait sortir plus froide que
 *    l'air ambiant, jusqu'à −120 °C (impossible : un échangeur ne refroidit jamais sous la source froide).
 *  - Radiateur huile/eau calculé contre l'air ambiant : il ne peut descendre qu'à la température
 *    du liquide de refroidissement (~90 °C).
 *  - Débit d'huile inventé à partir de la contenance du carter ; contenance et T° d'entrée sans effet
 *    réel ; perte de charge calculée avec la vitesse de l'huile sur toute la face du radiateur (≈ 0).
 *  - Chaleur dans l'huile ≈ 3 % de la puissance : trop faible (5 à 12 % mesurés selon l'usage).
 * Nouveau modèle :
 *  - Chaleur à évacuer Q = P × k (route 5 %, piste 9 %, course 12 %) — estimation prudente.
 *  - Échangeur à courants croisés, méthode efficacité-NTU :
 *      air/huile : UA ≈ 3 000 W/(m²·K) × surface frontale × (épaisseur/50 mm)^0,6 × (v_air/8 m/s)^0,5,
 *      v_air dans le faisceau ≈ 30 % de la vitesse du véhicule (mini 2 m/s, ventilateur ou convection) ;
 *      huile/eau : UA ≈ 4 × celui d'un air/huile de même taille, côté froid = liquide de refroidissement.
 *  - Température d'huile stabilisée : T_éq = T_froid + Q / (ε·C_min) — jamais sous T_froid.
 *  - Taille conseillée : surface frontale qui donne T_éq = T visée (même proportions largeur/hauteur).
 */
export const OIL_DENSITY = 0.85; // kg/L
export const OIL_CP = 2100; // J/(kg·K)
export const AIR_CP = 1005;
export const AIR_RHO = 1.18;
export const HEAT_SHARE = { street: 0.05, track: 0.09, race: 0.12 };
export const COOLANT_C = 2000; // W/K (≈ 30 L/min de liquide)
export const UA_AIR = 3000; // W/(m²·K) de surface frontale, 50 mm, 8 m/s

/** Efficacité d'un échangeur à courants croisés, deux fluides non brassés. */
export function crossflowEff(ntu, cr) {
  if (ntu <= 0) return 0;
  if (cr < 1e-6) return 1 - Math.exp(-ntu);
  return 1 - Math.exp((Math.pow(ntu, 0.22) / cr) * (Math.exp(-cr * Math.pow(ntu, 0.78)) - 1));
}

function exchanger(i, areaM2) {
  const cOil = (i.oilFlowLmin / 60) * OIL_DENSITY * OIL_CP;
  const thick = Math.pow(i.thicknessMm / 50, 0.6);
  let ua;
  let cCold;
  let tCold;
  let vCore = null;
  if (i.type === 'water') {
    ua = 4 * UA_AIR * areaM2 * thick;
    cCold = COOLANT_C;
    tCold = i.coolantC;
  } else {
    vCore = Math.max(2, 0.3 * i.speedKmh / 3.6);
    ua = UA_AIR * areaM2 * thick * Math.sqrt(vCore / 8);
    cCold = AIR_RHO * vCore * areaM2 * AIR_CP;
    tCold = i.ambientC;
  }
  const cMin = Math.min(cOil, cCold);
  const cMax = Math.max(cOil, cCold);
  const eff = crossflowEff(ua / cMin, cMin / cMax);
  return { cOil, cCold, cMin, ua, eff, tCold, vCore };
}

export function computeOilCooler(i) {
  const area = (i.widthMm * i.heightMm) / 1e6;
  const heatW = i.powerKw * 1000 * HEAT_SHARE[i.usage];
  const x = exchanger(i, area);
  const eqTemp = x.tCold + heatW / (x.eff * x.cMin);
  const outletTemp = eqTemp - heatW / x.cOil;
  const capacityW = Math.max(0, x.eff * x.cMin * (i.targetC - x.tCold));
  const possible = i.targetC > x.tCold + 1;

  // Surface nécessaire pour tenir la température visée (dichotomie sur la surface frontale).
  let reqArea = null;
  if (possible) {
    const tempAt = (a) => { const e = exchanger(i, a); return e.tCold + heatW / (e.eff * e.cMin); };
    let lo = 0.002;
    let hi = 2;
    if (tempAt(hi) > i.targetC) reqArea = Infinity;
    else {
      for (let k = 0; k < 60; k++) { const mid = Math.sqrt(lo * hi); if (tempAt(mid) > i.targetC) lo = mid; else hi = mid; }
      reqArea = hi;
    }
  }
  const scale = reqArea && Number.isFinite(reqArea) ? Math.sqrt(reqArea / area) : null;
  const margin = eqTemp - i.targetC;
  const rating = !possible ? 'impossible'
    : margin <= -20 ? 'oversized'
      : margin <= 3 ? 'excellent'
        : margin <= 8 ? 'good'
          : margin <= 15 ? 'undersized' : 'critical';
  return { area, heatW, ...x, eqTemp, outletTemp, capacityW, possible, reqArea, reqWidth: scale ? i.widthMm * scale : null, reqHeight: scale ? i.heightMm * scale : null, margin, rating };
}

/** Température d'huile stabilisée selon la vitesse du véhicule (graphique). */
export const speedCurve = (i) => [0, 30, 60, 90, 120, 150, 180, 210, 240].map((s) => ({ s, t: computeOilCooler({ ...i, speedKmh: s }).eqTemp }));
