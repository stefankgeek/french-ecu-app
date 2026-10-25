/** Fiche du simulateur « Taux de compression ». */
import { computeCompression, ivcCurve } from './calc.js';

const ratio = (c, v) => `${c.fmt(v, { decimals: 2, min: 2 })} : 1`;

export default {
  id: 'compression',
  intro: 'intro',
  inputs: [
    { id: 'bore', quantity: 'length', default: 86, min: 30, max: 160 },
    { id: 'stroke', quantity: 'length', default: 86, min: 30, max: 160 },
    { id: 'rod', quantity: 'length', default: 144, min: 60, max: 300 },
    { id: 'cylinders', default: 4, min: 1, max: 16, decimals: 0 },
    { id: 'chamber', quantity: 'displacement', default: 50, min: 5, max: 200, decimals: 1 },
    { id: 'gasketBore', quantity: 'length', default: 87, min: 30, max: 165 },
    { id: 'gasketThickness', quantity: 'length', default: 1.0, min: 0.2, max: 4, decimals: 2 },
    { id: 'deck', quantity: 'length', default: 0.5, min: -3, max: 5, decimals: 2, hint: 'deck_hint' },
    { id: 'pistonType', type: 'select', numeric: false, default: 'flat', options: (c) => ['flat', 'dished', 'domed'].map((k) => ({ value: k, label: c.t(`piston.${k}`) })) },
    { id: 'pistonCc', quantity: 'displacement', default: 0, min: 0, max: 60, decimals: 1 },
    { id: 'reliefs', quantity: 'displacement', default: 5, min: 0, max: 30, decimals: 1 },
    { id: 'ivc', quantity: 'u:deg', default: 50, min: 0, max: 110, decimals: 0, hint: 'ivc_hint' },
    { id: 'boost', quantity: 'pressure', default: 0, min: 0, max: 4, hint: 'boost_hint' },
  ],
  groups: [
    { title: 'g_engine', fields: ['bore', 'stroke', 'rod', 'cylinders'] },
    { title: 'g_chamber', fields: ['chamber', 'gasketBore', 'gasketThickness', 'deck', 'pistonType', 'pistonCc', 'reliefs'] },
    { title: 'g_cam', fields: ['ivc', 'boost'] },
  ],

  compute(v) {
    const inputs = {
      bore: v.bore, stroke: v.stroke, rod: v.rod, cylinders: v.cylinders, deck: v.deck, chamber: v.chamber,
      gasketBore: v.gasketBore, gasketThickness: v.gasketThickness, pistonType: v.pistonType, pistonCc: v.pistonCc,
      reliefs: v.reliefs, ivc: v.ivc, boostBar: v.boost,
    };
    return { ...computeCompression(inputs), inputs, v };
  },

  results(r, c) {
    const cards = [
      { label: c.t('r.static'), text: ratio(c, r.staticCr), status: r.staticCr > 12 ? 'warn' : 'ok' },
      { label: c.t('r.dynamic'), text: ratio(c, r.dynamicCr), note: c.t('r.dynamic_note', { pct: c.fmt(r.frac * 100, { decimals: 0 }) }) },
    ];
    if (r.v.boost > 0) cards.push({ label: c.t('r.effective'), text: ratio(c, r.effectiveCr), note: c.t('r.effective_note') });
    cards.push(
      { label: c.t('r.octane'), text: `≈ ${c.fmt(Math.max(r.octane, 85), { decimals: 0 })} RON`, status: r.octane > 102 ? 'danger' : r.octane > 98 ? 'warn' : 'ok', note: c.t(`fuel.${r.fuel}`) },
      { label: c.t('r.cranking'), value: r.crankingBar, q: 'pressure_abs', note: c.t('r.cranking_note') },
      { label: c.t('r.gain'), text: `${r.gainPct >= 0 ? '+' : ''}${c.fmt(r.gainPct, { decimals: 1 })} %`, note: c.t('r.gain_note') },
      { label: c.t('r.displacement'), value: r.displacement, q: 'displacement', alt: true },
      { label: c.t('r.clearance'), value: r.clearance, q: 'displacement', decimals: 1, note: c.t('r.swept', { v: c.f('displacement', r.swept, { decimals: 1 }) }) },
    );
    return cards;
  },

  notes(r, c) {
    const n = [];
    if (r.v.boost === 0 && r.staticCr > 11.5) n.push({ status: 'warn', text: c.t('warn.high_na') });
    if (r.v.boost > 0 && r.staticCr > 10) n.push({ status: 'warn', text: c.t('warn.high_boost') });
    if (r.staticCr < 8) n.push({ status: 'info', text: c.t('warn.low') });
    n.push({ status: 'info', text: c.t('warn.indicative') });
    return n;
  },

  charts(r, c) {
    const pts = ivcCurve(r.inputs);
    const P = r.parts;
    return [
      {
        title: c.t('chart.ivc_title'),
        labels: pts.map((p) => `${p.ivc}°`),
        xTitle: c.t('chart.ivc'), yTitle: c.t('chart.dcr'),
        datasets: [
          { label: c.t('chart.dcr'), data: pts.map((p) => p.dcr), fill: true },
          { label: c.t('chart.static'), data: pts.map(() => r.staticCr), dashed: true, color: '#feca57' },
        ],
      },
      {
        title: c.t('chart.parts_title'), type: 'bar', legend: false,
        labels: ['chamber', 'gasket', 'deck', 'piston', 'reliefs'].map((k) => c.t(`part.${k}`)),
        yTitle: `${c.t('chart.volume')} (${c.sym('displacement')})`,
        datasets: [{ label: c.sym('displacement'), data: [P.chamber, P.gasket, P.deck, P.piston, P.reliefs].map((x) => c.cv('displacement', x)), colors: ['#4a90e2', '#a78bfa', '#4ecdc4', '#feca57', '#ff6b6b'] }],
      },
    ];
  },
};
