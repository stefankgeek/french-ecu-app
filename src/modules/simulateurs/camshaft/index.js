/** Fiche du simulateur « Arbre à cames ». */
import { computeCam, liftCurves } from './calc.js';

export default {
  id: 'camshaft',
  intro: 'intro',
  inputs: [
    { id: 'inDur', quantity: 'u:deg', default: 280, min: 180, max: 360, decimals: 0 },
    { id: 'exDur', quantity: 'u:deg', default: 280, min: 180, max: 360, decimals: 0 },
    { id: 'inCl', quantity: 'u:deg', default: 106, min: 80, max: 130, decimals: 1, hint: 'incl_hint' },
    { id: 'exCl', quantity: 'u:deg', default: 114, min: 80, max: 140, decimals: 1, hint: 'excl_hint' },
    { id: 'inLift', quantity: 'length', default: 11, min: 3, max: 25 },
    { id: 'exLift', quantity: 'length', default: 10.5, min: 3, max: 25 },
    { id: 'displacement', quantity: 'displacement', default: 2000, min: 50, max: 15000 },
    { id: 'cylinders', type: 'select', default: 4, options: (c) => [1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => ({ value: n, label: c.tc('common.cylinders', { count: n }) })) },
    { id: 'boost', type: 'select', numeric: false, default: 'na', options: (c) => ['na', 'turbo', 'supercharger'].map((k) => ({ value: k, label: c.t(`induction.${k}`) })) },
    { id: 'cr', default: 10.5, min: 6, max: 16, decimals: 1, suffix: () => ':1' },
    { id: 'rodRatio', default: 1.6, min: 1.3, max: 2.2, decimals: 2, hint: 'rodratio_hint' },
  ],
  groups: [
    { title: 'g_cam', fields: ['inDur', 'exDur', 'inCl', 'exCl', 'inLift', 'exLift'] },
    { title: 'g_engine', fields: ['displacement', 'cylinders', 'boost', 'cr', 'rodRatio'] },
  ],

  compute(v) {
    const inputs = { inDur: v.inDur, exDur: v.exDur, inCl: v.inCl, exCl: v.exCl, inLift: v.inLift, exLift: v.exLift,
      dispL: v.displacement / 1000, cylinders: v.cylinders, boost: v.boost, cr: v.cr, rodRatio: v.rodRatio };
    return { ...computeCam(inputs), inputs, v };
  },

  results(r, c) {
    const d = (x) => c.fmt(x, { decimals: 1 });
    const rpm = (x) => c.f('u:rpm', Math.round(x / 100) * 100, { decimals: 0 });
    return [
      { label: c.t('r.overlap'), text: `${d(r.overlap)}°`, status: r.overlap > 70 ? 'warn' : 'ok', note: c.t(`usage.${r.usage}`) },
      { label: c.t('r.lsa'), text: `${d(r.lsa)}°`, note: c.t('r.advance', { a: `${r.advance >= 0 ? '+' : ''}${d(r.advance)}°` }) },
      { label: c.t('r.timing'), wide: true, text: c.t('r.timing_text', { ivo: d(r.ivo), ivc: d(r.ivc), evo: d(r.evo), evc: d(r.evc) }) },
      { label: c.t('r.dcr'), text: `${c.fmt(r.dcr, { decimals: 2, min: 2 })} : 1`, status: r.warnings.includes('dcr_low') || r.warnings.includes('dcr_high') ? 'warn' : 'ok', note: c.t('r.dcr_note', { ivc: d(r.ivc) }) },
      { label: c.t('r.band'), text: `${rpm(r.bandStart)} – ${rpm(r.peakRpm)}`, note: c.t('r.band_note') },
      { label: c.t('r.vacuum'), text: `≈ ${c.fmt(r.vacuum, { decimals: 0 })} inHg`, note: `≈ ${c.f('pressure', -r.vacuum * 0.0338639)}` },
      { label: c.t('r.idle'), text: c.tc(`rating.${{ excellent: 'excellent', good: 'good', fair: 'adequate', poor: 'insufficient', very_poor: 'insufficient' }[r.idle]}`) },
      { label: c.t('r.ecu'), text: c.t(`ecu.${r.ecu}`), status: r.ecu === 'mandatory' ? 'warn' : 'ok' },
    ];
  },

  notes(r, c) {
    return r.warnings.map((w) => ({ status: 'warn', text: c.t(`warn.${w}`) }));
  },

  charts(r, c) {
    const pts = liftCurves(r.inputs);
    return [{
      title: c.t('chart.lift_title'), points: false,
      labels: pts.map((p) => p.a),
      xTitle: c.t('chart.angle'), yTitle: `${c.t('chart.lift')} (${c.sym('length')})`,
      datasets: [
        { label: c.t('chart.exhaust'), data: pts.map((p) => c.cv('length', p.ex)), fill: true, color: '#ff6b6b' },
        { label: c.t('chart.intake'), data: pts.map((p) => c.cv('length', p.in)), fill: true, color: '#00d4ff' },
      ],
    }];
  },
};
