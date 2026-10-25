/**
 * Générateur de cartographies de départ (calculateur programmable).
 *
 * Ancien site (ecu_complete.php) — vérifié le 25/10/2026, erreurs corrigées :
 *  - Carte carburant : le rendement volumétrique augmentait avec la charge au-delà de 100 kPa
 *    ET la masse d'air était encore multipliée par la pression → carburant ∝ pression² en suralimentation
 *    (≈ +40 % de trop à 2,5 bar abs). Corrigé : VE quasi constant en charge, masse d'air ∝ pression.
 *  - Table VE jusqu'à 150–300 % en turbo : faux en speed-density (la pression est déjà dans le calcul).
 *    Corrigé : VE ≈ 95–105 % en suralimentation.
 *  - Pression d'essence saisie mais jamais utilisée → débit injecteur corrigé : Q = Q₃bar·√(P/3).
 *  - Contrôle des injecteurs fait sans la suralimentation et avec la densité de l'essence pour tous
 *    les carburants (E85 sous-estimé) → refait au point le plus chargé avec la densité du carburant.
 *  - Avance : retrait de charge appliqué aussi au-delà de 100 kPa (−18° à 2 bar) en plus du retrait
 *    turbo, carte écrêtée à 5° ; avance pleine charge atmo trop faible (≈ 17°). Nouveau modèle prudent
 *    fondé sur le régime, la charge, l'indice d'octane, le taux de compression et la pression.
 *  - Démarrage : cylindrée en cm³ prise pour des litres (×1000) → toujours 20 ms. Corrigé.
 *  - Enrichissement de chauffe discontinu à 0 °C (1,5 → 2,0). Corrigé (courbe continue).
 *  - Correction de température d'air bornée à ±15 % (fausse au-delà de 65 °C) → loi des gaz parfaits.
 *  - Correction barométrique appliquée en speed-density, où le capteur MAP mesure déjà la pression
 *    → réservée au mode Alpha-N (papillon).
 * Les valeurs restent une CARTE DE DÉPART : à valider au banc avec sonde large bande et détection
 * de cliquetis.
 */
import { FUELS } from '../../data/fuels-data.js';

export const R_AIR = 287.05;
export const T_REF = 293.15; // 20 °C : température de référence de la carte de base
export const INJ_RATED_BAR = 3;

export const ECUS = {
  maxxecu: { name: 'MaxxECU', software: 'MTune' },
  motec: { name: 'MoTeC M1', software: 'M1 Tune' },
  haltech: { name: 'Haltech Elite', software: 'Haltech NSP' },
  aem: { name: 'AEM Infinity', software: 'AEM Infinity Tuner' },
  link: { name: 'Link G4X', software: 'PCLink' },
  ms3: { name: 'MegaSquirt MS3', software: 'TunerStudio' },
  emu: { name: 'ECUMaster EMU Black', software: 'EMU Black Client' },
  speeduino: { name: 'Speeduino', software: 'TunerStudio' },
  generic: { name: 'CSV', software: '' },
};

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lin = (a, b, n) => Array.from({ length: n }, (_, k) => a + ((b - a) * k) / (n - 1));

export function axes(i) {
  const pMax = Math.ceil((101.3 + i.boostBar * 100 + 10) / 10) * 10;
  const rpm = lin(i.idleRpm, i.rpmLimit, i.rpmPoints).map((x, k) => (k === 0 ? Math.round(x / 50) * 50 : Math.round(x / 100) * 100));
  const kpa = lin(20, pMax, i.loadPoints).map((x) => Math.round(x / 5) * 5);
  return { rpm, kpa, pMax };
}

/** Rendement volumétrique estimé (%) — relatif à la pression collecteur. */
export function veAt(i, n, p) {
  const nPeak = 0.62 * i.rpmLimit;
  const psi = (n - nPeak) / nPeak;
  const shape = clamp(1 - 0.55 * psi * psi, 0.55, 1);
  const lf = p <= 100 ? 0.72 + 0.28 * clamp((p - 20) / 80, 0, 1) : 1 + 0.03 * ((p - 100) / 100);
  return clamp(i.veMax * shape * lf, 30, 130);
}

/** Lambda visé selon la pression collecteur. */
export function lambdaAt(i, p, pMax) {
  if (p <= 50) return i.lambdaCruise;
  if (p < 90) return i.lambdaCruise + ((i.lambdaWot - i.lambdaCruise) * (p - 50)) / 40;
  if (p <= 100 || pMax <= 101.3) return i.lambdaWot;
  return i.lambdaWot + ((i.lambdaBoost - i.lambdaWot) * (p - 100)) / Math.max(1, pMax - 100);
}

/** Avance à l'allumage de départ (° avant PMH). */
export function advanceAt(i, n, p, fuelRon) {
  const fr = clamp((n - 800) / 3200, 0, 1);
  const high = clamp((n - 4000) / 3000, 0, 1);
  const lf = clamp((Math.min(p, 100) - 20) / 80, 0, 1);
  const light = 14 + 26 * fr;
  const full = 8 + 20 * fr + 2 * high; // ≈ 28° pleine charge atmo à 4 000 tr/min (SP95, TC 10:1), prudent
  let adv = light + (full - light) * lf;
  adv += lf * (0.5 * (fuelRon - 95) - 1.5 * (i.cr - 10));
  if (p > 100) adv -= 12 * ((p - 100) / 100);
  adv += i.offset;
  return Math.round(clamp(adv, 0, 45) * 2) / 2;
}

