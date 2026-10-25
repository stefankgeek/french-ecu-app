/**
 * Harmonics3+ — synthèse moteur.
 *
 * L'ancien Harmonics3+ juxtaposait 6 onglets indépendants dont la plupart des formules étaient fausses
 * (règle du 25/10/2026 : « si faux, corrige et informe ») :
 *  - injection : même erreur de correction de pression que l'ancien calculateur injecteurs ;
 *  - admission : CFM calculé avec des litres (formule en pouces cubes) et longueur de pipe ≈ 10 mm ;
 *  - thermique : EGT qui AUGMENTAIT en enrichissant (c'est l'inverse) ;
 *  - performances : mélange hp/lb·ft et N·m, courbes de puissance fictives ;
 *  - avance à l'allumage « universelle » sans fondement (dangereuse à appliquer) ;
 *  - onglet diagnostic vide.
 * Nouveau principe : UNE seule fiche moteur, et tous les calculs utilisent les modules corrigés de
 * l'appli (turbo, injecteurs) pour donner une synthèse cohérente + un diagnostic automatique.
 * L'avance à l'allumage n'est plus chiffrée : on évalue le RISQUE DE CLIQUETIS via le taux de compression
 * effectif sous pression comparé à l'indice d'octane du carburant (règle indicative, data/knock.js).
 */
import { computeTurbo } from '../turbo/calc.js';
import { computeInjectors } from '../injectors/calc.js';
import { FUELS } from '../../data/fuels-data.js';
import { effectiveStrokeFraction } from '../../data/kinematics.js';
import { effectiveCr, requiredRon, knockRisk } from '../../data/knock.js';

const HP_PER_KW = 1 / 0.745699872;

export const INTAKE_CENTERLINE = 106; // centre de came admission supposé (° après PMH)
export const ROD_RATIO = 1.6; // rapport bielle/course supposé

/** Longueur de pipe d'admission accordée (formule d'Engle, 3ᵉ onde) en mm. */
export function runnerLengthMm(rpm, inDuration) {
  const ecd = 720 - (inDuration - 30);
  const inches = (ecd * 0.25 * 1300 * 2) / (rpm * 4);
  return inches * 25.4;
}

export function computeHarmonics(i) {
  const fuel = FUELS[i.fuel];
  const turbo = computeTurbo({
    dispL: i.dispL, rpm: i.rpm, ve: i.ve, pManBarA: 1.01325 + i.boostBar, tAmbC: i.ambient, pAtmBar: 1.01325,
    etaC: i.etaC, dpIcBar: i.boostBar > 0 ? 0.1 : 0, dpInletBar: 0.03, icEff: i.boostBar > 0 ? i.icEff : 0,
    afr: fuel.afr, pciMJkg: fuel.pci, ref: 'std',
  });
  const powerKw = turbo.powerKw;
  const inj = computeInjectors({
    cylinders: i.cylinders, displacementL: i.dispL, powerHp: powerKw * HP_PER_KW, rpm: i.rpm, bsfc: fuel.bsfc,
    railBar: i.rail, duty: 0.8, intakeBarA: 1.01325 + i.boostBar, ve: i.ve, airTempC: i.ambient, throttle: 1, tofi: 1, densityKgL: fuel.density,
  });
  const torqueNm = (powerKw * 1000) / ((2 * Math.PI * i.rpm) / 60);
  const wheelKw = powerKw * i.drivetrain;
  const ivc = INTAKE_CENTERLINE + i.inDuration / 2 - 180;
  const dcr = 1 + effectiveStrokeFraction(ivc, 1, 2 * ROD_RATIO) * (i.cr - 1);
  const ecr = effectiveCr(dcr, i.boostBar);
  const ronNeeded = requiredRon(dcr, i.boostBar);
  // L'éthanol refroidit la charge : tenue au cliquetis supérieure à son indice RON (≈ +0,1 par % d'éthanol)
  const fuelRon = (fuel.ron || 95) + 0.1 * fuel.ethanol;
  const knock = knockRisk(ronNeeded, fuelRon);
  const otto = 1 - 1 / Math.pow(i.cr, 0.3);
  const runner = runnerLengthMm(i.rpm, i.inDuration);
  const plenumL = i.dispL * (i.boostBar > 0 ? 1.5 : 0.8);
  const heatKw = powerKw * 1.0; // chaleur au circuit de refroidissement ≈ puissance utile (essence)
  const diagnostics = [];
  if (knock === 'high') diagnostics.push({ key: 'knock_high', status: 'danger' });
  else if (knock === 'medium') diagnostics.push({ key: 'knock_medium', status: 'warn' });
  if (turbo.t2C > 150 && i.icEff < 0.6) diagnostics.push({ key: 'hot_charge', status: 'warn' });
  if (turbo.pr > 3) diagnostics.push({ key: 'pr_high', status: 'warn' });
  if (inj.flowCcMin > 1000) diagnostics.push({ key: 'big_injectors', status: 'info' });
  if (i.boostBar > 0 && i.cr > 10.5) diagnostics.push({ key: 'cr_boost', status: 'warn' });
  if (!diagnostics.length) diagnostics.push({ key: 'all_ok', status: 'ok' });
  return { turbo, powerKw, torqueNm, wheelKw, inj, dcr, ecr, ronNeeded, fuelRon, knock, otto, runner, plenumL, heatKw, diagnostics, fuel };
}

/** Puissance et couple estimés selon la pression de suralimentation (0 à 2,5 bar). */
export function boostCurve(i) {
  return [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5].map((b) => {
    const r = computeHarmonics({ ...i, boostBar: b });
    return { b, kw: r.powerKw, nm: r.torqueNm, ecr: r.ecr };
  });
}
