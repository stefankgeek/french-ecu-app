/**
 * Châssis (freinage, radiateur d'huile) et générateur de cartographies : contrôles physiques.
 */
import { describe, it, expect } from 'vitest';
import { computeBrake, G } from '../src/modules/simulateurs/brake_bias/calc.js';
import { computeOilCooler, crossflowEff } from '../src/modules/simulateurs/oil_cooler/calc.js';
import { computeEcuMap, axes, veAt, tableCsv, heatColor } from '../src/modules/simulateurs/ecu_map/calc.js';
import { zipBytes, crc32 } from '../src/core/zip.js';

const CAR = { massKg: 1200, frontPct: 55, wheelbaseMm: 2600, cgMm: 500, trackFrontMm: 1500, trackRearMm: 1500, decelG: 1, biasPct: 75, speedKmh: 100, lateralG: 1 };
const OIL = { powerKw: 220, usage: 'street', oilFlowLmin: 15, targetC: 105, type: 'air', widthMm: 250, heightMm: 250, thicknessMm: 50, ambientC: 25, speedKmh: 100, coolantC: 90 };
const ECU = { rpmPoints: 16, loadPoints: 16, idleRpm: 800, rpmLimit: 7000, displacementCc: 2000, cylinders: 4, cr: 9.5, boostBar: 1, veMax: 95,
  injectorCc: 550, fuelBar: 3, deadtime: 1, fuel: 'sp98', lambdaCruise: 1, lambdaWot: 0.88, lambdaBoost: 0.8, offset: 0 };

describe('Répartition de freinage', () => {
  it('transfert de charge m·a·h/L et répartition idéale ψ + a·h/L', () => {
    const r = computeBrake(CAR);
    expect(r.transfer).toBeCloseTo(1200 * 500 / 2600, 6);
    expect(r.optimalPct).toBeCloseTo((0.55 + 500 / 2600) * 100, 6);
  });
  it('distance = v²/(2·g·a) : 39,3 m à 100 km/h et 1 g (l\'ancien site donnait 43,7 m)', () => {
    const r = computeBrake({ ...CAR, biasPct: computeBrake(CAR).optimalPct });
    expect(r.aMax).toBeCloseTo(1, 6);
    expect(r.distance).toBeCloseTo((100 / 3.6) ** 2 / (2 * G), 6);
    expect(r.distance).toBeCloseTo(39.3, 1);
  });
  it('trop d\'arrière → l\'arrière bloque en premier et la décélération baisse', () => {
    const r = computeBrake({ ...CAR, biasPct: 60 });
    expect(r.firstLock).toBe('rear');
    expect(r.aMax).toBeLessThan(0.9);
    expect(r.distance).toBeGreaterThan(computeBrake(CAR).distance);
  });
  it('trop d\'avant → l\'avant bloque en premier', () => {
    expect(computeBrake({ ...CAR, biasPct: 85 }).firstLock).toBe('front');
  });
  it('transfert latéral : la somme des charges reste égale à la masse', () => {
    const w = computeBrake(CAR).wheels;
    expect(w.inF + w.outF + w.inR + w.outR).toBeCloseTo(1200, 6);
  });
});

describe('Radiateur d\'huile', () => {
  it('efficacité entre 0 et 1, croissante avec NTU', () => {
    expect(crossflowEff(0.5, 0.5)).toBeGreaterThan(0);
    expect(crossflowEff(2, 0.5)).toBeGreaterThan(crossflowEff(0.5, 0.5));
    expect(crossflowEff(50, 0.5)).toBeLessThanOrEqual(1);
  });
  it('l\'huile ne descend jamais sous l\'air ambiant (bug −120 °C de l\'ancien site)', () => {
    for (const o of [{}, { powerKw: 50 }, { widthMm: 600, heightMm: 500, thicknessMm: 100 }, { oilFlowLmin: 3 }]) {
      const r = computeOilCooler({ ...OIL, ...o });
      expect(r.outletTemp).toBeGreaterThan(OIL.ambientC);
      expect(r.eqTemp).toBeGreaterThan(OIL.ambientC);
    }
  });
  it('huile/eau : jamais sous la température du liquide de refroidissement', () => {
    const r = computeOilCooler({ ...OIL, type: 'water', targetC: 85 });
    expect(r.rating).toBe('impossible');
    expect(computeOilCooler({ ...OIL, type: 'water' }).outletTemp).toBeGreaterThan(90);
  });
  it('plus grand radiateur, plus de vitesse → huile plus froide', () => {
    const base = computeOilCooler(OIL).eqTemp;
    expect(computeOilCooler({ ...OIL, widthMm: 330 }).eqTemp).toBeLessThan(base);
    expect(computeOilCooler({ ...OIL, speedKmh: 150 }).eqTemp).toBeLessThan(base);
  });
  it('la taille conseillée tient exactement la température visée', () => {
    const r = computeOilCooler({ ...OIL, usage: 'track' });
    const check = computeOilCooler({ ...OIL, usage: 'track', widthMm: r.reqWidth, heightMm: r.reqHeight });
    expect(check.eqTemp).toBeCloseTo(105, 0);
  });
});

