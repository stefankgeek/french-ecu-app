/** Fiche du simulateur « Efficacité intercooler ». */
import { computeIntercooler, speedCurve, rpmCurve } from './calc.js';

export default {
  id: 'intercooler',
  intro: 'intro',
  inputs: [
    { id: 'displacement', quantity: 'displacement', default: 2000, min: 100, max: 15000 },
    { id: 'rpm', quantity: 'u:rpm', default: 6500, min: 1000, max: 20000, decimals: 0 },
    { id: 've', quantity: 'u:percent', default: 85, min: 40, max: 130, decimals: 0 },
    { id: 'boost', quantity: 'pressure', default: 1.0, min: 0.1, max: 4 },
    { id: 'tIn', quantity: 'temperature', default: 110, min: 30, max: 250, hint: 'tin_hint' },
    { id: 'ambient', quantity: 'temperature', default: 25, min: -30, max: 55 },
    { id: 'type', type: 'select', numeric: false, default: 'air-air', options: (c) => [
      { value: 'air-air', label: c.t('type_air') }, { value: 'air-water', label: c.t('type_water') }] },
    { id: 'coreW', quantity: 'length', default: 600, min: 100, max: 1200, decimals: 0, hint: 'corew_hint' },
    { id: 'coreH', quantity: 'length', default: 300, min: 50, max: 600, decimals: 0 },
    { id: 'coreT', quantity: 'length', default: 76, min: 20, max: 200, decimals: 0 },
    { id: 'fins', default: 14, min: 6, max: 30, decimals: 0, suffix: () => 'FPI' },
    { id: 'pipeD', quantity: 'length', default: 60, min: 30, max: 120, decimals: 0 },
    { id: 'pipeL', quantity: 'length_m', default: 2, min: 0.2, max: 8 },
    { id: 'speed', quantity: 'vehicle_speed', default: 100, min: 0, max: 350 },
    { id: 'fan', type: 'select', numeric: false, default: 'no', options: (c) => [
      { value: 'no', label: c.tc('common.no') }, { value: 'yes', label: c.tc('common.yes') }] },
  ],
  groups: [
    { title: 'g_engine', fields: ['displacement', 'rpm', 've', 'boost', 'tIn', 'ambient'] },
    { title: 'g_core', fields: ['type', 'coreW', 'coreH', 'coreT', 'fins'] },
    { title: 'g_piping', fields: ['pipeD', 'pipeL', 'speed', 'fan'] },
  ],

  compute(v) {
    const inputs = {
      dispL: v.displacement / 1000, rpm: v.rpm, ve: v.ve / 100, boostBar: v.boost, pAtmBar: 1.01325, tInC: v.tIn, tAmbC: v.ambient,
      type: v.type, coreW: v.coreW, coreH: v.coreH, coreT: v.coreT, fins: v.fins, pipeMm: v.pipeD, pipeLenM: v.pipeL, speedKmh: v.speed, fan: v.fan === 'yes',
    };
    return { ...computeIntercooler(inputs), inputs, v };
  },

  results(r, c) {
    const st = { excellent: 'ok', good: 'ok', adequate: 'warn', insufficient: 'danger' }[r.rating];
    return [
      { label: c.t('r.eff'), text: `${c.fmt(r.eff * 100, { decimals: 0 })} %`, status: st, note: c.tc(`rating.${r.rating}`) },
      { label: c.t('r.tout'), value: r.tOutC, q: 'temperature', note: c.t('r.tout_note', { t: c.f('temperature', r.v.tIn) }) },
      { label: c.t('r.drop'), value: r.dropC, q: 'temperature_delta', decimals: 0 },
      { label: c.t('r.dp'), value: r.dpBar, q: 'pressure', status: r.dpBar > 0.2 ? 'danger' : r.dpBar > 0.15 ? 'warn' : 'ok',
        note: c.t('r.dp_note', { core: c.f('pressure', r.dpCoreBar), pipe: c.f('pressure', r.dpPipeBar) }) },
      { label: c.t('r.air'), value: r.massKgS * 1000, q: 'mass_flow', alt: true },
      { label: c.t('r.vpipe'), value: r.vPipe, q: 'flow_velocity', decimals: 0, status: r.vPipe > 60 ? 'warn' : 'ok' },
      { label: c.t('r.gain'), text: `+${c.f('power', r.gainKw)}`, status: 'ok', note: c.t('r.gain_note', { p: c.f('power', r.powerKw) }) },
      { label: c.t('r.loss'), text: `−${c.f('power', r.lossKw)}`, note: c.t('r.loss_note') },
    ];
  },

  notes(r, c) {
    const n = [];
    if (r.dpBar > 0.2) n.push({ status: 'danger', text: c.t('warn.dp_high') });
    if (r.eff < 0.65) n.push({ status: 'warn', text: c.t(r.v.speed < 60 && r.v.type === 'air-air' ? 'warn.low_speed' : 'warn.eff_low') });
    if (r.vPipe > 60) n.push({ status: 'warn', text: c.t('warn.pipe_small') });
    if (r.v.type === 'air-water') n.push({ status: 'info', text: c.t('warn.water_note') });
    return n;
  },

  charts(r, c) {
    const sc = speedCurve(r.inputs);
    const rc = rpmCurve(r.inputs);
    return [
      {
        title: c.t('chart.eff_title'),
        labels: sc.map((p) => c.fmt(c.cv('vehicle_speed', p.s), { decimals: 0 })),
        xTitle: `${c.t('chart.speed')} (${c.sym('vehicle_speed')})`, yTitle: c.t('chart.eff'),
        datasets: [{ label: c.t('chart.eff'), data: sc.map((p) => p.eff * 100), fill: true, color: '#4ecdc4' }],
      },
      {
        title: c.t('chart.dp_title'),
        labels: rc.map((p) => p.rpm),
        xTitle: `${c.t('chart.rpm')} (${c.tc('unit.rpm')})`, yTitle: `${c.t('chart.dp')} (${c.sym('pressure')})`,
        datasets: [{ label: c.t('chart.dp'), data: rc.map((p) => c.cv('pressure', p.dp)), fill: true, color: '#ff6b6b' }],
      },
      {
        title: c.t('chart.balance_title'), type: 'bar', legend: false,
        labels: [c.t('chart.gain'), c.t('chart.loss'), c.t('chart.net')],
        yTitle: `${c.t('chart.power')} (${c.sym('power')})`,
        datasets: [{ label: c.sym('power'), data: [r.gainKw, -r.lossKw, r.netKw].map((x) => c.cv('power', x)), colors: ['#34c759', '#ff6b6b', '#00d4ff'] }],
      },
    ];
  },
};
