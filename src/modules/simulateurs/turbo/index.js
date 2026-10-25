/** Fiche du simulateur « Calibrage turbo ». */
import { computeTurbo, operatingLine } from './calc.js';
import { FUELS, fuelOptions } from '../../data/fuels.js';

export default {
  id: 'turbo',
  intro: 'intro',
  inputs: [
    { id: 'displacement', quantity: 'displacement', default: 2000, min: 100, max: 15000 },
    { id: 'rpm', quantity: 'u:rpm', default: 6000, min: 1000, max: 20000, decimals: 0 },
    { id: 've', quantity: 'u:percent', default: 85, min: 40, max: 130, decimals: 0 },
    { id: 'manifold', quantity: 'pressure_abs', default: 2.0, min: 0.8, max: 6, hint: 'manifold_hint' },
    { id: 'ambient', quantity: 'temperature', default: 25, min: -30, max: 55 },
    { id: 'atm', quantity: 'pressure_abs', default: 1.013, min: 0.6, max: 1.1, hint: 'atm_hint' },
    { id: 'etaC', quantity: 'u:percent', default: 75, min: 50, max: 85, decimals: 0 },
    { id: 'icEff', quantity: 'u:percent', default: 70, min: 0, max: 95, decimals: 0, hint: 'ic_hint' },
    { id: 'dpIc', quantity: 'pressure', default: 0.1, min: 0, max: 0.5 },
    { id: 'dpInlet', quantity: 'pressure', default: 0.05, min: 0, max: 0.3 },
    { id: 'fuel', type: 'select', numeric: false, default: 'sp98', options: () => fuelOptions() },
    { id: 'ref', type: 'select', numeric: false, default: 'garrett', options: (c) => [
      { value: 'garrett', label: c.t('ref_garrett') }, { value: 'std', label: c.t('ref_std') }] },
  ],
  groups: [
    { title: 'g_engine', fields: ['displacement', 'rpm', 've', 'manifold', 'fuel'] },
    { title: 'g_air', fields: ['ambient', 'atm', 'dpInlet'] },
    { title: 'g_turbo', fields: ['etaC', 'icEff', 'dpIc', 'ref'] },
  ],

  compute(v) {
    const f = FUELS[v.fuel];
    const inputs = {
      dispL: v.displacement / 1000, rpm: v.rpm, ve: v.ve / 100, pManBarA: v.manifold, tAmbC: v.ambient, pAtmBar: v.atm,
      etaC: v.etaC / 100, dpIcBar: v.dpIc, dpInletBar: v.dpInlet, icEff: v.icEff / 100, afr: f.afr, pciMJkg: f.pci, ref: v.ref,
    };
    return { ...computeTurbo(inputs), inputs, v };
  },

  results(r, c) {
    const kgs = (x) => x * 1000; // kg/s → g/s (unité de base « débit massique »)
    return [
      { label: c.t('r.pr'), text: `${c.fmt(r.pr, { decimals: 2, min: 2 })} : 1`, status: r.pr > 3 ? 'warn' : 'ok',
        note: c.t('r.pr_note', { p2: c.f('pressure_abs', r.p2), p1: c.f('pressure_abs', r.p1) }) },
      { label: c.t('r.boost'), value: r.boostGauge, q: 'pressure', alt: true },
      { label: c.t('r.corrected'), value: kgs(r.correctedKgS), q: 'mass_flow', alt: true, note: c.t(`r.ref_${r.v.ref}`) },
      { label: c.t('r.air'), value: kgs(r.airKgS), q: 'mass_flow', alt: true },
      { label: c.t('r.t2'), value: r.t2C, q: 'temperature', status: r.t2C > 200 ? 'danger' : r.t2C > 150 ? 'warn' : 'ok' },
      { label: c.t('r.tman'), value: r.tManC, q: 'temperature', note: c.t('r.tman_note', { e: c.fmt(r.v.icEff, { decimals: 0 }) }) },
      { label: c.t('r.power'), value: r.powerKw, q: 'power', alt: true, status: 'ok', note: c.t('r.power_note') },
      { label: c.t('r.exhaust'), value: r.exhaustMm, q: 'length', decimals: 0, note: c.t('r.exhaust_note') },
    ];
  },

  notes(r, c) {
    const n = [];
    if (r.pr > 3) n.push({ status: 'warn', text: c.t('warn.pr_high') });
    if (r.t2C > 200) n.push({ status: 'danger', text: c.t('warn.t2_high') });
    if (r.v.etaC < 65) n.push({ status: 'warn', text: c.t('warn.eta_low') });
    if (r.v.icEff === 0 && r.t2C > 80) n.push({ status: 'warn', text: c.t('warn.no_ic') });
    if (!n.length) n.push({ status: 'ok', text: c.t('warn.ok') });
    return n;
  },

  charts(r, c) {
    const line = operatingLine(r.inputs);
    return [
      {
        title: c.t('chart.line_title'),
        labels: line.map((p) => p.rpm),
        xTitle: `${c.t('chart.rpm')} (${c.tc('unit.rpm')})`,
        yTitle: `${c.t('chart.flow')} (${c.sym('mass_flow')})`,
        y2Title: `${c.t('chart.power')} (${c.sym('power')})`,
        datasets: [
          { label: c.t('chart.flow'), data: line.map((p) => c.cv('mass_flow', p.flow * 1000)), fill: true },
          { label: c.t('chart.power'), data: line.map((p) => c.cv('power', computeTurboPower(r.inputs, p.rpm))), axis: 'y2', color: '#feca57', dashed: true },
        ],
      },
      {
        title: c.t('chart.temp_title'), type: 'bar', legend: false,
        labels: [c.t('chart.t_amb'), c.t('chart.t_comp'), c.t('chart.t_man')],
        yTitle: `${c.t('chart.temp')} (${c.sym('temperature')})`,
        datasets: [{ label: c.sym('temperature'), data: [r.t1C, r.t2C, r.tManC].map((t) => c.cv('temperature', t)), colors: ['#4ecdc4', '#ff6b6b', '#00d4ff'] }],
      },
    ];
  },
};

function computeTurboPower(inputs, rpm) {
  return computeTurbo({ ...inputs, rpm }).powerKw;
}
