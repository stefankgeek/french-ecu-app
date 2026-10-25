/**
 * Non-régression des simulateurs « carburant ».
 * - Parties inchangées : valeurs de référence relevées sur l'ANCIEN site (mêmes entrées) le 25/10/2026.
 * - Parties corrigées (validées par Stéphane le 25/10/2026) : contrôles physiques de cohérence.
 */
import { describe, it, expect } from 'vitest';
import { computeInjectors, injectorSizes } from '../src/modules/simulateurs/injectors/calc.js';
import { computePump } from '../src/modules/simulateurs/fuel_pump/calc.js';
import { computeE85 } from '../src/modules/simulateurs/e85/calc.js';
import { correction, lambdaToAfr, afrToLambda, mixtureStatus } from '../src/modules/simulateurs/lambda/calc.js';
import { computeNos } from '../src/modules/simulateurs/nitrous/calc.js';

const close = (a, b, d = 1) => expect(a).toBeCloseTo(b, d);

const INJ = { cylinders: 4, displacementL: 2, powerHp: 200, rpm: 6500, bsfc: 0.5, railBar: 3, duty: 0.8, intakeBarA: 1, ve: 0.85, airTempC: 20, throttle: 1, tofi: 1, densityKgL: 0.75 };

describe('injecteurs', () => {
  it('débit nominal : 200 hp × 0,5 / 4 cyl / 80 % à 3 bar, essence 0,75 kg/L', () => {
    const r = computeInjectors(INJ);
    close(r.flowLbHr, 31.25, 2);
    close(r.flowCcMin, (31.25 * 453.59237) / 60 / 0.75, 1); // ≈ 315 cc/min
  });
  it('monter la pression de rampe permet un injecteur PLUS PETIT (Q ∝ √P)', () => {
    const r3 = computeInjectors(INJ);
    const r4 = computeInjectors({ ...INJ, railBar: 4 });
    expect(r4.flowCcMin).toBeLessThan(r3.flowCcMin);
    close(r4.flowCcMin / r3.flowCcMin, Math.sqrt(3 / 4), 4);
  });
  it('temps d\'injection = duty × durée du cycle + temps mort (≈ 15,8 ms à 6500 tr/min)', () => {
    const r = computeInjectors(INJ);
    close(r.injectionMs, 0.8 * (120000 / 6500) + 1, 3);
    expect(r.injectionMs).toBeLessThan(r.cycleMs); // jamais plus long qu'un cycle moteur
  });
  it('parties inchangées identiques à l\'ancien site (air, diamètres)', () => {
    const r = computeInjectors(INJ);
    close(r.airFlowLMin, 1381.3); close(r.intakeDiameterMm, 27.1); close(r.throttleDiameterMm, 62.5); close(r.safetyMargin, 20);
  });
  it('comparateur : duty cycle réel de chaque taille', () => {
    const r = computeInjectors(INJ);
    const s = injectorSizes(r.flowCcMin, r.netRatedCcMin);
    expect(s).toHaveLength(7);
    const best = s.find((x) => x.closest);
    expect(best.size).toBe(350);
    close(best.duty, (r.netRatedCcMin / 350) * 100, 3);
    expect(best.duty).toBeLessThan(80);
  });
});

describe('débit pompe', () => {
  it('pompe = consommation au duty maxi × 1,2 ; retour = excédent', () => {
    const r = computePump({ injFlowCcMin: 333, injectors: 4, densityKgL: 0.75, pipeDiameterMm: 6, pipeLengthM: 5, circuit: 'simple', dutyMax: 80 });
    close(r.outCcMin, 333 * 4 * 0.8 * 1.2, 3); close(r.pumpLh, r.outCcMin * 0.06, 3); close(r.returnCcMin, 333 * 4 * 0.8 * 0.2, 3);
    close(r.maxPipeCcMin, 2545, 0); // inchangé (ancien site)
  });
  it('le débit requis AUGMENTE avec le duty cycle (plafonné à 100 %)', () => {
    const f = (d) => computePump({ injFlowCcMin: 500, injectors: 6, densityKgL: 0.75, pipeDiameterMm: 8, pipeLengthM: 5, circuit: 'simple', dutyMax: d }).outCcMin;
    expect(f(90)).toBeGreaterThan(f(60));
    expect(f(120)).toBe(f(100));
  });
  it('circuit complexe = longueur × 1,5 (Darcy-Weisbach, inchangé)', () => {
    const p = { injFlowCcMin: 1000, injectors: 6, densityKgL: 0.78, pipeDiameterMm: 10, pipeLengthM: 6, dutyMax: 90 };
    const a = computePump({ ...p, circuit: 'simple' }); const b = computePump({ ...p, circuit: 'complex' });
    close(b.circuitLossPa / a.circuitLossPa, 1.5, 6);
  });
});

