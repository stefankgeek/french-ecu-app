/**
 * Arbre à cames — calage, croisement, LSA, plage de puissance.
 * Base : ancien site (cam_duration.php). Corrections (règle du 25/10/2026) :
 *  1. Croisement : l'ancienne formule donnait ≈ 288° pour un arbre 280°/LSA 110 (impossible).
 *     Correct : croisement = ouverture admission avant PMH + fermeture échappement après PMH
 *     = (durée adm. + durée éch.)/2 − 2 × LSA.
 *  2. Régime de puissance maxi : l'ancienne règle donnait 9000 tr/min pour 280° quel que soit le moteur.
 *     Remplacée par une règle empirique tenant compte de la durée ET de la cylindrée unitaire
 *     (les gros cylindres tournent moins vite). Indicatif.
 *  3. Le taux de compression saisi (inutilisé) sert maintenant au taux de compression DYNAMIQUE
 *     à la fermeture de l'admission (rapport bielle/course supposé 1,6 si non saisi).
 *  4. Suppression des corrections arbitraires de dépression selon le type de suralimentation.
 * Durées « annoncées » (siège à siège), angles vilebrequin. Centres de came : admission après PMH,
 * échappement avant PMH.
 */
import { effectiveStrokeFraction } from '../../data/kinematics.js';

export function computeCam(i) {
  const ivo = i.inDur / 2 - i.inCl; // avant PMH
  const ivc = i.inCl + i.inDur / 2 - 180; // après PMB
  const evo = i.exCl + i.exDur / 2 - 180; // avant PMB
  const evc = i.exDur / 2 - i.exCl; // après PMH
  const overlap = ivo + evc;
  const lsa = (i.inCl + i.exCl) / 2;
  const advance = lsa - i.inCl; // calage de l'arbre = LSA − centre admission : > 0 = avancé
  const avgDur = (i.inDur + i.exDur) / 2;
  const ccPerCyl = (i.dispL * 1000) / i.cylinders;
  const peakRpm = Math.max(3500, Math.min(11000, (6000 + (avgDur - 240) * 37.5) * Math.pow(500 / ccPerCyl, 1 / 3)));
  const vacuum = Math.max(5, Math.min(20, 20 - overlap / 10)); // inHg, règle empirique au ralenti
  const lambdaRod = 1 / (2 * (i.rodRatio || 1.6));
  const frac = effectiveStrokeFraction(ivc, 1, 1 / lambdaRod);
  const dcr = 1 + frac * (i.cr - 1);
  const grade = (v, t) => (v < t[0] ? 'excellent' : v < t[1] ? 'good' : v < t[2] ? 'fair' : v < t[3] ? 'poor' : 'very_poor');
  const usage = overlap < 30 ? 'street' : overlap < 50 ? 'street_perf' : overlap < 70 ? 'track' : overlap < 80 ? 'race' : 'drag';
  const warnings = [];
  if (overlap > 70) warnings.push('overlap_high');
  if (i.boost !== 'na' && overlap > 40) warnings.push('overlap_boost');
  if (lsa < 106) warnings.push('lsa_tight');
  if (lsa > 116) warnings.push('lsa_wide');
  if (dcr < 7.5) warnings.push('dcr_low');
  if (dcr > 8.8 && i.boost === 'na') warnings.push('dcr_high');
  return {
    ivo, ivc, evo, evc, overlap, lsa, advance, avgDur, peakRpm, bandStart: peakRpm * 0.6, vacuum, dcr, usage, warnings,
    idle: grade(overlap, [20, 40, 60, 80]),
    ecu: overlap < 30 ? 'optional' : overlap < 60 ? 'recommended' : 'mandatory',
  };
}

/** Courbes de levée (profil harmonique) sur 0–720° (0 = PMH de croisement). */
export function liftCurves(i) {
  const pts = [];
  const lift = (angle, open, dur, max) => {
    let a = angle - open;
    while (a < 0) a += 720;
    while (a >= 720) a -= 720;
    return a <= dur ? (max / 2) * (1 - Math.cos((2 * Math.PI * a) / dur)) : 0;
  };
  // Repère : 0° = PMH de croisement ; admission s'ouvre à −IVO ; échappement s'ouvre à −(180 + EVO)
  const r = computeCam(i);
  for (let a = -360; a <= 360; a += 10) {
    pts.push({ a, in: lift(a, -r.ivo, i.inDur, i.inLift), ex: lift(a, -(180 + r.evo), i.exDur, i.exLift) });
  }
  return pts;
}
