/**
 * Taux de compression.
 * Base : ancien site (compression_ratio.php). Le taux STATIQUE était juste et est conservé :
 *   CR = (Vcyl + Vc) / Vc, Vc = chambre + joint + dégagement piston/plan de joint + calotte creuse − dôme + encoches.
 * Corrections (règle validée par Stéphane le 25/10/2026 : « si faux, corrige et informe ») :
 *  1. Taux DYNAMIQUE : l'ancien site appliquait un coefficient forfaitaire (IVC fixé à 50°, ×0,15) qui le
 *     surestimait. Il est maintenant calculé avec la géométrie réelle bielle-manivelle à la fermeture
 *     de l'admission (IVC saisi, longueur de bielle saisie).
 *  2. Indice d'octane : déduit du taux dynamique (atmo) ou du taux effectif sous pression (turbo) au lieu
 *     du taux statique, qui ignore l'arbre à cames (règles indicatives : voir data/knock.js).
 *  3. Pression de compression : polytropique (n = 1,3) sur le taux dynamique, au lieu de CR^1,4 statique.
 *  4. Gain de puissance : rendement théorique d'Otto (γ = 1,3) au lieu de « 3 % par point » constant.
 */
import { effectiveStrokeFraction } from '../../data/kinematics.js';
import { effectiveCr as ecrOf, requiredRon, fuelForRon } from '../../data/knock.js';

const cyl = (dMm, hMm) => (Math.PI / 4) * (dMm / 10) ** 2 * (hMm / 10); // cm³

/** Rendement théorique du cycle d'Otto. */
export const ottoEfficiency = (cr, gamma = 1.3) => 1 - 1 / Math.pow(cr, gamma - 1);

/**
 * @param {object} i bore, stroke, rod (mm), cylinders, deck (mm, + = piston sous le plan), chamber (cm³),
 *   gasketBore, gasketThickness (mm), pistonType ('flat'|'dished'|'domed'), pistonCc (cm³), reliefs (cm³),
 *   ivc (° après PMB), boostBar (relatif)
 */
export function computeCompression(i) {
  const swept = cyl(i.bore, i.stroke);
  const gasket = cyl(i.gasketBore, i.gasketThickness);
  const deck = cyl(i.bore, Math.abs(i.deck)) * Math.sign(i.deck);
  const piston = i.pistonType === 'dished' ? Math.abs(i.pistonCc) : i.pistonType === 'domed' ? -Math.abs(i.pistonCc) : 0;
  const clearance = i.chamber + gasket + deck + piston + i.reliefs;
  const staticCr = (swept + clearance) / clearance;
  const frac = effectiveStrokeFraction(i.ivc, i.stroke / 2, i.rod);
  const dynamicCr = (swept * frac + clearance) / clearance;
  const effectiveCr = ecrOf(dynamicCr, i.boostBar); // taux effectif sous pression
  const octane = requiredRon(dynamicCr, i.boostBar); // règle indicative (voir data/knock.js)
  const fuel = fuelForRon(octane);
  const crankingBar = 1.01325 * Math.pow(dynamicCr, 1.3);
  const gainPct = (ottoEfficiency(staticCr) / ottoEfficiency(9) - 1) * 100;
  return {
    swept, gasket, deck, piston, clearance, staticCr, dynamicCr, effectiveCr, frac, octane, fuel, crankingBar, gainPct,
    displacement: swept * i.cylinders, parts: { chamber: i.chamber, gasket, deck, piston, reliefs: i.reliefs },
  };
}

/** Taux dynamique selon la fermeture d'admission (pour le graphique). */
export const ivcCurve = (i) => [20, 30, 40, 50, 60, 70, 80, 90].map((ivc) => ({ ivc, dcr: computeCompression({ ...i, ivc }).dynamicCr }));