describe('E85 (ancien site)', () => {
  it('SP95 440 cc, 300 hp atmo', () => {
    const r = computeE85({ fuel: 'sp95', injCcMin: 440, railBar: 3, power: 300, boostBar: 0, l100: 8, kmYear: 20000, priceFuel: 1.85, priceE85: 1.1, conversionCost: 1200 });
    close(r.newInjector, 660); expect(r.changeInjectors).toBe(true); close(r.powerGain, 25.3); close(r.savings, 760); close(r.roiMonths, 18.9);
  });
  it('aucune économie → retour sur investissement infini (pas de nombre négatif)', () => {
    const r = computeE85({ fuel: 'sp95', injCcMin: 440, railBar: 3, power: 300, boostBar: 0, l100: 8, kmYear: 20000, priceFuel: 1, priceE85: 1.5, conversionCost: 1200 });
    expect(r.roiMonths).toBe(Infinity);
  });
});

describe('lambda / AFR', () => {
  it('conversions', () => {
    close(lambdaToAfr(0.8, 'sp95'), 11.76, 2);
    close(afrToLambda(9.8, 'e85'), 1, 3);
    expect(mixtureStatus(1).key).toBe('stoich');
    expect(mixtureStatus(0.7).key).toBe('very_rich');
  });
  it('correction (ancien site)', () => {
    const r = correction(13.5, 12, 'sp95');
    close(r.pct, 12.5); expect(r.action).toBe('enrich');
  });
  it('EGT : la zone légèrement pauvre est la plus chaude, jamais classée « sûre »', () => {
    expect(correction(15.9, 14.7, 'sp95').egtStatus).toBe('warn'); // λ ≈ 1,08
    expect(correction(17.5, 14.7, 'sp95').egtStatus).toBe('danger'); // λ ≈ 1,19
    expect(correction(15.9, 14.7, 'sp95').egt).toBeGreaterThan(correction(14.7, 14.7, 'sp95').egt);
    expect(correction(11.76, 14.7, 'sp95').egt).toBe(750); // λ 0,80 riche
  });
});

describe('NOS', () => {
  it('kit 100 hp : ≈ 4 lb/h de N₂O par hp, bouteille de 10 lb ≈ 30 activations de 3 s', () => {
    const r = computeNos({ baseHp: 300, compressionRatio: 9.5, octane: 98, baseTiming: 28, shotHp: 100, bottleLb: 10, shotSeconds: 3 });
    close(r.fuelLbHr, 50); close(r.n2oLbHr / 100, 3.98, 1);
    expect(r.shots).toBe(30);
    expect(r.totalSeconds).toBeGreaterThan(80); expect(r.totalSeconds).toBeLessThan(120);
    close(1 / r.fuelN2oRatio, 7.96, 1);
  });
  it('parties inchangées (ancien site) : gain, avance, contraintes', () => {
    const r = computeNos({ baseHp: 300, compressionRatio: 9.5, octane: 98, baseTiming: 28, shotHp: 100, bottleLb: 10, shotSeconds: 3 });
    close(r.actualGain, 87); close(r.safeTiming, 24); close((r.pressureFactor - 1) * 100, 22.6);
    const r2 = computeNos({ baseHp: 450, compressionRatio: 10.5, octane: 102, baseTiming: 32, shotHp: 150, bottleLb: 15, shotSeconds: 5 });
    expect(r2.stress.status).toBe('danger');
  });
});
