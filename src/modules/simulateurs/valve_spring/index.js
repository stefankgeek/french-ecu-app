/** Fiche du simulateur « Ressorts de soupapes ». */
import { computeValveSpring, forceCurve, marginCurve, TARGET_MARGIN } from './calc.js';

export default {
  id: 'valve_spring',
  intro: 'intro',
  inputs: [
    { id: 'lift', quantity: 'length', default: 11, min: 2, max: 25 },
    { id: 'duration', quantity: 'u:deg', default: 280, min: 180, max: 360, decimals: 0, hint: 'duration_hint' },
    { id: 'rpm', quantity: 'u:rpm', default: 7000, min: 1000, max: 20000, decimals: 0 },
    { id: 'valve', quantity: 'small_mass', default: 80, min: 10, max: 300, decimals: 0 },
    { id: 'retainer', quantity: 'small_mass', default: 15, min: 2, max: 80, decimals: 0 },
    { id: 'springMass', quantity: 'small_mass', default: 50, min: 5, max: 200, decimals: 0 },
    { id: 'follower', quantity: 'small_mass', default: 30, min: 0, max: 300, decimals: 0, hint: 'follower_hint' },
    { id: 'rate', quantity: 'spring_rate', default: 40, min: 5, max: 200 },
    { id: 'freeHeight', quantity: 'length', default: 50, min: 20, max: 90 },
    { id: 'installed', quantity: 'length', default: 40, min: 15, max: 80 },
    { id: 'coilBind', quantity: 'length', default: 28, min: 10, max: 70 },
    { id: 'dual', type: 'select', numeric: false, default: 'no', options: (c) => [{ value: 'no', label: c.t('single') }, { value: 'yes', label: c.t('dual') }] },
  ],
  groups: [
    { title: 'g_cam', fields: ['lift', 'duration', 'rpm'] },
    { title: 'g_masses', fields: ['valve', 'retainer', 'springMass', 'follower'] },
    { title: 'g_spring', fields: ['rate', 'freeHeight', 'installed', 'coilBind', 'dual'] },
  ],

  compute(v) {
    const inputs = { lift: v.lift, duration: v.duration, rpm: v.rpm, valve: v.valve, retainer: v.retainer, springMass: v.springMass,
      follower: v.follower, rate: v.rate, freeHeight: v.freeHeight, installed: v.installed, coilBind: v.coilBind, dual: v.dual === 'yes' };
    return { ...computeValveSpring(inputs), inputs, v };
  },

  results(r, c) {
    const st = { low: 'ok', moderate: 'warn', high: 'danger', critical: 'danger' }[r.risk];
    return [
      { label: c.t('r.margin'), text: `${c.fmt(r.margin * 100, { decimals: 0 })} %`, status: st, note: c.t(`risk.${r.risk}`) },
      { label: c.t('r.seat'), value: r.seat, q: 'force', alt: true, note: c.t('r.seat_note', { p: c.f('length', r.preload) }) },
      { label: c.t('r.open'), value: r.open, q: 'force', alt: true },
      { label: c.t('r.required'), value: r.required, q: 'force', alt: true, note: c.t('r.required_note', { g: c.fmt(r.accelG, { decimals: 0 }) }) },
      { label: c.t('r.bind'), value: r.bindMargin, q: 'length', status: r.bindMargin < 0 ? 'danger' : r.bindMargin < 1.5 ? 'warn' : 'ok', note: c.t('r.bind_note') },
      { label: c.t('r.rpm_limit'), value: r.rpmLimit, q: 'u:rpm', decimals: 0, status: r.v.rpm > r.rpmLimit ? 'warn' : 'ok', note: c.t('r.rpm_limit_note', { m: c.fmt(TARGET_MARGIN * 100, { decimals: 0 }) }) },
      { label: c.t('r.mass'), value: r.massKg * 1000, q: 'small_mass', note: c.t('r.mass_note') },
    ];
  },

  notes(r, c) {
    const n = [];
    if (r.margin < 0.2) n.push({ status: 'danger', text: c.t(r.v.dual === 'yes' ? 'warn.increase_rate' : 'warn.use_dual') });
    if (r.bindMargin < 1.5) n.push({ status: r.bindMargin < 0 ? 'danger' : 'warn', text: c.t('warn.bind') });
    if (r.v.rpm > r.rpmLimit) n.push({ status: 'warn', text: c.t('warn.rpm') });
    n.push({ status: 'info', text: c.t('warn.method') });
    return n;
  },

  charts(r, c) {
    const fc = forceCurve(r.inputs);
    const mc = marginCurve(r.inputs);
    return [
      {
        title: c.t('chart.force_title'), labels: fc.map((p) => c.fmt(c.cv('length', p.lift), { decimals: 1 })),
        xTitle: `${c.t('chart.lift')} (${c.sym('length')})`, yTitle: `${c.t('chart.force')} (${c.sym('force')})`,
        datasets: [
          { label: c.t('chart.spring'), data: fc.map((p) => c.cv('force', p.f)), fill: true },
          { label: c.t('chart.required'), data: fc.map(() => c.cv('force', r.required)), dashed: true, color: '#ff6b6b' },
        ],
      },
      {
        title: c.t('chart.margin_title'), labels: mc.map((p) => p.rpm),
        xTitle: `${c.t('chart.rpm')} (${c.tc('unit.rpm')})`, yTitle: c.t('chart.margin'),
        datasets: [
          { label: c.t('chart.margin'), data: mc.map((p) => p.m), fill: true, color: '#4ecdc4' },
          { label: c.t('chart.target'), data: mc.map(() => TARGET_MARGIN * 100), dashed: true, color: '#feca57' },
        ],
      },
    ];
  },
};
