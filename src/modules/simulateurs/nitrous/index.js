/** Fiche du simulateur « Protoxyde d'azote (NOS) ». */
import { computeNos, bottleCurve, SHOT_SIZES, BOTTLE_SIZES, EFFICIENCY, TARGET_LAMBDA } from './calc.js';

const KW_PER_HP = 0.745699872;
const LB_KG = 0.45359237;
const hpToKw = (hp) => hp * KW_PER_HP;
const lbhToGs = (lbh) => (lbh * 453.59237) / 3600;

export default {
  id: 'nitrous',
  intro: 'intro',
  inputs: [
    { id: 'basePower', quantity: 'power', default: 300 * 0.73549875, min: 20, max: 2500 },
    { id: 'compression', default: 9.5, min: 6, max: 16, decimals: 1, suffix: () => ':1' },
    { id: 'octane', default: 98, min: 80, max: 120, decimals: 0, suffix: () => 'RON' },
    { id: 'timing', quantity: 'u:deg', default: 28, min: 0, max: 50, decimals: 1 },
    { id: 'shot', type: 'select', default: 100, options: (c) => SHOT_SIZES.map((s) => ({ value: s, label: c.sym('power') === 'hp' ? `${s} hp` : `${s} hp (${c.f('power', hpToKw(s), { decimals: 0 })})` })) },
    { id: 'bottle', type: 'select', default: 10, options: (c) => BOTTLE_SIZES.map((b) => ({ value: b, label: c.sym('mass') === 'lb' ? `${c.fmt(b, { decimals: 1 })} lb` : `${c.fmt(b, { decimals: 1 })} lb (${c.f('mass', b * LB_KG, { decimals: 1 })})` })) },
    { id: 'duration', quantity: 'u:s', default: 3, min: 0.5, max: 30, decimals: 1 },
  ],
  groups: [
    { title: 'g_engine', fields: ['basePower', 'compression', 'octane', 'timing'] },
    { title: 'g_system', fields: ['shot', 'bottle', 'duration'] },
  ],

  compute(v) {
    const r = computeNos({
      baseHp: v.basePower / KW_PER_HP, compressionRatio: v.compression, octane: v.octane, baseTiming: v.timing,
      shotHp: v.shot, bottleLb: v.bottle, shotSeconds: v.duration,
    });
    return { ...r, v };
  },

  results(r, c) {
    const { v } = r;
    const deg = (x) => c.f('u:deg', x, { decimals: 1 }).replace(/\s/g, '');
    return [
      { label: c.t('r.gain'), text: `+${c.f('power', hpToKw(r.actualGain))}`, status: r.powerStatus, note: c.t('r.gain_note', { pct: c.fmt(EFFICIENCY * 100, { decimals: 0 }) }) },
      { label: c.t('r.total'), value: hpToKw(r.totalHp), q: 'power', alt: true, note: `+${c.fmt(r.percentGain, { decimals: 0 })} %` },
      { label: c.t('r.n2o_flow'), value: lbhToGs(r.n2oLbHr), q: 'mass_flow', alt: true },
      { label: c.t('r.ratio'), text: `1 : ${c.fmt(1 / r.fuelN2oRatio, { decimals: 1 })}`,
        note: c.t('r.ratio_note', { fuel: c.f('mass_flow', lbhToGs(r.fuelLbHr)), lambda: c.fmt(TARGET_LAMBDA, { decimals: 2 }) }) },
      { label: c.t('r.retard'), text: deg(r.timingRetard), status: r.timingStatus },
      { label: c.t('r.safe_timing'), text: deg(r.safeTiming), note: `${deg(v.timing)} → ${deg(r.safeTiming)}` },
      { label: c.t('r.shots'), text: c.fmt(r.shots, { decimals: 0 }), status: 'ok', note: c.t('r.shots_note', { d: c.f('u:s', v.duration, { decimals: 1 }) }) },
      { label: c.t('r.total_time'), value: r.totalSeconds, q: 'u:s', decimals: 0, note: c.t('r.minutes', { m: c.fmt(r.totalSeconds / 60, { decimals: 1 }) }) },
      { label: c.t('r.per_shot'), value: r.perShotLb * LB_KG, q: 'mass', decimals: 3 },
      { label: c.t('r.pressure'), text: `+${c.fmt((r.pressureFactor - 1) * 100, { decimals: 0 })} %`, status: r.stress.status,
        note: c.t('r.pressure_note', { x: c.fmt(r.pressureFactor, { decimals: 2 }) }) },
    ];
  },

  notes(r, c) {
    return r.stress.key ? [{ status: r.stress.status, text: c.t(`warn.${r.stress.key}`) }] : [];
  },

  charts(r, c) {
    const curve = bottleCurve(r.v.bottle);
    return [
      {
        title: c.t('chart.power_title'), type: 'bar', legend: false,
        labels: [c.t('chart.base'), 'NOS'],
        yTitle: `${c.t('chart.power_y')} (${c.sym('power')})`,
        datasets: [{ label: c.sym('power'), data: [c.cv('power', r.v.basePower), c.cv('power', hpToKw(r.totalHp))], colors: ['#a78bfa', '#00d4ff'] }],
      },
      {
        title: c.t('chart.bottle_title'),
        labels: curve.map((p) => `${p.shot}`),
        xTitle: c.t('chart.shot_x'),
        yTitle: c.t('chart.shots_y'),
        datasets: [{ label: c.t('chart.shots_y'), data: curve.map((p) => p.shots), fill: true, color: '#4ecdc4' }],
      },
    ];
  },
};
