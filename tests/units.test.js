/**
 * Tests des conversions d'unités.
 * Règle : toute conversion aller-retour doit retomber sur la valeur de départ.
 */
import { describe, it, expect } from 'vitest';
import { QUANTITIES, SYSTEMS, toBase, fromBase, convert, detectSystem } from '../src/core/units-core.js';

describe('valeurs de référence', () => {
  it('pression', () => {
    expect(convert('pressure', 1, 'bar', 'psi')).toBeCloseTo(14.5038, 3);
    expect(toBase('pressure', 15, 'psi')).toBeCloseTo(1.03421, 4);
    expect(convert('pressure', 100, 'kPa', 'bar')).toBeCloseTo(1, 9);
  });
  it('température ≠ écart de température', () => {
    expect(fromBase('temperature', 20, 'F')).toBeCloseTo(68, 9);
    expect(fromBase('temperature_delta', 20, 'dF')).toBeCloseTo(36, 9);
    expect(fromBase('temperature', 0, 'K')).toBeCloseTo(273.15, 9);
    expect(toBase('temperature', 212, 'F')).toBeCloseTo(100, 9);
  });
  it('puissance : hp (mécanique) et ch (métrique) sont différents', () => {
    expect(convert('power', 100, 'kW', 'hp')).toBeCloseTo(134.102, 2);
    expect(convert('power', 100, 'kW', 'ch')).toBeCloseTo(135.962, 2);
  });
  it('débit injecteur : 1 lb/h ≈ 10,5 cc/min (essence 0,72)', () => {
    expect(toBase('injector_flow', 1, 'lbh')).toBeCloseTo(10.4998, 3);
    expect(toBase('injector_flow', 1, 'lbh', { density: 0.79 })).toBeCloseTo(9.5694, 3); // éthanol plus dense
  });
  it('consommation : relation inverse L/100 km ↔ mpg', () => {
    expect(fromBase('fuel_economy', 8, 'mpgUS')).toBeCloseTo(29.40, 2);
    expect(toBase('fuel_economy', 30, 'mpgUK')).toBeCloseTo(9.416, 3);
  });
  it('BSFC : 0,5 lb/hp·h ≈ 304 g/kWh', () => {
    expect(toBase('bsfc', 0.5, 'lbhph')).toBeCloseTo(304.14, 1);
  });
  it('prix : 1 €/L = 3,785 €/gal', () => {
    expect(fromBase('price_volume', 1, 'perGal')).toBeCloseTo(3.7854, 4);
  });
  it('couple, longueur, cylindrée', () => {
    expect(convert('torque', 100, 'lbft', 'Nm')).toBeCloseTo(135.582, 2);
    expect(convert('length', 1, 'in', 'mm')).toBe(25.4);
    expect(convert('displacement', 350, 'ci', 'L')).toBeCloseTo(5.7355, 3);
  });
});

describe('aller-retour sans dérive pour toutes les unités', () => {
  for (const [q, def] of Object.entries(QUANTITIES)) {
    for (const u of Object.keys(def.units)) {
      it(`${q} / ${u}`, () => {
        for (const v of (q === 'fuel_economy' ? [0.5, 4.2, 8, 30] : [-40, 0, 0.001, 1, 15, 123.456, 9999])) {
          expect(toBase(q, fromBase(q, v, u), u)).toBeCloseTo(v, 9);
        }
      });
    }
  }
});

describe('systèmes', () => {
  it('chaque grandeur a une unité métrique et impériale valide', () => {
    for (const sys of Object.values(SYSTEMS)) {
      for (const q of Object.keys(QUANTITIES)) expect(QUANTITIES[q].units[sys[q]]).toBeDefined();
    }
  });
  it('détection par région', () => {
    expect(detectSystem(['en-US'])).toBe('imperial');
    expect(detectSystem(['en-GB'])).toBe('metric');
    expect(detectSystem(['fr-FR'])).toBe('metric');
    expect(detectSystem([])).toBe('metric');
  });
  it('unité inconnue → erreur explicite', () => {
    expect(() => toBase('pressure', 1, 'atm')).toThrow(/Unité inconnue/);
  });
});
