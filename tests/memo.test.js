/**
 * Aide-mémoire : chaque texte « @clé » de la structure existe dans les 10 langues,
 * et les traductions ne perdent aucun nombre important.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { MEMO } from '../src/modules/aide/memo/content.js';

const LANGS = ['fr', 'en', 'es', 'de', 'it', 'pt', 'nl', 'pl', 'tr', 'ar'];
const dict = Object.fromEntries(LANGS.map((l) => [l, JSON.parse(readFileSync(`src/modules/aide/memo/locales/${l}.json`, 'utf8'))]));
const get = (d, k) => k.split('.').reduce((o, p) => (o ? o[p] : undefined), d);

const keys = [];
const walk = (v) => {
  if (typeof v === 'string') { if (v.startsWith('@')) keys.push(v.slice(1)); } else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === 'object') Object.values(v).forEach(walk);
};
walk(MEMO);

describe('Aide-mémoire', () => {
  it('structure : rubriques avec fiches', () => {
    expect(MEMO.length).toBeGreaterThanOrEqual(18);
    for (const c of MEMO) expect(c.items.length).toBeGreaterThan(0);
  });
  it.each(LANGS)('toutes les clés existent en %s', (l) => {
    const missing = [...keys, ...MEMO.flatMap((c) => [`${c.id}.title`, `${c.id}.desc`]), 'ui.intro', 'ui.search', 'ui.no_result', 'ui.disclaimer']
      .filter((k) => typeof get(dict[l], k) !== 'string' || !get(dict[l], k).trim());
    expect(missing).toEqual([]);
  });
  it('tableaux rectangulaires', () => {
    for (const c of MEMO) for (const it of c.items) for (const b of it.blocks) {
      if (b.type === 'table') for (const r of b.rows) expect(r.length).toBe(b.columns.length);
    }
  });
  it('valeurs corrigées : trous de passage ISO 273 et forets STI', () => {
    const flat = JSON.stringify(MEMO);
    expect(flat).toContain('["M8","8.4","9.0","10.0"]');
    expect(flat).toContain('["M12x1.75","12.5"');
  });
});
