/** Fiche du simulateur « Embiellage » (bielle, axe, maneton). */
import { computeConrod, cycleCurve } from './calc.js';

export const MATERIALS = { pm: 550, forged_4340: 900, billet_300m: 1500, alu_7075: 480, titanium: 880 };
const STATUS = { excellent: 'ok', good: 'ok', limit: 'warn', failure: 'danger' };

export default {
  id: 'conrod',
  intro: 'intro',
  inputs: [
    { id: 'bore', quantity: 'length', default: 86, min: 30, max: 160 },
    { id: 'stroke', quantity: 'length', default: 86, min: 30, max: 160 },
    { id: 'rod', quantity: 'length', default: 144, min: 60, max: 300 },
    { id: 'cylinders', default: 4, min: 1, max: 16, decimals: 0 },
    { id: 'cr', default: 10.5, min: 6, max: 16, decimals: 1, suffix: () => ':1' },
    { id: 'boost', quantity: 'pressure', default: 0, min: 0, max: 5 },
    { id: 'rpm', quantity: 'u:rpm', default: 6000, min: 1000, max: 15000, decimals: 0, hint: 'rpm_hint' },
    { id: 'rpmMax', quantity: 'u:rpm', default: 7000, min: 1000, max: 20000, decimals: 0 },
    { id: 'pistonKit', quantity: 'small_mass', default: 520, min: 100, max: 2000, decimals: 0, hint: 'kit_hint' },
    { id: 'rodMass', quantity: 'small_mass', default: 550, min: 100, max: 2000, decimals: 0 },
    { id: 'material', type: 'select', numeric: false, default: 'pm', options: (c) => Object.entries(MATERIALS).map(([k, y]) => ({ value: k, label: `${c.t(`mat.${k}`)} (${c.f('stress', y)})` })) },
    { id: 'shankArea', default: 180, min: 30, max: 1000, decimals: 0, suffix: () => 'mm²', hint: 'shank_hint' },
    { id: 'pinOd', quantity: 'length', default: 22, min: 8, max: 40 },
    { id: 'pinId', quantity: 'length', default: 13, min: 0, max: 30 },
    { id: 'crankpin', quantity: 'length', default: 48, min: 20, max: 80 },
    { id: 'bearingWidth', quantity: 'length', default: 20, min: 8, max: 40 },
  ],
  groups: [
    { title: 'g_engine', fields: ['bore', 'stroke', 'rod', 'cylinders', 'cr', 'boost', 'rpm', 'rpmMax'] },
    { title: 'g_parts', fields: ['pistonKit', 'rodMass', 'material', 'shankArea', 'pinOd', 'pinId', 'crankpin', 'bearingWidth'] },
  ],

  compute(v) {
    const inputs = { bore: v.bore, stroke: v.stroke, rod: v.rod, cylinders: v.cylinders, cr: v.cr, boostBar: v.boost, rpm: v.rpm,
      rpmMax: v.rpmMax, pistonKit: v.pistonKit, rodMass: v.rodMass, shankArea: v.shankArea, yield: MATERIALS[v.material],
      pinOd: v.pinOd, pinId: Math.min(v.pinId, v.pinOd * 0.9), crankpin: v.crankpin, bearingWidth: v.bearingWidth };
    return { ...computeConrod(inputs), inputs, v };
  },

  results(r, c) {
    const sfNote = (k) => c.t('r.sf', { f: c.fmt(r.sf[k], { decimals: 2, min: 2 }), v: c.t(`rating.${r.ratings[k]}`) });
    return [
      { label: c.t('r.overall'), text: c.t(`rating.${r.overall}`), status: STATUS[r.overall], note: c.t('r.overall_note') },
      { label: c.t('r.peak'), value: r.peakBar, q: 'pressure_abs', note: c.t('r.peak_note') },
      { label: c.t('r.gas'), value: r.gasN, q: 'force', alt: true },
      { label: c.t('r.comp'), value: r.sigmaComp, q: 'stress', status: STATUS[r.ratings.comp], note: `${c.f('force', r.compressionN)} · ${sfNote('comp')}` },
      { label: c.t('r.tens'), value: r.sigmaTens, q: 'stress', status: STATUS[r.ratings.tens], note: `${c.f('force', r.tensionN)} · ${sfNote('tens')}` },
      { label: c.t('r.pin'), value: r.tauPin, q: 'stress', status: STATUS[r.ratings.pin], note: sfNote('pin') },
      { label: c.t('r.bearing'), value: r.bearingMpa, q: 'stress', status: r.bearing, note: c.t('r.bearing_note') },
      { label: c.t('r.torque'), value: r.torqueNm, q: 'torque', alt: true, note: c.t('r.torque_note', { b: c.fmt(r.bmep, { decimals: 1 }) }) },
      { label: c.t('r.power'), value: r.powerKw, q: 'power', alt: true, note: c.t('r.power_note', { rpm: c.f('u:rpm', r.v.rpm, { decimals: 0 }) }) },
    ];
  },

  notes(r, c) {
    const n = [];
    if (r.overall === 'failure') n.push({ status: 'danger', text: c.t('warn.failure') });
    else if (r.overall === 'limit') n.push({ status: 'warn', text: c.t('warn.limit') });
    if (r.bearing !== 'ok') n.push({ status: r.bearing, text: c.t('warn.bearing') });
    n.push({ status: 'info', text: c.t('warn.method') });
    return n;
  },

  charts(r, c) {
    const pts = cycleCurve(r.inputs);
    const kn = (x) => c.cv('force', x * 1000);
    return [
      {
        title: c.t('chart.forces_title'), points: false, labels: pts.map((p) => p.a),
        xTitle: c.t('chart.angle'), yTitle: `${c.t('chart.force')} (${c.sym('force')})`,
        datasets: [
          { label: c.t('chart.rod'), data: pts.map((p) => kn(p.rodKn)), color: '#00d4ff' },
          { label: c.t('chart.gas'), data: pts.map((p) => kn(p.gasKn)), color: '#ff6b6b', dashed: true },
          { label: c.t('chart.inertia'), data: pts.map((p) => kn(p.inertiaKn)), color: '#feca57', dashed: true },
        ],
      },
      {
        title: c.t('chart.pressure_title'), points: false, labels: pts.map((p) => p.a),
        xTitle: c.t('chart.angle'), yTitle: `${c.t('chart.pressure')} (${c.sym('pressure_abs')})`,
        datasets: [{ label: c.t('chart.pressure'), data: pts.map((p) => c.cv('pressure_abs', p.bar)), fill: true, color: '#a78bfa' }],
      },
    ];
  },
};
