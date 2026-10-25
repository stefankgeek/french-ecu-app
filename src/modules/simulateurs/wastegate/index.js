/** Fiche du simulateur « Wastegate & pression ». */
import { computeWastegate, valveTable, ebcCurve } from './calc.js';

const STATUS = { ok: 'ok', warn: 'warn', danger: 'danger' };

export default {
  id: 'wastegate',
  intro: 'intro',
  inputs: [
    { id: 'power', quantity: 'power', default: 300 * 0.73549875, min: 20, max: 2500 },
    { id: 'boost', quantity: 'pressure', default: 1.0, min: 0.1, max: 4 },
    { id: 'type', type: 'select', numeric: false, default: 'external', options: (c) => ['internal', 'external'].map((k) => ({ value: k, label: c.t(`type_${k}`) })) },
    { id: 'valve', quantity: 'length', default: 38, min: 15, max: 80, decimals: 0 },
    { id: 'spring', quantity: 'pressure', default: 0.7, min: 0.1, max: 3 },
    { id: 'control', type: 'select', numeric: false, default: 'ebc', options: (c) => ['manual', 'mbc', 'ebc'].map((k) => ({ value: k, label: c.t(`control_${k}`) })) },
  ],
  groups: [
    { title: 'g_target', fields: ['power', 'boost'] },
    { title: 'g_wastegate', fields: ['type', 'valve', 'spring', 'control'] },
  ],

  compute(v) {
    return { ...computeWastegate({ powerKw: v.power, boostBar: v.boost, type: v.type, valveMm: v.valve, springBar: v.spring, control: v.control }), v };
  },

  results(r, c) {
    const { v } = r;
    const cards = [
      { label: c.t('r.required'), value: r.req, q: 'length', decimals: 0, note: c.t('r.required_note') },
      { label: c.t('r.capacity'), text: `${c.fmt(r.capacity * 100, { decimals: 0 })} %`, status: STATUS[r.fit.status], note: c.t(`fit.${r.fit.key}`) },
      { label: c.t('r.creep'), text: c.t(`creep.${r.fit.creep}`), status: r.fit.creep === 'high' ? 'danger' : r.fit.creep === 'moderate' ? 'warn' : 'ok' },
      { label: c.t('r.spring'), value: r.recommendedSpring, q: 'pressure', note: c.t(v.control === 'manual' ? 'r.spring_manual' : 'r.spring_ctrl') },
      { label: c.t('r.expected'), value: r.expectedBoost, q: 'pressure', alt: true, status: r.expectedBoost + 0.01 < v.boost ? 'warn' : 'ok' },
    ];
    if (v.control !== 'manual') cards.push({ label: c.t('r.max_ctrl'), value: r.maxControllable, q: 'pressure', note: c.t('r.max_ctrl_note') });
    if (r.ebcDuty !== null) cards.push({ label: c.t('r.duty'), text: `${c.fmt(r.ebcDuty, { decimals: 0 })} %`, note: c.t('r.duty_note') });
    cards.push({ label: c.t('r.exhaust'), value: r.exhaustKgS * 1000, q: 'mass_flow', alt: true });
    return cards;
  },

  notes(r, c) {
    return r.warnings.map((w) => ({ status: w.status, text: c.t(`warn.${w.key}`) }));
  },

  tables(r, c) {
    return [{
      title: c.t('table.title'),
      columns: [c.t('table.valve'), c.t('table.capacity'), c.t('table.verdict')],
      rows: valveTable(r.req).map((x) => ({
        cells: [c.f('length', x.d, { decimals: 0 }), `${c.fmt(x.capacity * 100, { decimals: 0 })} %`, c.t(`fit.${x.fit.key}`)],
        status: x.fit.status, highlight: x.d === r.v.valve,
      })),
    }];
  },

  charts(r, c) {
    const pts = ebcCurve(r.v.spring);
    return [{
      title: c.t('chart.ebc_title'),
      labels: pts.map((p) => p.duty),
      xTitle: c.t('chart.duty'),
      yTitle: `${c.t('chart.boost')} (${c.sym('pressure')})`,
      datasets: [
        { label: c.t('chart.boost'), data: pts.map((p) => c.cv('pressure', p.boost)), fill: true },
        { label: c.t('chart.target'), data: pts.map(() => c.cv('pressure', r.v.boost)), dashed: true, color: '#feca57' },
      ],
    }];
  },
};
