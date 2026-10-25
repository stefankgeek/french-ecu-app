/** Fiche du simulateur « Contre-pression échappement ». */
import { computeExhaust, rpmCurve } from './calc.js';

const LEVEL = { low: 'ok', moderate: 'ok', high: 'warn', very_high: 'danger' };
const opts = (c, prefix, keys) => keys.map((k) => ({ value: k, label: c.t(`${prefix}.${k}`) }));

export default {
  id: 'exhaust',
  intro: 'intro',
  inputs: [
    { id: 'displacement', quantity: 'displacement', default: 2000, min: 100, max: 15000 },
    { id: 'cylinders', type: 'select', default: 4, options: (c) => [3, 4, 5, 6, 8, 10, 12].map((n) => ({ value: n, label: c.tc('common.cylinders', { count: n }) })) },
    { id: 'rpm', quantity: 'u:rpm', default: 7000, min: 1500, max: 20000, decimals: 0 },
    { id: 'power', quantity: 'power', default: 200 * 0.73549875, min: 10, max: 2500 },
    { id: 'type', type: 'select', numeric: false, default: 'na', options: (c) => opts(c, 'induction', ['na', 'turbo', 'supercharger']) },
    { id: 'boost', quantity: 'pressure', default: 1.0, min: 0, max: 4, hint: 'boost_hint' },
    { id: 'header', type: 'select', numeric: false, default: 'tubular', options: (c) => opts(c, 'header', ['stock', 'tubular', 'equal']) },
    { id: 'primary', quantity: 'length', default: 38, min: 20, max: 80, decimals: 0 },
    { id: 'collector', quantity: 'length', default: 60, min: 30, max: 130, decimals: 0 },
    { id: 'pipe', quantity: 'length', default: 60, min: 30, max: 130, decimals: 0 },
    { id: 'pipeL', quantity: 'length_m', default: 2.5, min: 0.3, max: 8 },
    { id: 'bends', default: 4, min: 0, max: 20, decimals: 0 },
    { id: 'cat', type: 'select', numeric: false, default: 'high_flow', options: (c) => opts(c, 'cat', ['stock', 'high_flow', 'race', 'none']) },
    { id: 'muffler', type: 'select', numeric: false, default: 'sport', options: (c) => opts(c, 'muffler', ['stock', 'sport', 'straight']) },
  ],
  groups: [
    { title: 'g_engine', fields: ['displacement', 'cylinders', 'rpm', 'power', 'type', 'boost'] },
    { title: 'g_line', fields: ['header', 'primary', 'collector', 'pipe', 'pipeL', 'bends', 'cat', 'muffler'] },
  ],

  compute(v) {
    const inputs = {
      dispL: v.displacement / 1000, cylinders: v.cylinders, rpm: v.rpm, powerKw: v.power, type: v.type, boostBar: v.boost,
      header: v.header, primaryMm: v.primary, collectorMm: v.collector, pipeMm: v.pipe, pipeLenM: v.pipeL, bends: v.bends, cat: v.cat, muffler: v.muffler,
    };
    return { ...computeExhaust(inputs), inputs, v };
  },

  results(r, c) {
    const pa = (x) => x / 1e5;
    const cards = [
      { label: c.t('r.total'), value: pa(r.totalPa), q: 'pressure', alt: true, status: LEVEL[r.level], note: c.t(`level.${r.level}`) },
      { label: c.t('r.loss'), text: `−${c.f('power', r.pumpingKw)}`, note: c.t('r.loss_note', { pct: c.fmt((r.pumpingKw / r.v.power) * 100, { decimals: 1 }) }) },
      { label: c.t('r.recommended'), value: r.recommendedMm, q: 'length', decimals: 0, status: r.v.pipe < r.recommendedMm * 0.9 ? 'warn' : 'ok',
        note: c.t('r.recommended_note', { d: c.f('length', r.v.pipe, { decimals: 0 }) }) },
      { label: c.t('r.mass'), value: r.massKgS * 1000, q: 'mass_flow', alt: true },
      { label: c.t('r.volume'), value: r.qLineM3s * 60, q: 'air_flow', alt: true, note: c.t('r.volume_note') },
      { label: c.t('r.vpipe'), value: r.vPipe, q: 'flow_velocity', decimals: 0 },
      { label: c.t('r.vprimary'), value: r.vPrimary, q: 'flow_velocity', decimals: 0 },
      { label: c.t('r.l_header'), value: pa(r.losses.header), q: 'pressure', note: r.v.type === 'turbo' ? c.t('r.header_turbo') : undefined },
      { label: c.t('r.l_cat'), value: pa(r.losses.cat), q: 'pressure' },
      { label: c.t('r.l_muffler'), value: pa(r.losses.muffler), q: 'pressure' },
      { label: c.t('r.l_piping'), value: pa(r.losses.piping), q: 'pressure' },
    ];
    if (r.turboManifoldBarA) cards.push({ label: c.t('r.manifold'), value: r.turboManifoldBarA, q: 'pressure_abs', note: c.t('r.manifold_note') });
    return cards;
  },

  notes(r, c) {
    const n = [];
    if (r.level === 'very_high' || r.level === 'high') n.push({ status: LEVEL[r.level], text: c.t('warn.high') });
    if (r.v.pipe < r.recommendedMm * 0.9) n.push({ status: 'warn', text: c.t('warn.undersized') });
    else if (r.v.type === 'na' && r.v.pipe > r.recommendedMm * 1.3) n.push({ status: 'warn', text: c.t('warn.oversized') });
    const worst = Object.entries(r.losses).sort((a, b) => b[1] - a[1])[0][0];
    n.push({ status: 'info', text: c.t('warn.priority', { part: c.t(`part.${worst}`) }) });
    return n;
  },

  charts(r, c) {
    const pts = rpmCurve(r.inputs);
    const L = r.losses;
    return [
      {
        title: c.t('chart.rpm_title'),
        labels: pts.map((p) => p.rpm),
        xTitle: `${c.t('chart.rpm')} (${c.tc('unit.rpm')})`,
        yTitle: `${c.t('chart.bp')} (${c.sym('pressure')})`,
        y2Title: `${c.t('chart.loss')} (${c.sym('power')})`,
        datasets: [
          { label: c.t('chart.bp'), data: pts.map((p) => c.cv('pressure', p.bar)), fill: true, color: '#ff6b6b' },
          { label: c.t('chart.loss'), data: pts.map((p) => c.cv('power', p.lossKw)), axis: 'y2', dashed: true, color: '#feca57' },
        ],
      },
      {
        title: c.t('chart.parts_title'), type: 'bar', legend: false,
        labels: ['header', 'cat', 'muffler', 'piping'].map((k) => c.t(`part.${k}`)),
        yTitle: `${c.t('chart.bp')} (${c.sym('pressure')})`,
        datasets: [{ label: c.sym('pressure'), data: [L.header, L.cat, L.muffler, L.piping].map((x) => c.cv('pressure', x / 1e5)), colors: ['#4a90e2', '#ff6b6b', '#feca57', '#4ecdc4'] }],
      },
    ];
  },
};
