/** Fiche du simulateur « Répartition de freinage ». */
import { computeBrake, biasCurve } from './calc.js';

const BAL = { optimal: 'ok', acceptable: 'ok', adjust: 'warn', dangerous: 'danger' };

export default {
  id: 'brake_bias',
  intro: 'intro',
  inputs: [
    { id: 'mass', quantity: 'mass', default: 1200, min: 200, max: 5000 },
    { id: 'front', quantity: 'u:percent', default: 55, min: 30, max: 75, decimals: 0 },
    { id: 'wheelbase', quantity: 'length', default: 2600, min: 1500, max: 4500 },
    { id: 'cg', quantity: 'length', default: 500, min: 200, max: 1200, hint: 'cg_hint' },
    { id: 'trackFront', quantity: 'length', default: 1500, min: 1000, max: 2000 },
    { id: 'trackRear', quantity: 'length', default: 1500, min: 1000, max: 2000 },
    { id: 'decel', quantity: 'u:g', default: 1.0, min: 0.3, max: 2.5, decimals: 2, hint: 'decel_hint' },
    { id: 'bias', quantity: 'u:percent', default: 75, min: 40, max: 90, decimals: 1, hint: 'bias_hint' },
    { id: 'speed', quantity: 'vehicle_speed', default: 100, min: 20, max: 350 },
    { id: 'lateral', quantity: 'u:g', default: 1.0, min: 0.2, max: 2.5, decimals: 2 },
  ],
  groups: [
    { title: 'g_vehicle', fields: ['mass', 'front', 'wheelbase', 'cg', 'trackFront', 'trackRear'] },
    { title: 'g_braking', fields: ['decel', 'bias', 'speed', 'lateral'] },
  ],

  compute(v) {
    const inputs = { massKg: v.mass, frontPct: v.front, wheelbaseMm: v.wheelbase, cgMm: v.cg, trackFrontMm: v.trackFront,
      trackRearMm: v.trackRear, decelG: v.decel, biasPct: v.bias, speedKmh: v.speed, lateralG: v.lateral };
    return { ...computeBrake(inputs), inputs, v };
  },

  results(r, c) {
    const pct = (x, d = 1) => `${c.fmt(x, { decimals: d })} %`;
    return [
      { label: c.t('r.optimal'), text: pct(r.optimalPct), status: 'ok', note: c.t('r.optimal_note', { a: c.fmt(r.v.decel, { decimals: 2 }) }) },
      { label: c.t('r.balance'), text: c.t(`balance.${r.balance}`), status: BAL[r.balance],
        note: c.t('r.diff', { d: `${r.diff > 0 ? '+' : ''}${c.fmt(r.diff, { decimals: 1 })}` }) },
      { label: c.t('r.amax'), text: `${c.fmt(r.aMax, { decimals: 2, min: 2 })} g`, status: r.firstLock === 'rear' ? 'danger' : r.efficiency < 0.95 ? 'warn' : 'ok',
        note: c.t(`lock.${r.firstLock}`, { e: c.fmt(r.efficiency * 100, { decimals: 0 }) }) },
      { label: c.t('r.distance'), value: r.distance, q: 'length_m', decimals: 1, alt: true,
        note: c.t('r.distance_note', { s: c.f('vehicle_speed', r.v.speed, { decimals: 0 }), d: c.f('length_m', r.distanceIdeal, { decimals: 1 }) }) },
      { label: c.t('r.transfer'), value: r.transfer, q: 'mass', alt: true, note: c.t('r.transfer_note', { h: c.fmt(r.chi, { decimals: 2, min: 2 }) }) },
      { label: c.t('r.static'), text: `${c.f('mass', r.staticF)} / ${c.f('mass', r.staticR)}`, note: c.t('r.front_rear') },
      { label: c.t('r.dynamic'), text: `${c.f('mass', r.dynF)} / ${c.f('mass', r.dynR)}`, note: c.t('r.front_rear') },
      { label: c.t('r.inner_front'), value: Math.max(0, r.wheels.inF), q: 'mass', status: r.wheels.inF <= 0 ? 'danger' : r.wheels.inF < r.staticF * 0.15 ? 'warn' : 'ok',
        note: c.t('r.inner_note', { g: c.fmt(r.v.lateral, { decimals: 2 }) }) },
    ];
  },

  notes(r, c) {
    const n = [];
    if (r.firstLock === 'rear') n.push({ status: 'danger', text: c.t('warn.rear_lock') });
    else if (r.diff > 5) n.push({ status: 'warn', text: c.t('warn.front_bias') });
    if (r.chi > 0.25) n.push({ status: 'warn', text: c.t('warn.high_cg') });
    if (r.v.front < 45 || r.v.front > 65) n.push({ status: 'info', text: c.t('warn.unbalanced') });
    if (r.wheels.inF <= 0 || r.wheels.inR <= 0) n.push({ status: 'warn', text: c.t('warn.wheel_lift') });
    n.push({ status: 'info', text: c.t(r.v.decel < 0.9 ? 'setup.street' : r.v.decel < 1.2 ? 'setup.sport' : 'setup.track') });
    return n;
  },

  charts(r, c) {
    const curve = biasCurve(r.inputs);
    const kg = c.sym('mass');
    return [
      {
        title: c.t('chart.decel_title'),
        type: 'line',
        labels: curve.map((p) => `${p.b} %`),
        xTitle: c.t('chart.bias'),
        yTitle: `${c.t('chart.decel')} (g)`,
        datasets: [
          { label: c.t('chart.decel'), data: curve.map((p) => p.a), fill: true },
          { label: c.t('chart.target'), data: curve.map(() => r.v.decel), dashed: true, color: '#34c759' },
        ],
      },
      {
        title: c.t('chart.load_title'),
        type: 'bar',
        labels: [c.t('chart.static'), c.t('chart.braking')],
        yTitle: `${c.t('chart.load')} (${kg})`,
        datasets: [
          { label: c.t('chart.front'), data: [c.cv('mass', r.staticF), c.cv('mass', r.dynF)], color: '#4a90e2' },
          { label: c.t('chart.rear'), data: [c.cv('mass', r.staticR), c.cv('mass', r.dynR)], color: '#ff6b6b' },
        ],
      },
      {
        title: c.t('chart.lateral_title', { g: c.fmt(r.v.lateral, { decimals: 2 }) }),
        type: 'bar',
        labels: [c.t('chart.in_front'), c.t('chart.out_front'), c.t('chart.in_rear'), c.t('chart.out_rear')],
        yTitle: `${c.t('chart.load')} (${kg})`,
        datasets: [
          { label: c.t('chart.load'), data: [r.wheels.inF, r.wheels.outF, r.wheels.inR, r.wheels.outR].map((x) => c.cv('mass', Math.max(0, x))),
            colors: ['#7fb2ee', '#4a90e2', '#ff9e9e', '#ff6b6b'] },
        ],
        legend: false,
      },
    ];
  },
};
