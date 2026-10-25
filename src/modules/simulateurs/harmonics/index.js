/** Fiche « Harmonics3+ » : synthèse moteur et diagnostic automatique. */
import { computeHarmonics, boostCurve } from './calc.js';
import { fuelOptions } from '../../data/fuels.js';

const KNOCK = { low: 'ok', medium: 'warn', high: 'danger' };

export default {
  id: 'harmonics',
  intro: 'intro',
  inputs: [
    { id: 'displacement', quantity: 'displacement', default: 2000, min: 50, max: 15000 },
    { id: 'cylinders', default: 4, min: 1, max: 16, decimals: 0 },
    { id: 'cr', default: 9.5, min: 6, max: 16, decimals: 1, suffix: () => ':1' },
    { id: 'rpm', quantity: 'u:rpm', default: 6000, min: 1000, max: 15000, decimals: 0, hint: 'rpm_hint' },
    { id: 've', quantity: 'u:percent', default: 90, min: 40, max: 130, decimals: 0 },
    { id: 'inDuration', quantity: 'u:deg', default: 260, min: 180, max: 340, decimals: 0 },
    { id: 'boost', quantity: 'pressure', default: 1.0, min: 0, max: 4 },
    { id: 'fuel', type: 'select', numeric: false, default: 'sp98', options: () => fuelOptions() },
    { id: 'ambient', quantity: 'temperature', default: 25, min: -30, max: 55 },
    { id: 'etaC', quantity: 'u:percent', default: 75, min: 50, max: 85, decimals: 0 },
    { id: 'icEff', quantity: 'u:percent', default: 70, min: 0, max: 95, decimals: 0 },
    { id: 'rail', quantity: 'pressure', default: 3.5, min: 1, max: 10 },
    { id: 'drivetrain', quantity: 'u:percent', default: 85, min: 60, max: 98, decimals: 0 },
  ],
  groups: [
    { title: 'g_engine', fields: ['displacement', 'cylinders', 'cr', 'rpm', 've', 'inDuration'] },
    { title: 'g_boost', fields: ['boost', 'fuel', 'ambient', 'etaC', 'icEff'] },
    { title: 'g_misc', fields: ['rail', 'drivetrain'] },
  ],

  compute(v) {
    const inputs = { dispL: v.displacement / 1000, cylinders: v.cylinders, cr: v.cr, rpm: v.rpm, ve: v.ve / 100, inDuration: v.inDuration,
      boostBar: v.boost, fuel: v.fuel, ambient: v.ambient, etaC: v.etaC / 100, icEff: v.icEff / 100, rail: v.rail, drivetrain: v.drivetrain / 100 };
    return { ...computeHarmonics(inputs), inputs, v };
  },

  results(r, c) {
    const t = r.turbo;
    const cards = [
      { label: c.t('r.power'), value: r.powerKw, q: 'power', alt: true, status: 'ok', note: c.t('r.power_note', { rpm: c.f('u:rpm', r.v.rpm, { decimals: 0 }) }) },
      { label: c.t('r.torque'), value: r.torqueNm, q: 'torque', alt: true },
      { label: c.t('r.wheel'), value: r.wheelKw, q: 'power', note: c.t('r.wheel_note', { e: c.fmt(r.v.drivetrain, { decimals: 0 }) }) },
      { label: c.t('r.air'), value: t.airKgS * 1000, q: 'mass_flow', alt: true },
      { label: c.t('r.injector'), value: r.inj.flowCcMin, q: 'injector_flow', alt: true, opts: { density: r.fuel.density }, note: c.t('r.injector_note', { p: c.f('pressure', 3) }) },
      { label: c.t('r.knock'), text: c.t(`knock.${r.knock}`), status: KNOCK[r.knock],
        note: c.t('r.knock_note', { need: c.fmt(r.ronNeeded, { decimals: 0 }), have: c.fmt(r.fuelRon, { decimals: 0 }) }) },
      { label: c.t('r.dcr'), text: `${c.fmt(r.dcr, { decimals: 2, min: 2 })} : 1`, note: r.v.boost > 0 ? c.t('r.ecr', { e: c.fmt(r.ecr, { decimals: 1 }) }) : undefined },
    ];
    if (r.v.boost > 0) {
      cards.push(
        { label: c.t('r.pr'), text: `${c.fmt(t.pr, { decimals: 2, min: 2 })} : 1` },
        { label: c.t('r.t2'), value: t.t2C, q: 'temperature', status: t.t2C > 150 ? 'warn' : 'ok' },
        { label: c.t('r.tman'), value: t.tManC, q: 'temperature' },
      );
    }
    cards.push(
      { label: c.t('r.otto'), text: `${c.fmt(r.otto * 100, { decimals: 1 })} %`, note: c.t('r.otto_note') },
      { label: c.t('r.runner'), value: r.runner, q: 'length', decimals: 0, note: c.t('r.runner_note') },
      { label: c.t('r.plenum'), value: r.plenumL, q: 'volume', note: c.t('r.plenum_note') },
      { label: c.t('r.heat'), value: r.heatKw, q: 'power', note: c.t('r.heat_note') },
    );
    return cards;
  },

  notes(r, c) {
    return r.diagnostics.map((d) => ({ status: d.status, text: c.t(`diag.${d.key}`) }));
  },

  charts(r, c) {
    const pts = boostCurve(r.inputs);
    return [
      {
        title: c.t('chart.boost_title'), labels: pts.map((p) => c.fmt(c.cv('pressure', p.b), { decimals: 1 })),
        xTitle: `${c.t('chart.boost')} (${c.sym('pressure')})`, yTitle: `${c.t('chart.power')} (${c.sym('power')})`, y2Title: `${c.t('chart.torque')} (${c.sym('torque')})`,
        datasets: [
          { label: c.t('chart.power'), data: pts.map((p) => c.cv('power', p.kw)), fill: true },
          { label: c.t('chart.torque'), data: pts.map((p) => c.cv('torque', p.nm)), axis: 'y2', dashed: true, color: '#feca57' },
        ],
      },
    ];
  },
};
