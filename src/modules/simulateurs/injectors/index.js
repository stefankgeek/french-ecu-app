/**
 * Fiche du simulateur « Calculateur injecteurs ».
 * Valeurs internes en unités de base (cm³, kW, g/kWh, bar…), converties vers les unités
 * des formules d'origine (L, hp, lb/hp·h) juste avant le calcul.
 */
import { computeInjectors, injectorSizes, pressureCurve, velocityCurve, AIR_VELOCITY_INTAKE, AIR_VELOCITY_THROTTLE } from './calc.js';
import { FUELS, fuelName, fuelOptions } from '../../data/fuels.js';
import { toBase, fromBase } from '../../../core/units-core.js';

const KW_PER_HP = 0.745699872;
const bsfcBase = (fuel) => toBase('bsfc', FUELS[fuel].bsfc, 'lbhph');

export default {
  id: 'injectors',
  intro: 'intro',
  inputs: [
    { id: 'cylinders', type: 'select', default: 4, options: (c) => [3, 4, 5, 6, 8, 10, 12].map((n) => ({ value: n, label: c.tc('common.cylinders', { count: n }) })) },
    { id: 'displacement', quantity: 'displacement', default: 2000, min: 100, max: 15000 },
    { id: 'power', quantity: 'power', default: 200 * 0.73549875, min: 10, max: 2500 },
    { id: 'rpm', quantity: 'u:rpm', default: 6500, min: 1000, max: 20000, decimals: 0 },
    { id: 'fuel', type: 'select', numeric: false, default: 'sp95', options: () => fuelOptions() },
    { id: 'bsfc', quantity: 'bsfc', default: bsfcBase('sp95'), min: 150, max: 1000 },
    { id: 'rail', quantity: 'pressure', default: 3, min: 0.5, max: 10 },
    { id: 'duty', quantity: 'u:percent', default: 80, min: 30, max: 100, decimals: 0 },
    { id: 'intake', quantity: 'pressure_abs', default: 1, min: 0.3, max: 5 },
    { id: 've', quantity: 'u:percent', default: 85, min: 40, max: 130, decimals: 0 },
    { id: 'airTemp', quantity: 'temperature', default: 20, min: -40, max: 120 },
    { id: 'throttle', quantity: 'u:percent', default: 100, min: 5, max: 100, decimals: 0 },
    { id: 'tofi', quantity: 'u:ms', default: 1, min: 0, max: 5, decimals: 2 },
    { id: 'fuelA', type: 'select', numeric: false, default: 'sp95', options: () => fuelOptions() },
    { id: 'fuelB', type: 'select', numeric: false, default: 'sp98', options: () => fuelOptions() },
  ],
  groups: [
    { title: 'g_engine', fields: ['cylinders', 'displacement', 'power', 'rpm'] },
    { title: 'g_fuel', fields: ['fuel', 'bsfc', 'rail', 'duty', 'tofi'] },
    { title: 'g_conditions', fields: ['intake', 've', 'airTemp', 'throttle'] },
    { title: 'g_compare', fields: ['fuelA', 'fuelB'] },
  ],

  /** Choisir un carburant remplit sa consommation spécifique (BSFC). */
  onChange(id, v) {
    if (id === 'fuel') return { bsfc: bsfcBase(v.fuel) };
    return null;
  },

  compute(v) {
    const inputs = {
      cylinders: v.cylinders,
      displacementL: v.displacement / 1000,
      powerHp: v.power / KW_PER_HP,
      rpm: v.rpm,
      bsfc: fromBase('bsfc', v.bsfc, 'lbhph'),
      railBar: v.rail,
      duty: v.duty / 100,
      intakeBarA: v.intake,
      ve: v.ve / 100,
      airTempC: v.airTemp,
      throttle: v.throttle / 100,
      tofi: v.tofi,
    };
    return { ...computeInjectors(inputs), inputs, v };
  },

  results(r, c) {
    const { v } = r;
    return [
      { label: c.t('r.flow'), value: r.flowCcMin, q: 'injector_flow', alt: true, status: 'ok' },
      { label: c.t('r.injtime'), value: r.injectionMs, q: 'u:ms', decimals: 2, note: c.t('r.injtime_note', { tofi: c.f('u:ms', v.tofi) }) },
      { label: c.t('r.airflow'), value: r.airFlowLMin / 1000, q: 'air_flow', note: c.t('r.airflow_note', { rpm: c.f('u:rpm', v.rpm, { decimals: 0 }), ve: c.fmt(v.ve, { decimals: 0 }) }) },
      { label: c.t('r.intake_d'), value: r.intakeDiameterMm, q: 'length', decimals: 1, note: c.t('r.velocity_note', { v: c.f('flow_velocity', AIR_VELOCITY_INTAKE, { decimals: 0 }) }) },
      { label: c.t('r.throttle_d'), value: r.throttleDiameterMm, q: 'length', decimals: 1, note: c.t('r.throttle_note', { cyl: c.tc('common.cylinders', { count: v.cylinders }), v: c.f('flow_velocity', AIR_VELOCITY_THROTTLE, { decimals: 0 }) }) },
      { label: c.t('r.margin'), value: r.safetyMargin, q: 'u:percent', decimals: 1, status: r.safetyMargin < 10 ? 'danger' : r.safetyMargin < 20 ? 'warn' : 'ok',
        note: c.t('r.margin_note', { duty: c.fmt(v.duty, { decimals: 0 }), p: c.f('pressure', v.rail) }) },
      { label: c.t('r.corr'), wide: true, text: c.t('r.corr_text', { p: c.fmt(r.pressureCorrection, { decimals: 2 }), t: c.fmt(r.tempCorrectionAir, { decimals: 2 }), th: c.fmt(v.throttle, { decimals: 0 }) }) },
    ];
  },

  tables(r, c) {
    const { v } = r;
    const A = FUELS[v.fuelA];
    const B = FUELS[v.fuelB];
    const row = (label, a, b) => ({ cells: [label, a, b] });
    return [
      {
        title: c.t('table.inj_title'),
        intro: c.t('table.inj_intro'),
        columns: [c.t('table.size'), c.t('table.duty'), c.t('table.margin'), c.t('table.rating')],
        rows: injectorSizes(r.flowCcMin).map((s) => ({
          cells: [c.f('injector_flow', s.size), `${c.fmt(s.duty, { decimals: 1 })} %`, `${c.fmt(s.margin, { decimals: 1 })} %`, c.tc(`rating.${s.rating}`)],
          status: { excellent: 'ok', good: 'ok', adequate: 'warn', insufficient: 'danger' }[s.rating],
          highlight: s.closest,
        })),
      },
      {
        title: c.t('table.fuel_title'),
        intro: c.t('table.fuel_best', { name: fuelName(A.ron >= B.ron ? v.fuelA : v.fuelB) }),
        columns: ['', fuelName(v.fuelA), fuelName(v.fuelB)],
        rows: [
          row('RON', String(A.ron), String(B.ron)),
          row('MON', String(A.mon), String(B.mon)),
          row('BSFC', c.f('bsfc', toBase('bsfc', A.bsfc, 'lbhph')), c.f('bsfc', toBase('bsfc', B.bsfc, 'lbhph'))),
          row(c.t('table.ethanol'), `${A.ethanol} %`, `${B.ethanol} %`),
          row(c.t('table.density'), `${c.fmt(A.density, { decimals: 2 })} kg/L`, `${c.fmt(B.density, { decimals: 2 })} kg/L`),
          row(c.t('table.afr'), c.fmt(A.afr, { decimals: 1 }), c.fmt(B.afr, { decimals: 1 })),
        ],
      },
    ];
  },

  charts(r, c) {
    const pc = pressureCurve(r.flowCcMin, r.inputs.railBar, r.inputs.intakeBarA);
    const vc = velocityCurve();
    return [
      {
        title: c.t('chart.pressure_title'),
        type: 'line',
        labels: pc.map((p) => c.fmt(c.cv('pressure', p.p), { decimals: 1 })),
        xTitle: `${c.t('chart.pressure_x')} (${c.sym('pressure')})`,
        yTitle: `${c.t('chart.flow_y')} (${c.sym('injector_flow')})`,
        datasets: [
          { label: c.t('chart.ds_flow'), data: pc.map((p) => c.cv('injector_flow', p.flow)), fill: true },
          { label: c.t('chart.ds_boost', { p: c.f('pressure_abs', r.inputs.intakeBarA) }), data: pc.map((p) => c.cv('injector_flow', p.boosted)), dashed: true, color: '#4ecdc4' },
        ],
      },
      {
        title: c.t('chart.velocity_title'),
        type: 'line',
        labels: vc.map((p) => p.pos),
        xTitle: c.t('chart.velocity_x'),
        yTitle: `${c.t('chart.velocity_y')} (${c.sym('flow_velocity')})`,
        datasets: [
          { label: c.t('chart.ds_air'), data: vc.map((p) => c.cv('flow_velocity', p.air)), fill: true, color: '#feca57' },
          { label: c.t('chart.ds_fuel'), data: vc.map((p) => c.cv('flow_velocity', p.fuel)), dashed: true, color: '#ff6b6b' },
        ],
      },
    ];
  },
};
