/**
 * Simulateurs « moteur » — contrôles physiques et ordres de grandeur.
 * Plusieurs formules de l'ancien site étaient fausses (voir l'en-tête de chaque calc.js) :
 * on vérifie des valeurs de référence calculées à la main et la cohérence des tendances.
 */
import { describe, it, expect } from 'vitest';
import { computeCompression } from '../src/modules/simulateurs/compression/calc.js';
import { computeCam } from '../src/modules/simulateurs/camshaft/calc.js';
import { computePiston } from '../src/modules/simulateurs/piston_speed/calc.js';
import { computeValveSpring } from '../src/modules/simulateurs/valve_spring/calc.js';
import { computeRingGap } from '../src/modules/simulateurs/ring_gap/calc.js';
import { computeConrod } from '../src/modules/simulateurs/conrod/calc.js';
import { computeHarmonics, runnerLengthMm } from '../src/modules/simulateurs/harmonics/calc.js';
import { requiredRon, knockRisk } from '../src/modules/data/knock.js';

const COMP = { bore: 86, stroke: 86, rod: 144, cylinders: 4, deck: 0.5, chamber: 50, gasketBore: 87, gasketThickness: 1.0,
  pistonType: 'flat', pistonCc: 0, reliefs: 5, ivc: 50, boostBar: 0 };
const CAM = { inDur: 280, exDur: 280, inCl: 106, exCl: 114, inLift: 11, exLift: 10.5, dispL: 2, cylinders: 4, boost: 'na', cr: 10.5, rodRatio: 1.6 };
const PISTON = { stroke: 86, rod: 144, rpm: 7000, piston: 400, pin: 80, rings: 40, rodMass: 550 };
const SPRING = { lift: 11, duration: 280, rpm: 7000, valve: 80, retainer: 15, springMass: 50, follower: 30, rate: 40,
  freeHeight: 50, installed: 40, coilBind: 28, dual: false };
const ROD = { bore: 86, stroke: 86, rod: 144, cylinders: 4, cr: 10.5, boostBar: 0, rpm: 6000, rpmMax: 7000, pistonKit: 520,
  rodMass: 550, shankArea: 180, yield: 550, pinOd: 22, pinId: 13, crankpin: 48, bearingWidth: 20 };
const HARM = { dispL: 2, cylinders: 4, cr: 9.5, rpm: 6000, ve: 0.9, inDuration: 260, boostBar: 1, fuel: 'sp98', ambient: 25,
  etaC: 0.75, icEff: 0.7, rail: 3.5, drivetrain: 0.85 };

describe('Compression', () => {
  it('taux statique : (V balayé + V mort) / V mort', () => {
    const r = computeCompression(COMP);
    const swept = Math.PI / 4 * 0.86 ** 2 * 0.86 * 1000;
    const gasket = Math.PI / 4 * 0.87 ** 2 * 0.01 * 1000;
    const deck = Math.PI / 4 * 0.86 ** 2 * 0.005 * 1000;
    const clearance = 50 + gasket + deck + 5;
    expect(r.staticCr).toBeCloseTo((swept + clearance) / clearance, 2);
    expect(r.staticCr).toBeCloseTo(8.82, 1);
  });
  it('taux dynamique < statique et diminue quand l\'admission ferme plus tard', () => {
    const a = computeCompression({ ...COMP, ivc: 40 });
    const b = computeCompression({ ...COMP, ivc: 80 });
    expect(a.dynamicCr).toBeLessThan(a.staticCr);
    expect(b.dynamicCr).toBeLessThan(a.dynamicCr);
  });
  it('piston bombé augmente le taux, piston creusé le diminue', () => {
    const flat = computeCompression(COMP).staticCr;
    expect(computeCompression({ ...COMP, pistonType: 'domed', pistonCc: 5 }).staticCr).toBeGreaterThan(flat);
    expect(computeCompression({ ...COMP, pistonType: 'dished', pistonCc: 5 }).staticCr).toBeLessThan(flat);
  });
  it('la pression de suralimentation augmente le taux effectif', () => {
    expect(computeCompression({ ...COMP, boostBar: 1 }).effectiveCr).toBeGreaterThan(computeCompression(COMP).effectiveCr);
  });
});

