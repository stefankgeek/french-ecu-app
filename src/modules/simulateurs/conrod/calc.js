/**
 * Simulateur d'embiellage — contraintes sur bielle, axe et maneton.
 *
 * L'ancien site (Bielle.php) n'était pas utilisable ; reconstruit sur des bases mécaniques
 * (règle du 25/10/2026 : « si faux, corrige et informe ») :
 *  - course figée à 86 mm, bielle modélisée comme un rond plein de Ø 20 mm, masse de piston figée ;
 *  - « pression maxi » = pression de compression seule (≈ 24 bar), sans combustion → efforts sous-estimés ;
 *  - erreur d'unités sur le couple (kN·m affichés en N·m) : « couple 0 Nm, puissance 0,1 kW » ;
 *  - température maxi sans fondement physique.
 * Nouveau modèle :
 *  - Pression de combustion maxi ≈ P_admission × TC^1,3 × 3,0 (≈ 65 bar en atmo TC 10,5 ;
 *    ≈ 105 bar à 1 bar de pression avec TC 9) — ordre de grandeur mesuré sur moteurs essence.
 *  - Compression de la bielle = force des gaz au pic (≈ 15° après PMH) − inertie à cet angle.
 *  - Traction de la bielle = inertie au PMH d'échappement au régime maxi : m·ω²·r·(1 + r/L).
 *  - Contraintes dans la section mini du fût (saisie) ; axe en double cisaillement ; pression sur maneton.
 *  - Coefficients de sécurité = limite élastique / contrainte. Flambage non calculé (voir notice).
 *  - Couple estimé par la PME (≈ 12,5 bar en atmo, proportionnelle à la pression d'admission).
 */
import { pistonAcceleration, pistonPosition } from '../../data/kinematics.js';

export const COMBUSTION_RATIO = 3.0;
export const PEAK_ANGLE = 15; // ° après PMH
export const BMEP_NA_BAR = 12.5;
export const PIN_YIELD_MPA = 900; // acier d'axe cémenté typique
export const BEARING_WARN_MPA = 50;
export const BEARING_DANGER_MPA = 70;

export function computeConrod(i) {
  const r = i.stroke / 2000; // m
  const L = i.rod / 1000;
  const A = (Math.PI / 4) * (i.bore / 1000) ** 2; // m²
  const pIn = 1.01325 + i.boostBar; // bar abs
  const peakBar = pIn * Math.pow(i.cr, 1.3) * COMBUSTION_RATIO;
  const gasN = peakBar * 1e5 * A;
  const recipKg = (i.pistonKit + i.rodMass / 3) / 1000;
  const inertiaPeak = recipKg * pistonAcceleration(PEAK_ANGLE, r, L, i.rpm); // N (positif = vers le haut)
  const compressionN = gasN - inertiaPeak;
  const w = (2 * Math.PI * i.rpmMax) / 60;
  const tensionN = recipKg * w * w * r * (1 + r / L);
  const shankArea = i.shankArea * 1e-6; // m²
  const sigmaComp = compressionN / shankArea / 1e6; // MPa
  const sigmaTens = tensionN / shankArea / 1e6;
  const pinArea = (Math.PI / 4) * ((i.pinOd / 1000) ** 2 - (i.pinId / 1000) ** 2);
  const tauPin = gasN / (2 * pinArea) / 1e6; // MPa (double cisaillement)
  const bearingMpa = gasN / ((i.crankpin / 1000) * (i.bearingWidth / 1000)) / 1e6;
  const sf = {
    comp: i.yield / sigmaComp,
    tens: i.yield / sigmaTens,
    pin: (0.577 * PIN_YIELD_MPA) / tauPin,
  };
  const rating = (f) => (f > 2 ? 'excellent' : f > 1.5 ? 'good' : f > 1 ? 'limit' : 'failure');
  const dispL = A * (2 * r) * i.cylinders * 1000;
  const bmep = BMEP_NA_BAR * (pIn / 1.01325);
  const torqueNm = (bmep * 1e5 * dispL / 1000) / (4 * Math.PI);
  const powerKw = (torqueNm * 2 * Math.PI * i.rpm) / 60 / 1000;
  const worst = Math.min(sf.comp, sf.tens, sf.pin);
  return {
    peakBar, gasN, inertiaPeak, compressionN, tensionN, recipKg, sigmaComp, sigmaTens, tauPin, bearingMpa, sf,
    ratings: { comp: rating(sf.comp), tens: rating(sf.tens), pin: rating(sf.pin) },
    bearing: bearingMpa > BEARING_DANGER_MPA ? 'danger' : bearingMpa > BEARING_WARN_MPA ? 'warn' : 'ok',
    dispL, bmep, torqueNm, powerKw, overall: rating(worst),
  };
}

/**
 * Cycle simplifié sur 720° (0 = PMH d'allumage) : force des gaz (compression/détente polytropiques,
 * combustion calée pour atteindre la pression maxi à 15° après PMH), force d'inertie, force sur la bielle.
 */
export function cycleCurve(i) {
  const r = i.stroke / 2000;
  const L = i.rod / 1000;
  const A = (Math.PI / 4) * (i.bore / 1000) ** 2;
  const Vs = A * 2 * r;
  const Vc = Vs / (i.cr - 1);
  const V = (deg) => Vc + A * pistonPosition(deg, r, L);
  const pIn = (1.01325 + i.boostBar) * 1e5;
  const n = 1.3;
  const r0 = computeConrod(i);
  const pPeak = r0.peakBar * 1e5;
  const Vpeak = V(PEAK_ANGLE);
  const recipKg = r0.recipKg;
  const pts = [];
  for (let a = -360; a <= 360; a += 5) {
    let p;
    const t = ((a % 720) + 720) % 720; // 0–720 depuis le PMH d'allumage
    if (t >= 540 || t === 0) {
      // compression (de −180° à 0°)
      p = pIn * Math.pow((Vc + Vs) / V(t), n);
    } else if (t <= 180) {
      // combustion / détente
      const pComp = pIn * Math.pow((Vc + Vs) / V(t), n);
      const pExp = pPeak * Math.pow(Vpeak / V(t), n);
      const blend = t < PEAK_ANGLE ? t / PEAK_ANGLE : 1;
      p = Math.max(pComp, pComp + (pExp - pComp) * blend);
    } else if (t < 360) {
      p = 1.1e5; // échappement
    } else {
      p = pIn * 0.95; // admission
    }
    const gas = (p - 1.01325e5) * A;
    const inertia = recipKg * pistonAcceleration(a, r, L, i.rpm);
    pts.push({ a, bar: p / 1e5, gasKn: gas / 1000, inertiaKn: -inertia / 1000, rodKn: (gas - inertia) / 1000 });
  }
  return pts;
}
