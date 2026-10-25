/** Fiche du simulateur « Radiateur d'huile ». */
import { computeOilCooler, speedCurve } from './calc.js';

const ST = { excellent: 'ok', good: 'ok', oversized: 'warn', undersized: 'warn', critical: 'danger', impossible: 'danger' };

export default {
  id: 'oil_cooler',
  intro: 'intro',
  inputs: [
    { id: 'power', quantity: 'power', default: 300 * 0.73549875, min: 20, max: 2500 },
    { id: 'usage', type: 'select', numeric: false, default: 'street', options: (c) => ['street', 'track', 'race'].map((k) => ({ value: k, label: c.t(`usage.${k}`) })) },
    { id: 'oilFlow', quantity: 'liquid_flow', default: 15, min: 3, max: 80, hint: 'flow_hint' },
    { id: 'target', quantity: 'temperature', default: 105, min: 70, max: 140 },
    { id: 'type', type: 'select', numeric: false, default: 'air', options: (c) => ['air', 'water'].map((k) => ({ value: k, label: c.t(`type.${k}`) })) },
    { id: 'width', quantity: 'length', default: 250, min: 50, max: 800 },
    { id: 'height', quantity: 'length', default: 250, min: 30, max: 600 },
    { id: 'thickness', quantity: 'length', default: 50, min: 15, max: 120 },
    { id: 'ambient', quantity: 'temperature', default: 25, min: -20, max: 50 },
    { id: 'speed', quantity: 'vehicle_speed', default: 100, min: 0, max: 350, hint: 'speed_hint' },
    { id: 'coolant', quantity: 'temperature', default: 90, min: 60, max: 120, hint: 'coolant_hint' },
  ],
  groups: [
    { title: 'g_engine', fields: ['power', 'usage', 'oilFlow', 'target'] },
    { title: 'g_cooler', fields: ['type', 'width', 'height', 'thickness'] },
    { title: 'g_conditions', fields: ['ambient', 'speed', 'coolant'] },
  ],

  compute(v) {
    const inputs = { powerKw: v.power, usage: v.usage, oilFlowLmin: v.oilFlow, targetC: v.target, type: v.type, widthMm: v.width,
      heightMm: v.height, thicknessMm: v.thickness, ambientC: v.ambient, speedKmh: v.speed, coolantC: v.coolant };
    return { ...computeOilCooler(inputs), inputs, v };
  },

  results(r, c) {
    const kw = (w) => `${c.fmt(w / 1000, { decimals: 1 })} kW`;
    const cards = [
      { label: c.t('r.rating'), text: c.t(`rating.${r.rating}`), status: ST[r.rating], note: c.t('r.rating_note') },
      { label: c.t('r.heat'), text: kw(r.heatW), note: c.t('r.heat_note', { p: c.fmt(r.heatW / (r.inputs.powerKw * 10), { decimals: 0 }) }) },
      { label: c.t('r.eq'), value: r.eqTemp, q: 'temperature', alt: true, status: ST[r.rating], note: c.t('r.eq_note', { t: c.f('temperature', r.v.target) }) },
      { label: c.t('r.outlet'), value: r.outletTemp, q: 'temperature', note: c.t('r.outlet_note', { d: c.f('temperature_delta', r.eqTemp - r.outletTemp) }) },
      { label: c.t('r.capacity'), text: r.possible ? kw(r.capacityW) : '—', note: c.t('r.capacity_note', { t: c.f('temperature', r.v.target) }) },
      { label: c.t('r.eff'), text: `${c.fmt(r.eff * 100, { decimals: 0 })} %`, note: c.t('r.eff_note') },
    ];
    if (r.reqArea !== null) {
      cards.push({ label: c.t('r.size'), wide: true,
        text: Number.isFinite(r.reqArea) ? `${c.f('length', r.reqWidth, { decimals: 0 })} × ${c.f('length', r.reqHeight, { decimals: 0 })}` : c.t('r.size_none'),
        note: c.t('r.size_note', { th: c.f('length', r.v.thickness, { decimals: 0 }) }) });
    }
    if (r.vCore !== null) cards.push({ label: c.t('r.air'), value: r.vCore, q: 'flow_velocity', note: c.t('r.air_note') });
    return cards;
  },

  notes(r, c) {
    const n = [];
    if (r.rating === 'impossible') n.push({ status: 'danger', text: c.t('warn.impossible') });
    if (r.rating === 'critical' || r.rating === 'undersized') n.push({ status: r.rating === 'critical' ? 'danger' : 'warn', text: c.t('warn.undersized') });
    if (r.rating === 'oversized' || r.v.ambient < 5) n.push({ status: 'info', text: c.t('warn.thermostat') });
    if (r.eqTemp > 130) n.push({ status: 'danger', text: c.t('warn.too_hot') });
    if (r.v.type === 'air' && r.v.speed < 20) n.push({ status: 'warn', text: c.t('warn.fan') });
    n.push({ status: 'info', text: c.t('warn.method') });
    return n;
  },

  charts(r, c) {
    const pts = speedCurve(r.inputs);
    return [{
      title: c.t('chart.speed_title'),
      type: 'line',
      labels: pts.map((p) => c.fmt(c.cv('vehicle_speed', p.s), { decimals: 0 })),
      xTitle: `${c.t('chart.speed')} (${c.sym('vehicle_speed')})`,
      yTitle: `${c.t('chart.temp')} (${c.sym('temperature')})`,
      datasets: [
        { label: c.t('chart.eq'), data: pts.map((p) => c.cv('temperature', Math.min(p.t, 200))), fill: true, color: '#ff9f0a' },
        { label: c.t('chart.target'), data: pts.map(() => c.cv('temperature', r.v.target)), dashed: true, color: '#34c759' },
      ],
    }];
  },
};
