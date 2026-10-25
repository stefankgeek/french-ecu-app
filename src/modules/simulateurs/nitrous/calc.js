/**
 * Protoxyde d'azote (NOS) — base : ancien site (nos_nitrous.php), avec la correction validée le 25/10/2026 :
 * la consommation de N₂O est déduite de la chimie au lieu d'un forfait de 0,8 lb/h par hp (4 à 5× trop faible).
 *   carburant ajouté = puissance du kit × BSFC (0,5 lb/hp·h)
 *   N₂O = carburant × 9,37 (stœchiométrie : 36,4 % d'O₂ dans le N₂O, 3,41 lb d'O₂ par lb d'essence) × λ cible
 *   → environ 4 lb/h de N₂O par hp : une bouteille de 10 lb dure ~90 s avec un kit de 100 hp.
 * Entrées en unités d'origine : baseHp, compressionRatio, octane, baseTiming (°), shotHp, bottleLb, shotSeconds.
 */
export const EFFICIENCY = 0.87;
export const SHOT_BSFC = 0.5; // lb/hp·h de carburant pour la puissance ajoutée
export const N2O_PER_FUEL_STOICH = (14.7 * 0.232) / 0.364; // ≈ 9,37 lb de N₂O par lb d'essence
export const TARGET_LAMBDA = 0.85;
export const SHOT_SIZES = [25, 50, 75, 100, 125, 150, 175, 200];
export const BOTTLE_SIZES = [2.5, 5, 10, 15];

export function computeNos(i) {
  const actualGain = i.shotHp * EFFICIENCY;
  const totalHp = i.baseHp + actualGain;
  const percentGain = (actualGain / i.baseHp) * 100;

  const fuelLbHr = i.shotHp * SHOT_BSFC;
  const n2oLbHr = fuelLbHr * N2O_PER_FUEL_STOICH * TARGET_LAMBDA; // mélange riche : moins de N₂O par lb de carburant
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

/** Nombre d'activations selon la taille du kit, pour la durée d'activation choisie. */
export const n2oLbHrForShot = (shotHp) => shotHp * SHOT_BSFC * N2O_PER_FUEL_STOICH * TARGET_LAMBDA;
export const bottleCurve = (bottleLb, seconds = 3) => [25, 50, 75, 100, 150, 200].map((s) => ({ shot: s, shots: Math.floor(bottleLb / ((n2oLbHrForShot(s) / 3600) * seconds)) }));
