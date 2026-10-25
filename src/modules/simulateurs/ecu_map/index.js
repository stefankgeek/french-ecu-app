/** Fiche « Générateur de cartographies » (calculateur programmable). */
import { computeEcuMap, ECUS, heatColor, tableCsv, curveCsv } from './calc.js';
import { FUELS, fuelOptions } from '../../data/fuels.js';

const SIZES = [8, 12, 16, 20, 24, 32];
const SPARK_FUELS = Object.keys(FUELS).filter((k) => FUELS[k].category !== 'diesel');
const LAMBDA_PRESET = (fuel) => (FUELS[fuel].ethanol >= 50 || FUELS[fuel].category === 'methanol'
  ? { lambdaWot: 0.82, lambdaBoost: 0.78 } : { lambdaWot: 0.88, lambdaBoost: 0.8 });

/** Table colorée (régime en lignes, pression en colonnes). */
function gridTable(title, intro, r, values, decimals, c) {
  const flat = values.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  return {
    title, intro, grid: true,
    columns: [`${c.tc('unit.rpm')} \\ kPa`, ...r.kpa.map(String)],
    rows: r.rpm.map((n, a) => ({ cells: [String(n), ...values[a].map((v) => ({ v: c.fmt(v, { decimals, min: decimals }), bg: heatColor(v, min, max) }))] })),
  };
}
/** Courbe 1D présentée en tableau horizontal. */
function curveTable(title, intro, pts, xLabel, yLabel, decimals, c) {
  return {
    title, intro, grid: true,
    columns: [xLabel, ...pts.map((p) => c.fmt(p.x, { decimals: 0 }))],
    rows: [{ cells: [yLabel, ...pts.map((p) => ({ v: c.fmt(p.y, { decimals, min: decimals }), bg: '#dfe9f5' }))] }],
  };
}

