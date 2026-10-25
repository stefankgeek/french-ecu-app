/**
 * Simulateurs « suralimentation » — contrôles physiques.
 * Les formules de l'ancien site étaient fausses (voir l'en-tête de chaque calc.js) : on vérifie ici
 * la cohérence physique et des ordres de grandeur réalistes plutôt qu'une parité.
 */
import { describe, it, expect } from 'vitest';
import { computeTurbo } from '../src/modules/simulateurs/turbo/calc.js';
import { computeWastegate, requiredValveMm } from '../src/modules/simulateurs/wastegate/calc.js';
import { computeIntercooler } from '../src/modules/simulateurs/intercooler/calc.js';
import { computeExhaust, recommendedPipeMm } from '../src/modules/simulateurs/exhaust/calc.js';

const TURBO = { dispL: 2, rpm: 6000, ve: 0.85, pManBarA: 2.0, tAmbC: 25, pAtmBar: 1.013, etaC: 0.75, dpIcBar: 0.1, dpInletBar: 0.05, icEff: 0.7, afr: 14.7, pciMJkg: 44, ref: 'std' };

describe('turbo', () => {
  it('rapport de pression = (collecteur + pertes IC) / (atmosphère − filtre)', () => {
    expect(computeTurbo(TURBO).pr).toBeCloseTo(2.1 / 0.963, 4);
  });
  it('T2 isentropique corrigée du rendement', () => {
    const r = computeTurbo(TURBO);
    const t1 = 298.15;
    expect(r.t2C + 273.15).toBeCloseTo(t1 * (1 + (Math.pow(r.pr, 0.4 / 1.4) - 1) / 0.75), 6);
  });
  it('le débit d\'air augmente avec la pression de suralimentation (densité au collecteur)', () => {
    expect(computeTurbo({ ...TURBO, pManBarA: 2.5 }).airKgS).toBeGreaterThan(computeTurbo(TURBO).airKgS * 1.15);
  });
  it('2,0 L à 1 bar et 6000 tr/min ≈ 230–260 hp (≈ 10 hp par lb/min)', () => {
    const r = computeTurbo(TURBO);
    const hp = r.powerKw / 0.7457;
    expect(hp).toBeGreaterThan(220); expect(hp).toBeLessThan(270);
    expect(hp / (r.airKgS * 132.277)).toBeCloseTo(10, 0);
  });
  it('débit corrigé : air plus chaud ou pression plus basse → débit corrigé plus grand', () => {
    const r = computeTurbo(TURBO);
    const hot = computeTurbo({ ...TURBO, tAmbC: 40 });
    expect(hot.correctedKgS / hot.airKgS).toBeGreaterThan(r.correctedKgS / r.airKgS);
    const alt = computeTurbo({ ...TURBO, pAtmBar: 0.85 });
    expect(alt.correctedKgS / alt.airKgS).toBeGreaterThan(r.correctedKgS / r.airKgS);
  });
});

describe('wastegate', () => {
  it('étalonnage : 450 hp à 1 bar → Ø 38 mm', () => {
    expect(requiredValveMm(450 * 0.745699872, 1)).toBeCloseTo(38, 6);
  });
  it('plus de puissance → soupape plus grande ; plus de pression → plus petite', () => {
    expect(requiredValveMm(500, 1)).toBeGreaterThan(requiredValveMm(300, 1));
    expect(requiredValveMm(300, 2)).toBeLessThan(requiredValveMm(300, 0.8));
  });
  it('sans contrôleur : pression obtenue = ressort, ressort conseillé = cible', () => {
    const r = computeWastegate({ powerKw: 220, boostBar: 1, type: 'external', valveMm: 38, springBar: 0.7, control: 'manual' });
    expect(r.expectedBoost).toBe(0.7); expect(r.recommendedSpring).toBe(1);
    expect(r.warnings.some((w) => w.key === 'spring_manual')).toBe(true);
  });
  it('avec EBC : cible atteinte jusqu\'à 2 × le ressort', () => {
    const ok = computeWastegate({ powerKw: 220, boostBar: 1.2, type: 'external', valveMm: 38, springBar: 0.7, control: 'ebc' });
    expect(ok.expectedBoost).toBe(1.2); expect(ok.ebcDuty).toBeCloseTo(71.4, 1);
    const ko = computeWastegate({ powerKw: 220, boostBar: 1.6, type: 'external', valveMm: 38, springBar: 0.7, control: 'ebc' });
    expect(ko.expectedBoost).toBeCloseTo(1.4, 6);
    expect(ko.warnings.some((w) => w.key === 'target_unreachable')).toBe(true);
  });
  it('clapet interne trop petit pour 600 hp → conseil wastegate externe + creep', () => {
    const r = computeWastegate({ powerKw: 450, boostBar: 1.2, type: 'internal', valveMm: 30, springBar: 0.8, control: 'ebc' });
    expect(r.internalTooSmall).toBe(true); expect(r.fit.creep).toBe('high');
  });
});

