/**
 * Vitesse de piston et forces d'inertie.
 * Base : ancien site (piston_speed.php). Juste et conservé : vitesse moyenne 2·course·N/60, régime limite
 * pour 23 m/s, échelle d'appréciation de la vitesse moyenne.
 * Corrections (règle du 25/10/2026) :
 *  1. Accélération au PMH : a = ω²·r·(1 + r/L). L'ancien site utilisait course/L au lieu de r/L
 *     (terme correctif doublé) → accélération et forces surestimées.
 *  2. Vitesse maximale : calculée exactement (elle a lieu vers 75° après le PMH, pas « au PMH » où elle
 *     est nulle). L'ancien site affichait ω·r.
 *  3. Masse alternative : piston + axe + segments + ⅓ de la masse de la bielle (pratique courante),
 *     l'ancien site ignorait la bielle.
 */
import { pistonVelocity, pistonAcceleration } from '../../data/kinematics.js';

export const STREET_SPEED = 23; // m/s

export function computePiston(i) {
  const S = i.stroke / 1000;
  const r = S / 2;
  const L = i.rod / 1000;
  const w = (2 * Math.PI * i.rpm) / 60;
  const meanSpeed = (2 * S * i.rpm) / 60;
  let maxSpeed = 0;
  let maxAngle = 0;
  for (let a = 0; a <= 180; a += 0.25) {
    const v = pistonVelocity(a, r, L, i.rpm);
    if (v > maxSpeed) { maxSpeed = v; maxAngle = a; }
  }
  const accelTdc = w * w * r * (1 + r / L);
  const accelBdc = w * w * r * (1 - r / L);
  const recipKg = (i.piston + i.pin + i.rings + i.rodMass / 3) / 1000;
  const forceTdc = recipKg * accelTdc;
  const rodRatio = i.rod / i.stroke;
  const rpmLimit = (STREET_SPEED * 60) / (2 * S);
  const rating = meanSpeed < 20 ? 'excellent' : meanSpeed < 23 ? 'good' : meanSpeed < 26 ? 'acceptable' : meanSpeed < 30 ? 'high' : 'extreme';
  return {
    meanSpeed, maxSpeed, maxAngle, accelTdc, accelBdc, accelG: accelTdc / 9.80665, recipKg, forceTdc, rodRatio, rpmLimit, rating,
    rod: rodRatio < 1.5 ? 'increase_rod' : rodRatio < 1.75 ? 'good' : 'excellent',
  };
}

/** Vitesse et accélération du piston sur un tour (0–360°). */
export function crankCurve(i) {
  const r = i.stroke / 2000;
  const L = i.rod / 1000;
  const pts = [];
  for (let a = 0; a <= 360; a += 15) pts.push({ a, v: pistonVelocity(a, r, L, i.rpm), acc: pistonAcceleration(a, r, L, i.rpm) / 9.80665 });
  return pts;
}

/** Force d'inertie au PMH selon le régime. */
export function forceCurve(i) {
  const pts = [];
  for (let rpm = 1000; rpm <= i.rpm + 1; rpm += 500) pts.push({ rpm, f: computePiston({ ...i, rpm }).forceTdc });
  return pts;
}
