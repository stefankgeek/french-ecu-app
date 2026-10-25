/**
 * Calculateur injecteurs — formules reprises À L'IDENTIQUE de l'ancien site (calculateur.php).
 * Unités d'entrée (celles des formules d'origine) :
 *   displacementL (L), powerHp (hp), rpm, bsfc (lb/hp·h), railBar (bar), duty (0–1),
 *   intakeBarA (bar abs), ve (0–1), airTempC (°C), throttle (0–1), tofi (ms)
 * Sorties en unités métriques (cc/min, ms, L/min, mm, %).
 */
export const AIR_VELOCITY_INTAKE = 40; // m/s (valeur de l'ancien site)
export const AIR_VELOCITY_THROTTLE = 30; // m/s
const FUEL_DENSITY = 0.75; // kg/L (ancien site)

export function computeInjectors(i) {
  const baseFuelFlowLbHr = (i.powerHp * i.bsfc) / (i.duty * i.cylinders);
  const pressureCorrection = Math.sqrt(i.railBar / 3.0);
  const correctedFuelFlowLbHr = baseFuelFlowLbHr * pressureCorrection;
  const flowCcMin = correctedFuelFlowLbHr * 10.5;

  const displacementPerCylinderCC = (i.displacementL / i.cylinders) * 1000;
  const airFlowPerCylinder = (displacementPerCylinderCC * i.rpm * i.ve * i.throttle) / (2 * 1000); // L/min
  const tempCorrectionAir = 293.15 / (273.15 + i.airTempC);
  const airFlowLMin = airFlowPerCylinder * tempCorrectionAir;

  const engineCyclesPerSec = i.rpm / 60 / 2;
  const fuelMassPerSecLb = (i.powerHp * i.bsfc) / 3600;
  const fuelMassPerCycleLb = fuelMassPerSecLb / engineCyclesPerSec;
  const fuelMassCycleGram = fuelMassPerCycleLb * 453.592;
  const fuelVolumeCycleCc = fuelMassCycleGram / (FUEL_DENSITY * 1000);
  const injectionMs = (fuelVolumeCycleCc / flowCcMin) * 60000 + i.tofi;

  const airFlowM3s = airFlowLMin / 1000 / 60;
  const intakeDiameterMm = Math.sqrt((4 * airFlowM3s) / (Math.PI * AIR_VELOCITY_INTAKE)) * 1000;
  const airFlowTotalM3s = (airFlowLMin * i.cylinders) / 1000 / 60;
  const throttleDiameterMm = Math.sqrt((4 * airFlowTotalM3s) / (Math.PI * AIR_VELOCITY_THROTTLE)) * 1000;

  const safetyMargin = 100 - i.duty * 100 + (i.railBar - 3) * 5;

  return {
    flowCcMin, flowLbHr: correctedFuelFlowLbHr, injectionMs, airFlowLMin,
    intakeDiameterMm, throttleDiameterMm, safetyMargin, pressureCorrection, tempCorrectionAir,
  };
}

/** Comparateur : 7 tailles standard (pas de 50 cc/min) autour du débit requis. */
export function injectorSizes(requiredCcMin) {
  const all = [];
  for (let s = 50; s <= 2500; s += 50) all.push(s);
  let idx = all.findIndex((s) => s >= requiredCcMin);
  if (idx === -1) idx = all.length - 1;
  const start = Math.max(0, idx - 3);
  return all.slice(start, Math.min(all.length, start + 7)).map((size) => {
    const duty = (requiredCcMin / size) * 100;
    const margin = 100 - duty;
    const rating = margin > 25 ? 'excellent' : margin > 15 ? 'good' : margin > 5 ? 'adequate' : 'insufficient';
    return { size, duty, margin, rating, closest: size === all[idx] };
  });
}

/** Courbe débit / pression de rampe (Q ∝ √P). */
export function pressureCurve(flowCcMin, railBar, intakeBarA) {
  const pressures = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
  return pressures.map((p) => {
    const f = flowCcMin * Math.sqrt(p / railBar);
    return { p, flow: f, boosted: f * intakeBarA };
  });
}

/** Vitesses d'air / carburant selon l'ouverture papillon (modèle de l'ancien site). */
export function velocityCurve() {
  return [20, 30, 40, 50, 60, 70, 80, 90, 100].map((pos) => ({
    pos,
    air: AIR_VELOCITY_INTAKE * (pos / 100) * 1.2,
    fuel: AIR_VELOCITY_INTAKE * 0.6 * (pos / 100) * 1.1,
  }));
}
