/** Fiche du simulateur « Jeu à la coupe des segments ». */
import { computeRingGap, APPLICATIONS } from './calc.js';

export default {
  id: 'ring_gap',
  intro: 'intro',
  inputs: [
    { id: 'engine', type: 'select', numeric: false, default: 'four_stroke', options: (c) => ['four_stroke', 'two_stroke'].map((k) => ({ value: k, label: c.t(`engine.${k}`) })) },
    { id: 'application', type: 'select', numeric: false, default: 'naturally_aspirated',
      options: (c) => Object.keys(APPLICATIONS[c.values.engine] || APPLICATIONS.four_stroke).map((k) => ({ value: k, label: c.t(`app.${k}`) })) },
    { id: 'bore', quantity: 'length', default: 86, min: 20, max: 200 },
  ],
  groups: [{ title: 'g_engine', fields: ['engine', 'application', 'bore'] }],

  /** Changer de type de moteur recharge la liste des usages. */
  onChange(id, v) {
    if (id === 'engine' && !APPLICATIONS[v.engine][v.application]) return { application: Object.keys(APPLICATIONS[v.engine])[0], __rerender: true };
    if (id === 'engine') return { __rerender: true };
    return null;
  },

  compute(v) {
    return { ...computeRingGap({ boreMm: v.bore, engine: v.engine, application: v.application }), v };
  },

  results(r, c) {
    const cards = [
      { label: c.t('r.top'), value: r.top, q: 'length', decimals: 3, alt: true, status: 'ok', note: c.t('r.max', { v: c.f('length', r.topMax, { decimals: 3 }) }) },
      { label: c.t('r.second'), value: r.second, q: 'length', decimals: 3, alt: true, status: 'ok', note: c.t('r.max', { v: c.f('length', r.secondMax, { decimals: 3 }) }) },
    ];
    if (r.oil) cards.push({ label: c.t('r.oil'), value: r.oil, q: 'length', decimals: 3, alt: true, note: c.t('r.oil_note') });
    cards.push({ label: c.t('r.method'), wide: true, text: c.t('r.method_text', { b: c.fmt(r.boreIn, { decimals: 3 }), t: c.fmt(r.coefTop, { decimals: 4 }), s: c.fmt(r.coefSecond, { decimals: 4 }) }) });
    return cards;
  },

  notes(r, c) {
    return [{ status: 'danger', text: c.t('warn.never_under') }, { status: 'info', text: c.t('warn.over_ok') }];
  },

  tables(r, c) {
    return [{ title: c.t('table.title'), wrap: true, columns: ['#', c.t('table.step')], rows: [1, 2, 3, 4, 5, 6].map((n) => ({ cells: [String(n), c.t(`step.s${n}`)] })) }];
  },

  charts(r, c) {
    const labels = [c.t('chart.top'), c.t('chart.second')];
    const min = [r.top, r.second];
    const max = [r.topMax, r.secondMax];
    if (r.oil) { labels.push(c.t('chart.oil')); min.push(r.oil); max.push(r.oil * 1.3); }
    return [{
      title: c.t('chart.title'), type: 'bar', labels,
      yTitle: `${c.t('chart.gap')} (${c.sym('length')})`,
      datasets: [
        { label: c.t('chart.min'), data: min.map((x) => c.cv('length', x)), color: '#00d4ff' },
        { label: c.t('chart.max'), data: max.map((x) => c.cv('length', x)), color: '#feca57' },
      ],
    }];
  },
};