const IC = { dispL: 2, rpm: 7000, ve: 0.85, boostBar: 1.5, pAtmBar: 1.013, tInC: 120, tAmbC: 25, type: 'air-air', coreW: 600, coreH: 300, coreT: 100, fins: 14, pipeMm: 60, pipeLenM: 2, speedKmh: 100, fan: false };

describe('intercooler', () => {
  it('cas de référence : efficacité ≈ 80 %, perte de charge 0,05–0,2 bar', () => {
    const r = computeIntercooler(IC);
    expect(r.eff).toBeGreaterThan(0.75); expect(r.eff).toBeLessThan(0.9);
    expect(r.dpBar).toBeGreaterThan(0.05); expect(r.dpBar).toBeLessThan(0.2);
  });
  it('débit d\'air réaliste (≈ 0,2–0,35 kg/s pour un 2 L à 1,5 bar et 7000 tr/min)', () => {
    const r = computeIntercooler(IC);
    expect(r.massKgS).toBeGreaterThan(0.2); expect(r.massKgS).toBeLessThan(0.35);
  });
  it('petit faisceau → moins efficace et plus de perte de charge', () => {
    const big = computeIntercooler(IC); const small = computeIntercooler({ ...IC, coreW: 400, coreH: 200, coreT: 60 });
    expect(small.eff).toBeLessThan(big.eff); expect(small.dpBar).toBeGreaterThan(big.dpBar);
  });
  it('à l\'arrêt (sans ventilateur) l\'efficacité chute', () => {
    expect(computeIntercooler(IC, { speedKmh: 0 }).eff).toBeLessThan(computeIntercooler(IC).eff - 0.3);
  });
  it('la température de sortie reste entre l\'ambiante et l\'entrée', () => {
    const r = computeIntercooler(IC);
    expect(r.tOutC).toBeGreaterThan(IC.tAmbC); expect(r.tOutC).toBeLessThan(IC.tInC);
  });
});

const EX = { dispL: 2, cylinders: 4, rpm: 7000, powerKw: 147, type: 'na', boostBar: 1, header: 'tubular', primaryMm: 38, collectorMm: 60, pipeMm: 60, pipeLenM: 2.5, cat: 'high_flow', muffler: 'sport', bends: 4 };

describe('échappement', () => {
  it('diamètre conseillé réaliste : 200 ch atmo ≈ 57 mm (2,25"), 400 hp turbo ≈ 90 mm', () => {
    expect(recommendedPipeMm(147, false)).toBeGreaterThan(54); expect(recommendedPipeMm(147, false)).toBeLessThan(60);
    expect(recommendedPipeMm(400 * 0.7457, true)).toBeGreaterThan(85); expect(recommendedPipeMm(400 * 0.7457, true)).toBeLessThan(95);
  });
  it('les pertes varient avec le carré du débit', () => {
    const a = computeExhaust(EX); const b = computeExhaust(EX, 0.5);
    expect(b.totalPa / a.totalPa).toBeCloseTo(0.25, 6);
  });
  it('un tube plus gros réduit la contre-pression', () => {
    expect(computeExhaust({ ...EX, pipeMm: 70 }).totalPa).toBeLessThan(computeExhaust(EX).totalPa);
  });
  it('perte de pompage = ΔP × volume balayé par seconde (quelques % de la puissance)', () => {
    const r = computeExhaust(EX);
    expect(r.pumpingKw).toBeCloseTo((r.totalPa * 0.002 * (7000 / 120)) / 1000, 6);
    expect(r.pumpingKw / EX.powerKw).toBeLessThan(0.06);
  });
  it('turbo : collecteur non compté (en amont de la turbine) et pression avant turbine estimée', () => {
    const r = computeExhaust({ ...EX, type: 'turbo', powerKw: 220 });
    expect(r.losses.header).toBe(0); expect(r.turboManifoldBarA).toBeGreaterThan(3);
  });
});