export function computeEcuMap(i) {
  const fuel = FUELS[i.fuel];
  const fuelRon = fuel.ron + 0.1 * (fuel.ethanol || 0);
  const { rpm, kpa, pMax } = axes(i);
  const vCylM3 = i.displacementCc / i.cylinders / 1e6;
  const flowCcMs = (i.injectorCc * Math.sqrt(i.fuelBar / INJ_RATED_BAR)) / 60000;

  const airG = (n, p) => (veAt(i, n, p) / 100) * vCylM3 * ((p * 1000) / (R_AIR * T_REF)) * 1000;
  const fuelMs = (n, p) => {
    const lam = lambdaAt(i, p, pMax);
    const fuelG = airG(n, p) / (fuel.afr * lam);
    return fuelG / fuel.density / flowCcMs; // cm³ / (cm³/ms)
  };

  const fuelTable = rpm.map((n) => kpa.map((p) => fuelMs(n, p) + i.deadtime));
  const veTable = rpm.map((n) => kpa.map((p) => veAt(i, n, p)));
  const lambdaTable = rpm.map(() => kpa.map((p) => lambdaAt(i, p, pMax)));
  const ignTable = rpm.map((n) => kpa.map((p) => advanceAt(i, n, p, fuelRon)));

  // Point le plus chargé (régime maxi, pression maxi atteinte = 101,3 + suralimentation)
  const pTop = 101.3 + i.boostBar * 100;
  const effMs = fuelMs(i.rpmLimit, pTop);
  const cycleMs = 120000 / i.rpmLimit;
  const duty = ((effMs + i.deadtime) / cycleMs) * 100;
  const requiredCc = (i.injectorCc * ((effMs + i.deadtime) / cycleMs)) / 0.8;
  const idleFuelMs = fuelMs(i.idleRpm, 35);
  const airGsMax = airG(i.rpmLimit, pTop) * i.cylinders * (i.rpmLimit / 120);

  // Courbes 1D
  const deadtimeCurve = [8, 9, 10, 11, 12, 13, 14, 15, 16].map((v) => ({ x: v, y: i.deadtime * Math.pow(14 / v, 1.6) }));
  const warmup = [-20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((t) => ({ x: t, y: 1 + 0.9 * Math.pow(clamp((70 - t) / 90, 0, 1), 1.3) }));
  const crankFactor = { '-20': 4, '-10': 3.3, 0: 2.7, 10: 2.2, 20: 1.8, 40: 1.4, 60: 1.2, 80: 1.1 };
  const crankBase = fuelMs(i.idleRpm, 100);
  const cranking = [-20, -10, 0, 10, 20, 40, 60, 80].map((t) => ({ x: t, y: crankBase * crankFactor[t] + i.deadtime }));
  const idle = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((t) => ({ x: t, y: clamp((60 - t) * 10, 0, 800) }));
  const accel = [0, 10, 20, 30, 40, 50, 70, 100].map((r) => ({ x: r, y: r > 10 ? clamp(r * 0.3, 0, 50) : 0 }));
  const iat = [-20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((t) => ({ x: t, y: T_REF / (t + 273.15) }));
  const baro = [70, 75, 80, 85, 90, 95, 100, 105].map((b) => ({ x: b, y: b / 101.3 }));

  return {
    fuelProps: fuel, fuelRon, rpm, kpa, pMax, pTop, fuelTable, veTable, lambdaTable, ignTable,
    duty, requiredCc, cycleMs, maxPw: effMs + i.deadtime, idleFuelMs, airGsMax, flowCcMin: flowCcMs * 60000,
    curves: { deadtimeCurve, warmup, cranking, idle, accel, iat, baro },
  };
}

/** Couleur de carte : bleu (bas) → vert → jaune → rouge (haut). */
export function heatColor(v, min, max) {
  const x = max > min ? clamp((v - min) / (max - min), 0, 1) : 0.5;
  const stops = [[66, 133, 244], [52, 199, 89], [255, 214, 10], [255, 69, 58]];
  const s = x * (stops.length - 1);
  const k = Math.min(stops.length - 2, Math.floor(s));
  const f = s - k;
  const c = stops[k].map((a, j) => Math.round(a + (stops[k + 1][j] - a) * f));
  return `rgb(${c.join(',')})`;
}

/** CSV au format attendu par les logiciels (point décimal, virgule séparateur). */
export function tableCsv(rows, cols, values, decimals, corner = 'RPM\\kPa') {
  const head = [corner, ...cols].join(',');
  const body = rows.map((r, a) => [r, ...values[a].map((v) => v.toFixed(decimals))].join(','));
  return [head, ...body].join('\r\n') + '\r\n';
}
export function curveCsv(points, xName, yName, decimals) {
  return [`${xName},${yName}`, ...points.map((p) => `${p.x},${p.y.toFixed(decimals)}`)].join('\r\n') + '\r\n';
}
