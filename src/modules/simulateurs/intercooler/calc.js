/**
 * Efficacité intercooler.
 *
 * L'ancien site (intercooler_efficiency.php) contenait des erreurs d'unités qui rendaient les résultats
 * irréalistes ; corrigées ici (validation générale de Stéphane du 25/10/2026) :
 *  1. Débit d'air : la formule oubliait le facteur 2 du 4 temps et la conversion cm³ → m³
 *     (≈ 600 000 kg/h pour un 2 L !). Ici : cylindrée × tr/min/2 × RV × densité dans le collecteur.
 *  2. Perte de charge : ΔP = K·ρ·v²/2 (faisceau + durites, Darcy-Weisbach + coudes) au lieu d'une
 *     formule empirique qui donnait plus de 1 bar.
 *  3. Efficacité : méthode « efficacité-NTU » (ε = 1 − e^−NTU) dépendant du volume du faisceau,
 *     de la densité d'ailettes, de la vitesse de l'air de refroidissement et du débit d'air de charge,
 *     étalonnée pour donner ≈ 80 % sur un faisceau frontal 600×300×100 à 0,3 kg/s et 100 km/h.
 *  4. Gain de puissance : lié à la densité (∝ 1/T), sur la puissance estimée à partir du débit d'air,
 *     au lieu de « cylindrée × 50 ch ». Perte due à la perte de charge : seulement si la pression
 *     n'est pas régulée au collecteur (sinon c'est le turbo qui compense).
 */
export const R_AIR = 287.05;
export const K_NTU = 0.0268; // étalonnage : faisceau de 18 L, 0,3 kg/s, 100 km/h → ε ≈ 0,8
export const POROSITY = 0.4; // part de la section de passage côté air de suralimentation
export const K_CORE = 115; // (f/Dh) étalonné : ≈ 0,08 bar dans le cas de référence
export const K_BENDS = 1.2; // ≈ 4 coudes dans la tuyauterie
export const ENGINE_EFFICIENCY = 0.33;

const K = 273.15;

/**
 * @param {object} i dispL, rpm, ve, boostBar (relatif), pAtmBar, tInC (sortie compresseur), tAmbC,
 *   type ('air-air'|'air-water'), coreW, coreH, coreT (mm), fins (ailettes/pouce), pipeMm, pipeLenM,
 *   speedKmh, fan (bool)
 */
export function computeIntercooler(i, override = {}) {
  const x = { ...i, ...override };
  const pAbs = (x.pAtmBar + x.boostBar) * 1e5;
  const tIn = x.tInC + K;
  const coolant = x.type === 'air-water' ? x.tAmbC + 10 : x.tAmbC; // eau ≈ 10 °C au-dessus de l'ambiant

  // Débit d'air (itération courte : la densité dépend de la température de sortie)
  let tOut = tIn;
  let massKgS = 0;
  let eff = 0;
  const coreVolL = (x.coreW * x.coreH * x.coreT) / 1e6;
  const airSpeed = Math.max(x.speedKmh / 3.6, x.fan ? 4 : 1);
  for (let n = 0; n < 4; n++) {
    const rho = pAbs / (R_AIR * tOut);
    massKgS = (x.dispL / 1000) * (x.rpm / 120) * x.ve * rho;
    const speedFactor = x.type === 'air-water' ? 2.5 : Math.pow(airSpeed / 27.8, 0.6);
    const ntu = (K_NTU * coreVolL * Math.sqrt(x.fins / 14) * speedFactor) / massKgS;
    eff = Math.min(x.type === 'air-water' ? 0.95 : 0.92, Math.max(0.05, 1 - Math.exp(-ntu)));
    tOut = tIn - eff * (tIn - (coolant + K));
  }
  // Perte de charge
  const rhoMean = pAbs / (R_AIR * ((tIn + tOut) / 2));
  const flowArea = (x.coreH / 1000) * (x.coreT / 1000) * POROSITY;
  const vCore = massKgS / rhoMean / flowArea;
  const dpCore = K_CORE * Math.sqrt(x.fins / 14) * (x.coreW / 1000) * 0.5 * rhoMean * vCore ** 2;
  const pipeArea = Math.PI * (x.pipeMm / 2000) ** 2;
  const vPipe = massKgS / rhoMean / pipeArea;
  const dpPipe = (0.02 * (x.pipeLenM / (x.pipeMm / 1000)) + K_BENDS) * 0.5 * rhoMean * vPipe ** 2;
  const dpBar = (dpCore + dpPipe) / 1e5;

  const powerKw = (massKgS / 14.7) * 44e3 * ENGINE_EFFICIENCY;
  const gainKw = powerKw * (1 - tOut / tIn); // sans intercooler : densité × tOut/tIn
  const lossKw = powerKw * (dpBar * 1e5) / pAbs; // si la pression n'est pas régulée au collecteur
  return {
    eff, tOutC: tOut - K, dropC: tIn - tOut, massKgS, dpBar, dpCoreBar: dpCore / 1e5, dpPipeBar: dpPipe / 1e5,
    vPipe, powerKw, gainKw, lossKw, netKw: gainKw - lossKw, coreVolL,
    rating: eff > 0.8 && dpBar < 0.15 ? 'excellent' : eff > 0.7 && dpBar < 0.25 ? 'good' : eff > 0.6 ? 'adequate' : 'insufficient',
  };
}

/** Efficacité selon la vitesse du véhicule. */
export const speedCurve = (i) => [0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map((s) => ({ s, eff: computeIntercooler(i, { speedKmh: s }).eff }));
/** Perte de charge selon le régime (pleine charge). */
export const rpmCurve = (i) => {
  const pts = [];
  for (let rpm = 2000; rpm <= i.rpm + 1; rpm += 500) pts.push({ rpm, dp: computeIntercooler(i, { rpm }).dpBar });
  return pts;
};