describe('Arbre à cames', () => {
  it('croisement = (durée adm + durée éch) / 2 − 2 × LSA (et non 288°)', () => {
    const r = computeCam(CAM);
    expect(r.lsa).toBe(110);
    expect(r.overlap).toBeCloseTo(60, 6);
    expect(r.advance).toBe(4);
  });
  it('calage : OA/FA/OE/FE cohérents avec durée et centres', () => {
    const r = computeCam(CAM);
    expect(r.ivo + 180 + r.ivc).toBeCloseTo(280, 6);
    expect(r.evo + 180 + r.evc).toBeCloseTo(280, 6);
    expect(r.ivo + r.evc).toBeCloseTo(r.overlap, 6);
  });
  it('une came plus longue déplace la plage de puissance vers le haut', () => {
    expect(computeCam({ ...CAM, inDur: 300, exDur: 300 }).peakRpm).toBeGreaterThan(computeCam(CAM).peakRpm);
  });
  it('un croisement nul donne un ralenti correct sans reprogrammation', () => {
    const r = computeCam({ ...CAM, inDur: 220, exDur: 220 });
    expect(r.overlap).toBeLessThan(10);
    expect(r.ecu).toBe('optional');
  });
});

describe('Vitesse piston', () => {
  it('vitesse moyenne = 2 × course × régime', () => {
    expect(computePiston(PISTON).meanSpeed).toBeCloseTo(2 * 0.086 * 7000 / 60, 6);
  });
  it('accélération au PMH = ω²·r·(1 + r/L) ≈ 3 060 g à 7 000 tr/min', () => {
    const r = computePiston(PISTON);
    const w = 7000 * 2 * Math.PI / 60;
    expect(r.accelTdc).toBeCloseTo(w * w * 0.043 * (1 + 43 / 144), 0);
    expect(r.accelG).toBeGreaterThan(3000);
    expect(r.accelG).toBeLessThan(3120);
  });
  it('vitesse maxi ≈ 1,6 × vitesse moyenne, atteinte avant 90°', () => {
    const r = computePiston(PISTON);
    expect(r.maxSpeed / r.meanSpeed).toBeGreaterThan(1.55);
    expect(r.maxSpeed / r.meanSpeed).toBeLessThan(1.7);
    expect(r.maxAngle).toBeLessThan(90);
  });
  it('masse alternative = piston + axe + segments + ⅓ bielle', () => {
    expect(computePiston(PISTON).recipKg).toBeCloseTo((400 + 80 + 40 + 550 / 3) / 1000, 6);
  });
});

describe('Ressorts de soupapes', () => {
  it('précharge, efforts et réserve aux spires jointives', () => {
    const r = computeValveSpring(SPRING);
    expect(r.preload).toBeCloseTo(10, 6);
    expect(r.seat).toBeCloseTo(400, 0);
    expect(r.open).toBeCloseTo(840, 0);
    expect(r.bindMargin).toBeCloseTo(1, 6);
  });
  it('marge par défaut ≈ 21 % et qui baisse avec le régime', () => {
    const r = computeValveSpring(SPRING);
    expect(r.margin).toBeGreaterThan(0.18);
    expect(r.margin).toBeLessThan(0.24);
    expect(computeValveSpring({ ...SPRING, rpm: 8000 }).margin).toBeLessThan(r.margin);
  });
  it('une came plus courte (plus agressive) demande plus d\'effort', () => {
    expect(computeValveSpring({ ...SPRING, duration: 240 }).required).toBeGreaterThan(computeValveSpring(SPRING).required);
  });
  it('effort nécessaire ∝ régime²', () => {
    const a = computeValveSpring({ ...SPRING, rpm: 5000 }).required;
    const b = computeValveSpring({ ...SPRING, rpm: 10000 }).required;
    expect(b / a).toBeCloseTo(4, 6);
  });
});

