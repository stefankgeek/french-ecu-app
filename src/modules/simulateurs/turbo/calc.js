/**
 * Calibrage turbo — point de fonctionnement du compresseur.
 *
 * Reprend la démarche de l'ancien site (turbo-calibrage.php) en corrigeant les erreurs relevées
 * le 25/10/2026 (validation générale de Stéphane : « si faux, corrige et informe ») :
 *  1. Débit d'air : calculé avec la densité de l'air DANS LE COLLECTEUR (pression de suralimentation,
 *     température après intercooler). L'ancien site utilisait la densité de l'air ambiant → débit et
 *     puissance sous-estimés d'autant que la pression monte.
 *  2. Débit corrigé (lecture des cartes compresseur) : ṁ·√(T1/Tréf) ÷ (P1/Préf). L'ancien site
 *     avait inversé les deux rapports.
 *  3. Rapport de pression : P2 = collecteur + pertes intercooler/durites ; P1 = atmosphère − pertes du
 *     filtre à air (l'ancien site ajoutait les pertes d'admission au numérateur).
 *  4. Puissance : énergie du carburant brûlable avec l'air disponible × rendement 0,33
 *     (≈ 10 hp par lb/min d'air, règle courante). L'ancien site utilisait 0,35.
 *  5. Température d'échappement « 400 + 2 × kW » supprimée (sans fondement physique).
 *  6. Diamètre d'échappement : l'ancienne formule donnait plusieurs mètres ; remplacée par la règle
 *     de section usuelle (voir exhaust/calc.js).
 * Formule conservée : température de sortie compresseur T2 = T1·(1 + (PR^((γ−1)/γ) − 1)/ηc).
 */
import { recommendedPipeMm } from '../exhaust/calc.js';

export const R_AIR = 287.05; // J/(kg·K)
export const GAMMA = 1.4;
export const ENGINE_EFFICIENCY = 0.33;
export const MAP_REFERENCES = {
  std: { tK: 288.15, pBar: 1.01325 }, // conditions standard 15 °C / 1,013 bar
  garrett: { tK: 302.6, pBar: 0.9619 }, // cartes Garrett : 545 °R / 13,95 psia
};

const K = 273.15;

/**
 * @param {object} i dispL (L), rpm, ve (0–1), pManBarA (bar abs), tAmbC, pAtmBar, etaC (0–1),
 *   dpIcBar, dpInletBar, icEff (0–1), afr (stœchio.), pciMJkg, ref ('std'|'garrett')
 */
export function computeTurbo(i) {
  const p1 = i.pAtmBar - i.dpInletBar;
  const p2 = i.pManBarA + i.dpIcBar;
  const pr = p2 / p1;
  const t1 = i.tAmbC + K;
  const t2 = t1 * (1 + (Math.pow(pr, (GAMMA - 1) / GAMMA) - 1) / i.etaC);
  const tMan = t2 - i.icEff * (t2 - t1);
  const rhoMan = (i.pManBarA * 1e5) / (R_AIR * tMan);
  const airKgS = (i.dispL / 1000) * (i.rpm / 120) * i.ve * rhoMan;
  const ref = MAP_REFERENCES[i.ref] || MAP_REFERENCES.std;
  const correctedKgS = (airKgS * Math.sqrt(t1 / ref.tK)) / (p1 / ref.pBar);
  const powerKw = (airKgS / i.afr) * i.pciMJkg * 1e3 * ENGINE_EFFICIENCY;
  return {
    p1, p2, pr, t1C: t1 - K, t2C: t2 - K, tManC: tMan - K, rhoMan, airKgS, correctedKgS, powerKw,
    boostGauge: i.pManBarA - i.pAtmBar,
    exhaustMm: recommendedPipeMm(powerKw, true),
  };
}

/** Ligne de fonctionnement pleine charge (même pression) de 2000 tr/min au régime saisi (11 points). */
export function operatingLine(i) {
  const start = Math.min(2000, i.rpm);
  return Array.from({ length: 11 }, (_, k) => {
    const rpm = Math.round(start + ((i.rpm - start) * k) / 10);
    const r = computeTurbo({ ...i, rpm });
    return { rpm, flow: r.correctedKgS, pr: r.pr };
  });
}
