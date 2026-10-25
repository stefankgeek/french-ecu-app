/**
 * Calculateur injecteurs.
 * Base : formules de l'ancien site (calculateur.php), avec les corrections validées le 25/10/2026 :
 *  1. Pression de rampe : le débit nominal d'un injecteur est donné à 3 bar (43,5 psi).
 *     Débit à la pression P = débit nominal × √(P / 3). Monter la pression permet donc un injecteur
 *     PLUS PETIT (l'ancien site appliquait la correction à l'envers).
 *  2. Temps d'injection : volume injecté PAR CYLINDRE et par cycle ÷ débit réel de l'injecteur
 *     (l'ancien site divisait le volume de tout le moteur avec une erreur d'unité ×1000 → ~1 ms au lieu de ~15 ms).
 *  3. Conversion lb/h → cc/min avec la densité du carburant choisi (et non un facteur fixe de 10,5).
 *  4. Marge de débit = 100 − duty cycle (suppression d'un bonus arbitraire lié à la pression).
 *  5. Comparateur : duty cycle réel de chaque taille d'injecteur.
 * Unités d'entrée : displacementL (L), powerHp (hp), rpm, bsfc (lb/hp·h), railBar (bar, pression différentielle),
 *   duty (0–1), intakeBarA (bar abs), ve (0–1), airTempC (°C), throttle (0–1), tofi (ms), densityKgL (kg/L).
 */
export const AIR_VELOCITY_INTAKE = 40; // m/s
export const AIR_VELOCITY_THROTTLE = 30; // m/s
export const RATED_PRESSURE_BAR = 3; // pression de référence des débits d'injecteurs (43,5 psi)
const LB_G = 453.59237;

/** lb/h → cc/min selon la densité du carburant (kg/L = g/cm³). */
export const lbhToCcMin = (lbh, densityKgL) => (lbh * LB_G) / 60 / densityKgL;

export function computeInjectors(i) {
  const density = i.densityKgL ?? 0.75;
  // Carburant consommé par cylindre à pleine puissance (lb/h)
  const netLbHrPerCyl = (i.powerHp * i.bsfc) / i.cylinders;
  // Débit que l'injecteur doit fournir à la pression de rampe réelle (il n'est ouvert que duty % du temps)
  const atRailLbHr = netLbHrPerCyl / i.duty;
  // Ramené au débit nominal à 3 bar
  const pressureCorrection = Math.sqrt(RATED_PRESSURE_BAR / i.railBar);
  const flowLbHr = atRailLbHr * pressureCorrection;
  const flowCcMin = lbhToCcMin(flowLbHr, density);
  const flowAtRailCcMin = lbhToCcMin(atRailLbHr, density);
  const netRatedCcMin = flowCcMin * i.duty; // besoin réel ramené à 3 bar, à 100 % d'ouverture

  const displacementPerCylinderCC = (i.displacementL / i.cylinders) * 1000;
  const airFlowPerCylinder = (displacementPerCylinderCC * i.rpm * i.ve * i.throttle) / (2 * 1000); // L/min
  const tempCorrectionAir = 293.15 / (273.15 + i.airTempC);
  const airFlowLMin = airFlowPerCylinder * tempCorrectionAir;

  // Temps d'injection : volume par cylindre et par cycle (4 temps : 1 injection tous les 2 tours)
  const cyclesPerMin = i.rpm / 2;
  const fuelCcPerCycle = lbhToCcMin(netLbHrPerCyl, density) / cyclesPerMin;
  const openMs = (fuelCcPerCycle / flowAtRailCcMin) * 60000;
  const injectionMs = openMs + i.tofi;
  const cycleMs = 120000 / i.rpm;

  const airFlowM3s = airFlowLMin / 1000 / 60;
  const intakeDiameterMm = Math.sqrt((4 * airFlowM3s) / (Math.PI * AIR_VELOCITY_INTAKE)) * 1000;
  const airFlowTotalM3s = (airFlowLMin * i.cylinders) / 1000 / 60;
  const throttleDiameterMm = Math.sqrt((4 * airFlowTotalM3s) / (Math.PI * AIR_VELOCITY_THROTTLE)) * 1000;

  const safetyMargin = 100 - i.duty * 100;

  return {
    flowCcMin, flowLbHr, flowAtRailCcMin, netRatedCcMin, injectionMs, openMs, cycleMs, airFlowLMin,
    intakeDiameterMm, throttleDiameterMm, safetyMargin, pressureCorrection, tempCorrectionAir,
  };
}

/** Comparateur : 7 tailles standard (pas de 50 cc/min, débit nominal à 3 bar) autour du besoin. */
export function injectorSizes(requiredCcMin, netRatedCcMin) {
  const all = [];
  for (let s = 50; s <= 2500; s += 50) all.push(s);
  let idx = all.findIndex((s) => s >= requiredCcMin);
  if (idx === -1) idx = all.length - 1;
  const start = Math.max(0, idx - 3);
  return all.slice(start, Math.min(all.length, start + 7)).map((size) => {
    const duty = (netRatedCcMin / size) * 100;
    const margin = 100 - duty;
    const rating = margin > 25 ? 'excellent' : margin > 15 ? 'good' : margin > 5 ? 'adequate' : 'insufficient';
    return { size, duty, margin, rating, closest: size === all[idx] };
  });
}

/**
 * Débit de l'injecteur recommandé selon la pression de rampe (Q ∝ √ΔP).
 * « unref » : régulateur NON référencé à l'admission → la suralimentation réduit la pression différentielle.
 */
export function pressureCurve(ratedCcMin, intakeBarA) {
  const boost = Math.max(0, intakeBarA - 1);
  return [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((p) => ({
    p,
    flow: ratedCcMin * Math.sqrt(p / RATED_PRESSURE_BAR),
    unref: ratedCcMin * Math.sqrt(Math.max(0, p - boost) / RATED_PRESSURE_BAR),
  }));
}

/** Vitesses d'air / carburant selon l'ouverture papillon (modèle de l'ancien site). */
export function velocityCurve() {
  return [20, 30, 40, 50, 60, 70, 80, 90, 100].map((pos) => ({
    pos,
    air: AIR_VELOCITY_INTAKE * (pos / 100) * 1.2,
    fuel: AIR_VELOCITY_INTAKE * 0.6 * (pos / 100) * 1.1,
  }));
}
