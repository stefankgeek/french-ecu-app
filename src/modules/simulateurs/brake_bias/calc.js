/**
 * Répartition de freinage (brake bias).
 *
 * Ancien site (brake_bias.php) — vérifié le 25/10/2026 :
 *  - Transfert de charge m·a·h/L et répartition idéale = charge dynamique avant / masse : JUSTES, repris.
 *  - Distance de freinage v²/(2·μ·g·a) : FAUSSE, l'adhérence était comptée deux fois (a est déjà en g)
 *    → 43,7 m au lieu de 39,3 m à 100 km/h et 1 g. Corrigé : d = v²/(2·g·a).
 *  - Le réglage de répartition n'influençait pas la distance : une répartition éloignée de l'idéal
 *    bloque un essieu avant l'autre et limite la décélération. Ajouté : décélération maxi réellement
 *    atteignable avec ce réglage et essieu qui bloque en premier.
 *  - « Pression de freinage » sans effet sur le calcul → supprimée. « Stabilité » d'après la seule
 *    hauteur du CG → remplacée par le rapport h/L.
 *
 * Modèle (véhicule rigide, adhérence μ identique sur les 4 roues) :
 *  ψ = part statique avant, χ = h/L, β = part du freinage à l'avant.
 *  Blocage avant  : β·a = μ(ψ + a·χ)       → a_av = μψ / (β − μχ)
 *  Blocage arrière: (1−β)·a = μ(1−ψ − a·χ) → a_ar = μ(1−ψ) / (1 − β + μχ)
 *  Répartition idéale à la décélération a : β* = ψ + a·χ.
 */
export const G = 9.80665;

export function computeBrake(i) {
  const m = i.massKg;
  const psi = i.frontPct / 100;
  const chi = i.cgMm / i.wheelbaseMm;
  const mu = i.decelG; // décélération visée = adhérence disponible (pneus/route)
  const beta = i.biasPct / 100;

  const staticF = m * psi;
  const staticR = m - staticF;
  const transfer = m * mu * chi;
  const dynF = staticF + transfer;
  const dynR = staticR - transfer;
  const optimalPct = (psi + mu * chi) * 100;
  const diff = i.biasPct - optimalPct;

  const aFront = beta > mu * chi ? (mu * psi) / (beta - mu * chi) : Infinity;
  const aRear = (mu * (1 - psi)) / (1 - beta + mu * chi);
  const aMax = Math.min(aFront, aRear, mu);
  const firstLock = Math.abs(aFront - aRear) < 1e-9 ? 'both' : aFront < aRear ? 'front' : 'rear';
  const efficiency = aMax / mu;

  const v = i.speedKmh / 3.6;
  const distance = (v * v) / (2 * G * aMax);
  const distanceIdeal = (v * v) / (2 * G * mu);

  // Virage (indicatif) : transfert latéral par essieu au prorata des charges statiques.
  const latF = (staticF * i.lateralG * i.cgMm) / i.trackFrontMm;
  const latR = (staticR * i.lateralG * i.cgMm) / i.trackRearMm;
  const wheels = { inF: staticF / 2 - latF, outF: staticF / 2 + latF, inR: staticR / 2 - latR, outR: staticR / 2 + latR };

  const balance = Math.abs(diff) < 2 ? 'optimal' : Math.abs(diff) < 5 ? 'acceptable' : Math.abs(diff) < 10 ? 'adjust' : 'dangerous';
  return { staticF, staticR, transfer, dynF, dynR, optimalPct, diff, aFront, aRear, aMax, firstLock, efficiency, distance, distanceIdeal, chi, wheels, balance };
}

/** Décélération atteignable selon la répartition (graphique). */
export function biasCurve(i) {
  const pts = [];
  for (let b = 40; b <= 90; b += 2) pts.push({ b, a: computeBrake({ ...i, biasPct: b }).aMax });
  return pts;
}
