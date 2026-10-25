/** Fiche du simulateur « Vitesse de piston ». */
import { computePiston, crankCurve, forceCurve } from './calc.js';

export default {
  id: 'piston_speed',
  intro: 'intro',
  inputs: [
    { id: 'stroke', quantity: 'length', default: 86, min: 20, max: 200 },
    { id: 'rod', quantity: 'length', default: 144, min: 50, max: 350 },
    { id: 'rpm', quantity: 'u:rpm', default: 7000, min: 500, max: 20000, decimals: 0 },
    { id: 'piston', quantity: 'small_mass', default: 400, min: 50, max: 2000, decimals: 0 },
    { id: 'pin', quantity: 'small_mass', default: 80, min: 10, max: 500, decimals: 0 },
    { id: 'rings', quantity: 'small_mass', default: 40, min: 5, max: 200, decimals: 0 },
    { id: 'rodMass', quantity: 'small_mass', default: 550, min: 100, max: 2000, decimals: 0, hint: 'rod_hint' },
  ],
  groups: [
    { title: 'g_geometry', fields: ['stroke', 'rod', 'rpm'] },
    { title: 'g_masses', fields: ['piston', 'pin', 'rings', 'rodMass'] },
  ],

  compute(v) {
    const inputs = { stroke: v.stroke, rod: v.rod, rpm: v.rpm, piston: v.piston, pin: v.pin, rings: v.rings, rodMass: v.rodMass };
    return { ...computePiston(inputs), inputs, v };
  },

  results(r, c) {
    const st = { excellent: 'ok', good: 'ok', acceptable: 'warn', high: 'danger', extreme: 'danger' }[r.rating];
    return [
      { label: c.t('r.mean'), value: r.meanSpeed, q: 'speed', alt: true, status: st, note: c.t(`rate.${r.rating}`) },
      { label: c.t('r.max'), value: r.maxSpeed, q: 'speed', note: c.t('r.max_note', { a: c.fmt(r.maxAngle, { decimals: 0 }) }) },
      { label: c.t('r.accel'), text: `${c.fmt(r.accelG, { decimals: 0 })} g`, note: `${c.fmt(r.accelTdc, { decimals: 0 })} m/s²` },
      { label: c.t('r.force'), value: r.forceTdc, q: 'force', alt: true, note: c.t('r.force_note') },
      { label: c.t('r.recip'), value: r.recipKg * 1000, q: 'small_mass', note: c.t('r.recip_note') },
      { label: c.t('r.ratio'), text: c.fmt(r.rodRatio, { decimals: 2, min: 2 }), note: c.t(`rod.${r.rod}`) },
      { label: c.t('r.limit'), value: r.rpmLimit, q: 'u:rpm', decimals: 0, status: r.v.rpm > r.rpmLimit * 1.15 ? 'danger' : r.v.rpm > r.rpmLimit ? 'warn' : 'ok', note: c.t('r.limit_note', { v: c.f('speed', 23) }) },
    ];
  },

  notes(r, c) {
    const n = [];
    if (r.v.rpm > r.rpmLimit * 1.15) n.push({ status: 'danger', text: c.t('warn.reduce_rpm') });
    else if (r.meanSpeed > 26) n.push({ status: 'warn', text: c.t('warn.forged') });
    if (r.recipKg > 0.8) n.push({ status: 'warn', text: c.t('warn.heavy') });
    return n;
  },

  charts(r, c) {
    const cc = crankCurve(r.inputs);
    const fc = forceCurve(r.inputs);
    return [
      {
        title: c.t('chart.crank_title'), labels: cc.map((p) => `${p.a}°`),
        xTitle: c.t('chart.angle'), yTitle: `${c.t('chart.velocity')} (${c.sym('speed')})`, y2Title: `${c.t('chart.accel')} (g)`,
        datasets: [
          { label: c.t('chart.velocity'), data: cc.map((p) => c.cv('speed', p.v)), fill: true },
          { label: c.t('chart.accel'), data: cc.map((p) => p.acc), axis: 'y2', dashed: true, color: '#ff6b6b' },
        ],
      },
      {
        title: c.t('chart.force_title'), labels: fc.map((p) => p.rpm),
        xTitle: `${c.t('chart.rpm')} (${c.tc('unit.rpm')})`, yTitle: `${c.t('chart.force')} (${c.sym('force')})`,
        datasets: [{ label: c.t('chart.force'), data: fc.map((p) => c.cv('force', p.f)), fill: true, color: '#feca57' }],
      },
    ];
  },
};