describe('Jeu à la coupe', () => {
  it('86 mm atmo : 0,004 × alésage en pouces', () => {
    const r = computeRingGap({ boreMm: 86, engine: 'four_stroke', application: 'naturally_aspirated' });
    expect(r.top).toBeCloseTo(0.344, 3);
    expect(r.second).toBeCloseTo(0.43, 3);
    expect(r.oil).toBeCloseTo(0.381, 3);
  });
  it('turbo demande plus de jeu que l\'atmo, 2 temps sans racleur', () => {
    const na = computeRingGap({ boreMm: 86, engine: 'four_stroke', application: 'naturally_aspirated' });
    const fi = computeRingGap({ boreMm: 86, engine: 'four_stroke', application: 'forced_induction' });
    expect(fi.top).toBeGreaterThan(na.top);
    expect(computeRingGap({ boreMm: 54, engine: 'two_stroke', application: 'snow_marine' }).oil).toBeNull();
  });
});

describe('Embiellage', () => {
  it('le couple n\'est plus nul (bug kN·m de l\'ancien site) : ≈ 200 N·m pour 2 L atmo', () => {
    const r = computeConrod(ROD);
    expect(r.torqueNm).toBeGreaterThan(180);
    expect(r.torqueNm).toBeLessThan(220);
    expect(r.powerKw).toBeCloseTo(r.torqueNm * 6000 * 2 * Math.PI / 60 / 1000, 6);
  });
  it('pression de combustion ≈ 65 bar en atmo TC 10,5, plus haute avec pression', () => {
    const na = computeConrod(ROD);
    expect(na.peakBar).toBeGreaterThan(55);
    expect(na.peakBar).toBeLessThan(75);
    expect(computeConrod({ ...ROD, boostBar: 1, cr: 9 }).peakBar).toBeGreaterThan(95);
  });
  it('traction = inertie au PMH au régime maxi', () => {
    const r = computeConrod(ROD);
    const w = 7000 * 2 * Math.PI / 60;
    const recip = 0.52 + 0.55 / 3;
    expect(r.tensionN).toBeCloseTo(recip * w * w * 0.043 * (1 + 43 / 144), -1);
  });
  it('un matériau plus résistant augmente les coefficients de sécurité', () => {
    expect(computeConrod({ ...ROD, yield: 1500 }).sf.comp).toBeGreaterThan(computeConrod(ROD).sf.comp);
  });
  it('beaucoup de pression sur une bielle frittée → rupture probable', () => {
    expect(computeConrod({ ...ROD, boostBar: 2.5, cr: 10, shankArea: 120 }).overall).toBe('failure');
  });
});

describe('Harmonics3+ (synthèse) et cliquetis', () => {
  it('puissance plausible : 2 L, 1 bar, ≈ 190 kW', () => {
    const r = computeHarmonics(HARM);
    expect(r.powerKw).toBeGreaterThan(160);
    expect(r.powerKw).toBeLessThan(220);
    expect(r.wheelKw).toBeCloseTo(r.powerKw * 0.85, 6);
  });
  it('la puissance augmente avec la pression', () => {
    expect(computeHarmonics({ ...HARM, boostBar: 1.5 }).powerKw).toBeGreaterThan(computeHarmonics(HARM).powerKw);
  });
  it('longueur de pipe : plus courte à haut régime', () => {
    expect(runnerLengthMm(8000, 260)).toBeLessThan(runnerLengthMm(5000, 260));
  });
  it('l\'éthanol réduit le risque de cliquetis', () => {
    const sp = computeHarmonics({ ...HARM, boostBar: 1.5 });
    const e85 = computeHarmonics({ ...HARM, boostBar: 1.5, fuel: 'e85' });
    expect(e85.fuelRon).toBeGreaterThan(sp.fuelRon);
    const order = { low: 0, medium: 1, high: 2 };
    expect(order[e85.knock]).toBeLessThanOrEqual(order[sp.knock]);
  });
  it('octane requis croît avec le taux effectif', () => {
    expect(requiredRon(9, false)).toBeGreaterThan(requiredRon(8, false));
    expect(knockRisk(90, 98)).toBe('low');
    expect(knockRisk(100, 95)).toBe('high');
  });
});