export default {
  id: 'ecu_map',
  intro: 'intro',
  inputs: [
    { id: 'ecu', type: 'select', numeric: false, default: 'maxxecu', options: (c) => Object.entries(ECUS).map(([k, e]) => ({ value: k, label: k === 'generic' ? c.t('generic') : e.name })) },
    { id: 'rpmPoints', type: 'select', default: 16, options: () => SIZES.map((n) => ({ value: n, label: String(n) })) },
    { id: 'loadPoints', type: 'select', default: 16, options: () => SIZES.map((n) => ({ value: n, label: String(n) })) },
    { id: 'idleRpm', quantity: 'u:rpm', default: 800, min: 400, max: 2000, decimals: 0 },
    { id: 'rpmLimit', quantity: 'u:rpm', default: 7000, min: 3000, max: 20000, decimals: 0 },
    { id: 'displacement', quantity: 'displacement', default: 2000, min: 50, max: 15000 },
    { id: 'cylinders', default: 4, min: 1, max: 16, decimals: 0 },
    { id: 'cr', default: 9.5, min: 6, max: 16, decimals: 1, suffix: () => ':1' },
    { id: 'boost', quantity: 'pressure', default: 1.0, min: 0, max: 4, hint: 'boost_hint' },
    { id: 'veMax', quantity: 'u:percent', default: 95, min: 60, max: 120, decimals: 0, hint: 've_hint' },
    { id: 'injector', quantity: 'injector_flow', default: 550, min: 50, max: 5000, hint: 'injector_hint' },
    { id: 'fuelPressure', quantity: 'pressure', default: 3.5, min: 1, max: 10 },
    { id: 'deadtime', quantity: 'u:ms', default: 1.0, min: 0.2, max: 3, decimals: 2, hint: 'deadtime_hint' },
    { id: 'fuel', type: 'select', numeric: false, default: 'sp98', options: () => fuelOptions(SPARK_FUELS) },
    { id: 'lambdaCruise', quantity: 'u:lambda', default: 1.0, min: 0.7, max: 1.2, decimals: 2 },
    { id: 'lambdaWot', quantity: 'u:lambda', default: 0.88, min: 0.65, max: 1.0, decimals: 2 },
    { id: 'lambdaBoost', quantity: 'u:lambda', default: 0.8, min: 0.65, max: 1.0, decimals: 2 },
    { id: 'offset', quantity: 'u:deg', default: 0, min: -10, max: 10, decimals: 1, hint: 'offset_hint' },
  ],
  groups: [
    { title: 'g_ecu', fields: ['ecu', 'rpmPoints', 'loadPoints', 'idleRpm', 'rpmLimit'] },
    { title: 'g_engine', fields: ['displacement', 'cylinders', 'cr', 'boost', 'veMax'] },
    { title: 'g_fuel', fields: ['injector', 'fuelPressure', 'deadtime', 'fuel', 'lambdaCruise', 'lambdaWot', 'lambdaBoost'] },
    { title: 'g_ignition', fields: ['offset'] },
  ],

  /** Choisir l'éthanol ou le méthanol propose des richesses adaptées. */
  onChange(id, v) {
    if (id === 'fuel') return LAMBDA_PRESET(v.fuel);
    return null;
  },

  compute(v) {
    const inputs = { rpmPoints: v.rpmPoints, loadPoints: v.loadPoints, idleRpm: v.idleRpm, rpmLimit: Math.max(v.rpmLimit, v.idleRpm + 1000),
      displacementCc: v.displacement, cylinders: v.cylinders, cr: v.cr, boostBar: v.boost, veMax: v.veMax, injectorCc: v.injector,
      fuelBar: v.fuelPressure, deadtime: v.deadtime, fuel: v.fuel, lambdaCruise: v.lambdaCruise, lambdaWot: v.lambdaWot,
      lambdaBoost: v.lambdaBoost, offset: v.offset };
    return { ...computeEcuMap(inputs), inputs, v };
  },

  results(r, c) {
    const ecu = ECUS[r.v.ecu];
    const dutySt = r.duty > 85 ? 'danger' : r.duty > 80 ? 'warn' : 'ok';
    return [
      { label: c.t('r.ecu'), text: r.v.ecu === 'generic' ? c.t('generic') : ecu.name, note: ecu.software ? c.t('r.ecu_note', { s: ecu.software }) : c.t('r.generic_note') },
      { label: c.t('r.size'), text: `${r.rpm.length} × ${r.kpa.length}`, note: c.t('r.size_note', { a: r.rpm[0], b: r.rpm[r.rpm.length - 1], p: r.kpa[0], q: r.kpa[r.kpa.length - 1] }) },
      { label: c.t('r.duty'), text: `${c.fmt(r.duty, { decimals: 0 })} %`, status: dutySt, note: c.t('r.duty_note', { rpm: c.f('u:rpm', r.inputs.rpmLimit, { decimals: 0 }), p: c.fmt(r.pTop, { decimals: 0 }) }) },
      { label: c.t('r.required'), value: r.requiredCc, q: 'injector_flow', alt: true, opts: { density: r.fuelProps.density }, note: c.t('r.required_note') },
      { label: c.t('r.maxpw'), value: r.maxPw, q: 'u:ms', decimals: 2, note: c.t('r.maxpw_note', { c: c.f('u:ms', r.cycleMs, { decimals: 1 }) }) },
      { label: c.t('r.idle'), value: r.idleFuelMs, q: 'u:ms', decimals: 2, status: r.idleFuelMs < 0.8 ? 'warn' : 'ok', note: c.t('r.idle_note') },
      { label: c.t('r.flow'), value: r.flowCcMin, q: 'injector_flow', opts: { density: r.fuelProps.density }, note: c.t('r.flow_note', { p: c.f('pressure', r.v.fuelPressure) }) },
      { label: c.t('r.air'), value: r.airGsMax, q: 'mass_flow', alt: true },
    ];
  },

  notes(r, c) {
    const n = [{ status: 'warn', text: c.t('warn.start_map') }];
    if (r.duty > 85) n.push({ status: 'danger', text: c.t('warn.duty_high') });
    else if (r.duty > 80) n.push({ status: 'warn', text: c.t('warn.duty_limit') });
    if (r.idleFuelMs < 0.8) n.push({ status: 'warn', text: c.t('warn.injector_big') });
    if (r.v.lambdaWot >= r.v.lambdaCruise) n.push({ status: 'danger', text: c.t('warn.lambda_order') });
    if (r.v.boost > 0 && r.v.lambdaBoost > 0.86) n.push({ status: 'warn', text: c.t('warn.lambda_boost') });
    if (r.v.ecu !== 'generic') n.push({ status: 'info', text: c.t('warn.import', { s: ECUS[r.v.ecu].software }) });
    n.push({ status: 'info', text: c.t('warn.deadtime') });
    return n;
  },

  tables(r, c) {
    const C = r.curves;
    return [
      gridTable(c.t('t.fuel'), c.t('t.fuel_intro'), r, r.fuelTable, 2, c),
      gridTable(c.t('t.ign'), c.t('t.ign_intro'), r, r.ignTable, 1, c),
      gridTable(c.t('t.ve'), c.t('t.ve_intro'), r, r.veTable, 0, c),
      gridTable(c.t('t.lambda'), c.t('t.lambda_intro'), r, r.lambdaTable, 2, c),
      curveTable(c.t('t.deadtime'), c.t('t.deadtime_intro'), C.deadtimeCurve, 'V', 'ms', 2, c),
      curveTable(c.t('t.warmup'), c.t('t.warmup_intro'), C.warmup, c.t('t.ect'), '×', 2, c),
      curveTable(c.t('t.cranking'), c.t('t.cranking_intro'), C.cranking, c.t('t.ect'), 'ms', 2, c),
      curveTable(c.t('t.idle'), c.t('t.idle_intro'), C.idle, c.t('t.ect'), `+${c.tc('unit.rpm')}`, 0, c),
      curveTable(c.t('t.accel'), c.t('t.accel_intro'), C.accel, c.t('t.tps_rate'), '+%', 0, c),
      curveTable(c.t('t.iat'), c.t('t.iat_intro'), C.iat, c.t('t.iat_x'), '×', 3, c),
      curveTable(c.t('t.baro'), c.t('t.baro_intro'), C.baro, 'kPa', '×', 3, c),
    ];
  },

  charts(r, c) {
    const pick = [...new Set([0.25, 0.5, 0.75, 1].map((f) => Math.round(f * (r.kpa.length - 1))))];
    const colors = ['#4a90e2', '#34c759', '#ff9f0a', '#ff453a'];
    const ds = (table) => pick.map((j, k) => ({ label: `${r.kpa[j]} kPa`, data: r.rpm.map((_, a) => table[a][j]), color: colors[k] }));
    return [
      { title: c.t('chart.fuel_title'), type: 'line', labels: r.rpm.map(String), xTitle: c.tc('unit.rpm'), yTitle: `${c.t('chart.pw')} (ms)`, datasets: ds(r.fuelTable) },
      { title: c.t('chart.ign_title'), type: 'line', labels: r.rpm.map(String), xTitle: c.tc('unit.rpm'), yTitle: `${c.t('chart.adv')} (°)`, datasets: ds(r.ignTable) },
    ];
  },

  downloads(r, c) {
    const base = `french-ecu-${r.v.ecu}-${r.rpm.length}x${r.kpa.length}`;
    const C = r.curves;
    return [
      {
        label: c.t('dl.zip'),
        filename: `${base}.zip`,
        build: async () => {
          const { zipBlob } = await import('../../../core/zip.js');
          const ecu = ECUS[r.v.ecu];
          return zipBlob([
            { name: 'fuel_ms.csv', content: tableCsv(r.rpm, r.kpa, r.fuelTable, 3) },
            { name: 'ignition_deg.csv', content: tableCsv(r.rpm, r.kpa, r.ignTable, 1) },
            { name: 've_percent.csv', content: tableCsv(r.rpm, r.kpa, r.veTable, 1) },
            { name: 'lambda_target.csv', content: tableCsv(r.rpm, r.kpa, r.lambdaTable, 3) },
            { name: 'injector_deadtime.csv', content: curveCsv(C.deadtimeCurve, 'volt', 'ms', 3) },
            { name: 'warmup_enrichment.csv', content: curveCsv(C.warmup, 'ect_c', 'multiplier', 3) },
            { name: 'cranking_pw.csv', content: curveCsv(C.cranking, 'ect_c', 'ms', 2) },
            { name: 'idle_rpm_offset.csv', content: curveCsv(C.idle, 'ect_c', 'rpm', 0) },
            { name: 'accel_enrichment.csv', content: curveCsv(C.accel, 'tps_rate', 'percent', 0) },
            { name: 'iat_correction.csv', content: curveCsv(C.iat, 'iat_c', 'multiplier', 3) },
            { name: 'baro_correction_alpha_n.csv', content: curveCsv(C.baro, 'baro_kpa', 'multiplier', 3) },
            { name: 'README.txt', content: `French ECU — ${c.tc('modules.ecu_map.title')}\r\n\r\n${c.t('readme', { ecu: r.v.ecu === 'generic' ? c.t('generic') : ecu.name, s: ecu.software || '—' })}\r\n` },
          ]);
        },
      },
      {
        label: c.t('dl.json'),
        filename: `${base}.json`,
        build: async () => new Blob([JSON.stringify({
          generator: 'French ECU', ecu: r.v.ecu, inputs: r.v, rpm_axis: r.rpm, map_kpa_axis: r.kpa,
          fuel_ms: r.fuelTable, ignition_deg: r.ignTable, ve_percent: r.veTable, lambda_target: r.lambdaTable, curves: r.curves,
        }, (k, x) => (typeof x === 'number' ? Math.round(x * 1000) / 1000 : x), 2)], { type: 'application/json' }),
      },
    ];
  },
};
