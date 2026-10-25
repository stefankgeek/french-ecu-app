/** Tests du moteur multilingue (traduction, pluriels, nombres). */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { LANGUAGES, translate, parseNumber, formatNumber, detectLanguage, interpolate } from '../src/core/i18n-core.js';

const dicts = Object.fromEntries(LANGUAGES.map((l) => [l.code, JSON.parse(readFileSync(`src/locales/${l.code}.json`, 'utf8'))]));

describe('saisie des nombres (virgule ou point)', () => {
  const cases = [
    ['2,5', 2.5], ['2.5', 2.5], [' 1 234,5 ', 1234.5], ['1,234.5', 1234.5], ['1.234,5', 1234.5],
    ['1 000 000', 1000000], ['-3,2', -3.2], ['−3,2', -3.2], ['.5', 0.5], ['1e3', 1000],
    ['٢٫٥', 2.5], ['١٢٣', 123], ['12 500', 12500], [12.7, 12.7],
  ];
  for (const [input, expected] of cases) it(JSON.stringify(input), () => expect(parseNumber(input)).toBe(expected));
  for (const bad of ['', 'abc', '1,2,3x', '--1', null, undefined]) it(`refuse ${JSON.stringify(bad)}`, () => expect(parseNumber(bad)).toBeNaN());
});

describe('affichage des nombres selon la langue', () => {
  it('séparateur décimal', () => {
    expect(formatNumber(2.5, 'fr')).toBe('2,5');
    expect(formatNumber(2.5, 'en')).toBe('2.5');
    expect(formatNumber(1234.5, 'de')).toBe('1.234,5');
  });
  it('valeur invalide → tiret', () => expect(formatNumber(NaN, 'fr')).toBe('—'));
});

describe('traductions', () => {
  it('toutes les langues traduisent le titre', () => {
    for (const l of LANGUAGES) expect(translate(dicts, l.code, 'settings.title')).not.toBe('settings.title');
  });
  it('variables', () => {
    expect(translate(dicts, 'fr', 'settings.version', { version: '1.2.0' })).toBe('Version 1.2.0');
    expect(interpolate('{a} et {b}', { a: 1 })).toBe('1 et {b}');
  });
  it('pluriels (dont polonais et arabe)', () => {
    expect(translate(dicts, 'fr', 'home.tools_count', { count: 1 })).toBe('1 outil');
    expect(translate(dicts, 'fr', 'home.tools_count', { count: 19 })).toBe('19 outils');
    expect(translate(dicts, 'pl', 'home.tools_count', { count: 3 })).toBe('3 narzędzia');
    expect(translate(dicts, 'pl', 'home.tools_count', { count: 19 })).toBe('19 narzędzi');
    expect(translate(dicts, 'ar', 'home.tools_count', { count: 2 })).toBe('أداتان');
  });
  it('clé absente → secours en anglais, jamais le nom technique', () => {
    const d = { fr: {}, en: { a: { b: 'Hello' } } };
    const missing = [];
    expect(translate(d, 'fr', 'a.b', {}, (k) => missing.push(k))).toBe('Hello');
    expect(missing).toEqual(['a.b']);
  });
  it('détection de la langue du téléphone', () => {
    expect(detectLanguage(['pt-BR', 'en-US'])).toBe('pt');
    expect(detectLanguage(['ja-JP'])).toBe('en');
    expect(detectLanguage(['AR-MA'])).toBe('ar');
  });
});
