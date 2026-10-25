/**
 * Non-régression des simulateurs « carburant ».
 * Valeurs de référence relevées sur l'ANCIEN site (mêmes entrées) le 25/10/2026 :
 * le portage doit donner exactement les mêmes résultats.
 */
import { describe, it, expect } from 'vitest';
import { computeInjectors, injectorSizes } from '../src/modules/simulateurs/injectors/calc.js';
import { computePump } from '../src/modules/simulateurs/fuel_pump/calc.js';
import { computeE85 } from '../src/modules/simulateurs/e85/calc.js';
import { correction, lambdaToAfr, afrToLambda, mixtureStatus } from '../src/modules/simulateurs/lambda/calc.js';
import { computeNos } from '../src/modules/simulateurs/nitrous/calc.js';

const close = (a, b, d = 1) => expect(a).toBeCloseTo(b, d);

describe('injecteurs (ancien site)', () => {
  it('4 cyl. 2,0 L 200 hp', () => {
    const r = computeInjectors({ cylinders: 4, displacementL: 2, powerHp: 200, rpm: 6500, bsfc: 0.5, railBar: 3, duty: 0.8, intakeBarA: 1, ve: 0.85, airTempC: 20, throttle: 1, tofi: 1 });
    close(r.flowCcMin, 328.1); close(r.injectionMs, 1.06, 2); close(r.airFlowLMin, 1381.3); close(r.intakeDiameterMm, 27.1); close(r.throttleDiameterMm, 62.5); close(r.safetyMargin, 20);
  });
  it('8 cyl. 5,7 L 700 hp', () => {
    const r = computeInjectors({ cylinders: 8, displacementL: 5.7, powerHp: 700, rpm: 6800, bsfc: 0.7, railBar: 5, duty: 0.75, intakeBarA: 2.5, ve: 1, airTempC: 35, throttle: 1, tofi: 1.2 });
    close(r.flowCcMin, 1107.0); close(r.throttleDiameterMm, 114.2); close(r.safetyMargin, 35);
  });
  it('comparateur : 7 tailles, la plus proche au-dessus du besoin', () => {
    const s = injectorSizes(328.1);
    expect(s).toHaveLength(7);
    expect(s.find((x) => x.closest).size).toBe(350);
  });
});

describe('débit pompe (ancien site)', () => {
  it('333 cc × 4, tuyau 6 mm × 5 m', () => {
    const r = computePump({ injFlowCcMin: 333, injectors: 4, densityKgL: 0.75, pipeDiameterMm: 6, pipeLengthM: 5, circuit: 'simple', dutyMax: 80 });
    close(r.outCcMin, 1998); close(r.pumpLh, 119.9); close(r.maxPipeCcMin, 2545, 0); close(r.velocity, 1.18, 2); close(r.totalLossPa / 1000, 158.669, 3);
  });
  it('circuit complexe = longueur × 1,5', () => {
    const r = computePump({ injFlowCcMin: 1000, injectors: 6, densityKgL: 0.78, pipeDiameterMm: 10, pipeLengthM: 6, circuit: 'complex', dutyMax: 90 });
    close(r.circuitLossPa / 1000, 20.232, 3);
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
  it('correction et EGT (ancien site)', () => {
    const r = correction(13.5, 12, 'sp95');
    close(r.pct, 12.5); expect(r.action).toBe('enrich'); expect(r.egt).toBe(800);
    expect(correction(16, 14.4, 'e10').egt).toBe(900);
  });
});

describe('NOS (ancien site)', () => {
  it('kit 100 hp, bouteille 10 lb', () => {
    const r = computeNos({ baseHp: 300, compressionRatio: 9.5, octane: 98, baseTiming: 28, shotHp: 100, bottleLb: 10, shotSeconds: 3 });
    close(r.actualGain, 87); close(r.n2oLbHr, 80); close(r.safeTiming, 24); expect(r.shots).toBe(150); close(r.totalSeconds, 450);
  });
  it('kit 150 hp, taux 10,5 → alerte', () => {
    const r = computeNos({ baseHp: 450, compressionRatio: 10.5, octane: 102, baseTiming: 32, shotHp: 150, bottleLb: 15, shotSeconds: 5 });
    expect(r.shots).toBe(90); expect(r.stress.status).toBe('danger');
  });
});