describe('Générateur de cartographies', () => {
  it('axes : pression maxi couvrant la suralimentation, régime de ralenti à maxi', () => {
    const a = axes(ECU);
    expect(a.rpm).toHaveLength(16);
    expect(a.rpm[0]).toBe(800);
    expect(a.rpm[15]).toBe(7000);
    expect(a.kpa[0]).toBe(20);
    expect(a.kpa[15]).toBeGreaterThanOrEqual(201);
  });
  it('carburant ∝ pression en suralimentation (et non pression² comme l\'ancien site)', () => {
    const i = { ...ECU, lambdaBoost: 0.88, deadtime: 0 };
    const r = computeEcuMap(i);
    const j100 = r.kpa.indexOf(100);
    const jTop = r.kpa.length - 1;
    const ratio = r.fuelTable[8][jTop] / r.fuelTable[8][j100];
    const veRatio = veAt(i, r.rpm[8], r.kpa[jTop]) / veAt(i, r.rpm[8], 100);
    expect(ratio).toBeCloseTo((r.kpa[jTop] / 100) * veRatio, 6);
  });
  it('VE reste réaliste sous pression (pas 150–300 %)', () => {
    const r = computeEcuMap({ ...ECU, boostBar: 3 });
    expect(Math.max(...r.veTable.flat())).toBeLessThan(115);
  });
  it('temps d\'injection cohérent : 2 L, 1 bar, 550 cc → ≈ 67 % d\'ouverture', () => {
    const r = computeEcuMap(ECU);
    expect(r.duty).toBeGreaterThan(55);
    expect(r.duty).toBeLessThan(75);
  });
  it('pression d\'essence prise en compte : Q ∝ √P', () => {
    expect(computeEcuMap({ ...ECU, fuelBar: 4 }).flowCcMin).toBeCloseTo(550 * Math.sqrt(4 / 3), 6);
  });
  it('avance : moins sous pression, plus avec un meilleur octane', () => {
    const r = computeEcuMap(ECU);
    const row = r.ignTable[10];
    expect(row[row.length - 1]).toBeLessThan(row[r.kpa.indexOf(100)]);
    const e85 = computeEcuMap({ ...ECU, fuel: 'e85' });
    expect(e85.ignTable[10][r.kpa.length - 1]).toBeGreaterThan(row[row.length - 1]);
  });
  it('démarrage : plus de temps à froid, plus de valeur bloquée à 20 ms', () => {
    const c = computeEcuMap(ECU).curves.cranking;
    expect(c[0].y).toBeGreaterThan(c[c.length - 1].y);
    expect(c[0].y).toBeLessThan(20);
  });
  it('correction de température d\'air = loi des gaz parfaits (sans plafond)', () => {
    const iat = computeEcuMap(ECU).curves.iat;
    expect(iat.find((p) => p.x === 20).y).toBeCloseTo(1, 6);
    expect(iat.find((p) => p.x === 100).y).toBeCloseTo(293.15 / 373.15, 6);
  });
  it('enrichissement de chauffe continu et décroissant', () => {
    const w = computeEcuMap(ECU).curves.warmup;
    for (let k = 1; k < w.length; k++) expect(w[k].y).toBeLessThanOrEqual(w[k - 1].y);
  });
  it('CSV : point décimal, axe en tête', () => {
    expect(tableCsv([800, 1000], [20, 100], [[1.5, 2], [1.25, 3]], 2)).toBe('RPM\\kPa,20,100\r\n800,1.50,2.00\r\n1000,1.25,3.00\r\n');
  });
  it('couleurs de carte : bleu en bas, rouge en haut', () => {
    expect(heatColor(0, 0, 10)).toBe('rgb(66,133,244)');
    expect(heatColor(10, 0, 10)).toBe('rgb(255,69,58)');
  });
});

describe('Archive ZIP', () => {
  it('CRC-32 de référence', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });
  it('structure : signature locale, répertoire central et fin', () => {
    const z = zipBytes([{ name: 'a.csv', content: 'x' }, { name: 'b.csv', content: 'yz' }]);
    const v = new DataView(z.buffer);
    expect(v.getUint32(0, true)).toBe(0x04034b50);
    expect(v.getUint32(z.length - 22, true)).toBe(0x06054b50);
    expect(v.getUint16(z.length - 12, true)).toBe(2);
  });
});
