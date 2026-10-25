/**
 * Protoxyde d'azote (NOS) — formules reprises À L'IDENTIQUE de l'ancien site (nos_nitrous.php).
 * Entrées en unités d'origine : baseHp, compressionRatio, octane, baseTiming (°), shotHp, bottleLb, shotSeconds.
 */
export const EFFICIENCY = 0.87;
export const N2O_LBHR_PER_HP = 0.8;
export const TARGET_LAMBDA = 0.85;
export const SHOT_SIZES = [25, 50, 75, 100, 125, 150, 175, 200];
export const BOTTLE_SIZES = [2.5, 5, 10, 15];

export function computeNos(i) {
  const actualGain = i.shotHp * EFFICIENCY;
  const totalHp = i.baseHp + actualGain;
  const percentGain = (actualGain / i.baseHp) * 100;

  const n2oLbHr = i.shotHp * N2O_LBHR_PER_HP;
  const oxygen = n2oLbHr * 0.364; // N₂O : 36,4 % d'oxygène en masse
  const equivalentAir = oxygen / 0.232; // air : 23,2 % d'oxygène
  const fuelLbHr = equivalentAir / 14.7 / TARGET_LAMBDA;
  const fuelN2oRatio = fuelLbHr / n2oLbHr;

  const timingRetard = (i.shotHp / 50) * 2;
  const safeTiming = i.baseTiming - timingRetard + (i.octane >= 100 ? 1 : 0) - (i.compressionRatio > 10 ? 1 : 0);

  const perShotLb = (n2oLbHr / 3600) * i.shotSeconds;
  const shots = Math.floor(i.bottleLb / perShotLb);
  const totalSeconds = shots * i.shotSeconds;

  const pressureFactor = Math.pow(totalHp / i.baseHp, 0.8);
  let stress = { status: 'ok', key: null };
  if (i.compressionRatio > 10 && i.shotHp > 100) stress = { status: 'danger', key: 'cr_and_shot' };
  else if (pressureFactor > 1.5) stress = { status: 'warn', key: 'high_stress' };

  return {
    actualGain, totalHp, percentGain, n2oLbHr, fuelLbHr, fuelN2oRatio, timingRetard, safeTiming,
    perShotLb, shots, totalSeconds, pressureFactor, stress,
    powerStatus: percentGain > 40 ? 'warn' : 'ok',
    timingStatus: timingRetard > 6 ? 'warn' : 'ok',
  };
}

/** Nombre de shots selon la taille du kit (graphique d'origine : durée fixe de 3 s). */
export const bottleCurve = (bottleLb) => [25, 50, 75, 100, 150, 200].map((s) => ({ shot: s, shots: Math.floor(bottleLb / (((s * N2O_LBHR_PER_HP) / 3600) * 3)) }));
