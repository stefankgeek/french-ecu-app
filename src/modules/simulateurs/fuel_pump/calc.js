/**
 * Débit pompe & duty cycle — formules reprises À L'IDENTIQUE de l'ancien site (debit-pompe.php).
 * Entrées : injFlowCcMin (cc/min par injecteur), injectors, densityKgL, pipeDiameterMm, pipeLengthM,
 *           circuit ('simple' | 'complex'), dutyMax (%).
 * Sorties : débits en cc/min (et L/h pour la pompe), pertes de charge en Pa, vitesses en m/s.
 */
export const MAX_FLOW_VELOCITY = 1.5; // m/s, limite recommandée
export const FRICTION = 0.02; // coefficient de Darcy (tuyau lisse, turbulent)
export const PUMP_LOSS_PA = 150000; // perte de charge pompe fixe (1,5 bar)

/** Perte de charge Darcy-Weisbach (Pa). */
export function darcy(L, D, v, rho, f = FRICTION) {
  if (L <= 0 || D <= 0 || v <= 0) return 0;
  return f * (L / D) * ((rho * v * v) / 2);
}

const pumpOut = (inj, n, duty) => {
  const d = duty > 100 ? 100 : duty;
  return d === 0 ? 0 : inj * n * (100 / d) * 1.2;
};

export function computePump(i) {
  const rho = i.densityKgL * 1000;
  const outCcMin = pumpOut(i.injFlowCcMin, i.injectors, i.dutyMax);
  const returnCcMin = outCcMin * 0.1;
  const pumpLh = outCcMin * 0.06;
  const D = i.pipeDiameterMm / 1000;
  const section = Math.PI * (D / 2) ** 2;
  const velocity = section > 0 ? (outCcMin * 1e-6) / 60 / section : 0;
  const effLength = i.pipeLengthM * (i.circuit === 'complex' ? 1.5 : 1);
  const pipeLossPa = darcy(i.pipeLengthM, D, velocity, rho);
  const circuitLossPa = darcy(effLength, D, velocity, rho);
  const totalLossPa = circuitLossPa + PUMP_LOSS_PA;
  const maxPipeCcMin = section * MAX_FLOW_VELOCITY * 1e6 * 60;
  const loadRatio = outCcMin / maxPipeCcMin;

  const curve = [];
  for (let d = 0; d <= 120; d += 2) {
    const out = pumpOut(i.injFlowCcMin, i.injectors, d);
    const v = section > 0 ? (out * 1e-6) / 60 / section : 0;
    const circuit = darcy(effLength, D, v, rho);
    curve.push({
      duty: d,
      injectors: (d / 100) * i.injFlowCcMin * i.injectors,
      out, ret: out * 0.1,
      pipeLoss: darcy(i.pipeLengthM, D, v, rho), circuitLoss: circuit, pumpLoss: PUMP_LOSS_PA, totalLoss: circuit + PUMP_LOSS_PA,
    });
  }
  return { outCcMin, returnCcMin, pumpLh, velocity, pipeLossPa, circuitLossPa, totalLossPa, maxPipeCcMin, loadRatio, curve };
}

/** Comparateur de pompes : tailles de 50 à 2500 L/h (pas de 50), 7 lignes autour du besoin. */
export function pumpSizes(requiredLh) {
  const all = [];
  for (let s = 50; s <= 2500; s += 50) all.push(s);
  let idx = all.findIndex((s) => s >= requiredLh);
  if (idx === -1) idx = all.length - 1;
  const start = Math.max(0, idx - 3);
  return all.slice(start, Math.min(all.length, start + 7)).map((lh) => {
    const margin = ((lh - requiredLh) / requiredLh) * 100;
    const rating = margin > 50 ? 'excellent' : margin > 25 ? 'good' : margin > 10 ? 'adequate' : 'insufficient';
    return { lh, margin, rating, closest: lh === all[idx] };
  });
}

/** Comparateur de tuyaux : diamètres 3 à 50 mm, 7 lignes autour du diamètre idéal (≤ 70 % du débit maxi). */
export function pipeSizes(requiredCcMin) {
  const all = [];
  for (let d = 3; d <= 50; d++) all.push(d);
  const maxFlow = (d) => Math.PI * (d / 1000 / 2) ** 2 * MAX_FLOW_VELOCITY * 1e6 * 60;
  let ideal = all.find((d) => requiredCcMin <= maxFlow(d) * 0.7) || 50;
  const idx = all.indexOf(ideal);
  const start = Math.max(0, idx - 3);
  return all.slice(start, Math.min(all.length, start + 7)).map((d) => {
    const max = maxFlow(d);
    const section = Math.PI * (d / 1000 / 2) ** 2;
    const velocity = (requiredCcMin * 1e-6) / 60 / section;
    const rating = requiredCcMin <= max * 0.5 ? 'excellent' : requiredCcMin <= max * 0.7 ? 'good' : requiredCcMin <= max * 0.9 ? 'adequate' : 'insufficient';
    return { d, max, velocity, rating, closest: d === ideal };
  });
}
