/**
 * Fiche du simulateur « Débit pompe & duty cycle ».
 * Débits affichés en grandeur « débit carburant » (L/h, gal/h ou cc/min au choix).
 */
import { computePump, pumpSizes, pipeSizes, MAX_FLOW_VELOCITY } from './calc.js';
import { FUELS, fuelOptions } from '../../data/fuels.js';

const RATING_STATUS = { excellent: 'ok', good: 'ok', adequate: 'warn', insufficient: 'danger' };
const ccToLh = (cc) => cc * 0.06;
const paToBar = (pa) => pa / 1e5;

export default {
  id: 'fuel_pump',
  intro: 'intro',
  inputs: [
    { id: 'injFlow', quantity: 'injector_flow', default: 333, min: 10, max: 10000 },
    { id: 'injectors', default: 4, min: 1, max: 24, decimals: 0 },
    { id: 'fuel', type: 'select', numeric: false, default: 'sp95', options: () => fuelOptions() },
    { id: 'duty', quantity: 'u:percent', default: 80, min: 1, max: 120, decimals: 0 },
    { id: 'pipeD', quantity: 'length', default: 6, min: 1, max: 60 },
    { id: 'pipeL', quantity: 'length_m', default: 5, min: 0, max: 50 },
    { id: 'circuit', type: 'select', numeric: false, default: 'simple', options: (c) => [
      { value: 'simple', label: c.t('circuit_simple') }, { value: 'complex', label: c.t('circuit_complex') }] },
  ],
  groups: [
    { title: 'g_injection', fields: ['injFlow', 'injectors', 'fuel', 'duty'] },
    { title: 'g_line', fields: ['pipeD', 'pipeL', 'circuit'] },
  ],

  compute(v) {
    const r = computePump({
      injFlowCcMin: v.injFlow, injectors: v.injectors, densityKgL: FUELS[v.fuel].density,
      pipeDiameterMm: v.pipeD, pipeLengthM: v.pipeL, circuit: v.circuit, dutyMax: v.duty,
    });
    return { ...r, v };
  },

  results(r, c) {
    const loadStatus = r.loadRatio <= 0.8 ? 'ok' : r.loadRatio <= 1 ? 'warn' : 'danger';
    return [
      { label: c.t('r.pump'), value: r.pumpLh, q: 'fuel_flow', alt: true, status: 'ok', note: c.t('r.pump_note') },
      { label: c.t('r.return'), value: ccToLh(r.returnCcMin), q: 'fuel_flow', note: c.t('r.return_note') },
      { label: c.t('r.pipe_max'), value: ccToLh(r.maxPipeCcMin), q: 'fuel_flow', status: loadStatus,
        note: c.t('r.pipe_max_note', { pct: c.fmt(r.loadRatio * 100, { decimals: 0 }), v: c.f('flow_velocity', MAX_FLOW_VELOCITY) }) },
      { label: c.t('r.velocity'), value: r.velocity, q: 'flow_velocity', status: r.velocity > MAX_FLOW_VELOCITY ? 'danger' : 'ok' },
      { label: c.t('r.loss_pipe'), value: paToBar(r.pipeLossPa), q: 'pressure' },
      { label: c.t('r.loss_circuit'), value: paToBar(r.circuitLossPa), q: 'pressure' },
      { label: c.t('r.loss_pump'), value: paToBar(150000), q: 'pressure', note: c.t('r.loss_pump_note') },
      { label: c.t('r.loss_total'), value: paToBar(r.totalLossPa), q: 'pressure', status: 'warn' },
    ];
  },

  notes(r, c) {
    if (r.loadRatio > 1) return [{ status: 'danger', text: c.t('note.pipe_too_small') }];
    if (r.loadRatio > 0.8) return [{ status: 'warn', text: c.t('note.pipe_limit') }];
    return [];
  },

  tables(r, c) {
    return [
      {
        title: c.t('table.pump_title'),
        columns: [c.t('table.pump'), c.t('table.margin'), c.t('table.rating')],
        rows: pumpSizes(r.pumpLh).map((p) => ({
          cells: [c.f('fuel_flow', p.lh), `${c.fmt(p.margin, { decimals: 1 })} %`, c.tc(`rating.${p.rating}`)],
          status: RATING_STATUS[p.rating], highlight: p.closest,
        })),
      },
      {
        title: c.t('table.pipe_title'),
        intro: c.t('table.pipe_intro', { v: c.f('flow_velocity', MAX_FLOW_VELOCITY) }),
        columns: [c.t('table.diameter'), c.t('table.max_flow'), c.t('table.velocity'), c.t('table.rating')],
        rows: pipeSizes(r.outCcMin).map((p) => ({
          cells: [c.f('length', p.d, { decimals: 0 }), c.f('fuel_flow', ccToLh(p.max)), c.f('flow_velocity', p.velocity), c.tc(`rating.${p.rating}`)],
          status: RATING_STATUS[p.rating], highlight: p.closest,
        })),
      },
    ];
  },

  charts(r, c) {
    const pts = r.curve.filter((p) => p.duty > 0);
    const ff = (cc) => c.cv('fuel_flow', ccToLh(cc));
    const pr = (pa) => c.cv('pressure', paToBar(pa));
    return [
      {
        title: c.t('chart.flows_title'),
        labels: pts.map((p) => p.duty),
        xTitle: c.t('chart.duty_x'),
        yTitle: `${c.t('chart.flow_y')} (${c.sym('fuel_flow')})`,
        yLog: true, points: false,
        datasets: [
          { label: c.t('chart.ds_out'), data: pts.map((p) => ff(p.out)) },
          { label: c.t('chart.ds_inj'), data: pts.map((p) => ff(p.injectors)), color: '#34c759', dashed: true },
          { label: c.t('chart.ds_ret'), data: pts.map((p) => ff(p.ret)), color: '#feca57', dashed: true },
          { label: c.t('chart.ds_max'), data: pts.map(() => ff(r.maxPipeCcMin)), color: '#ff6b6b' },
        ],
      },
      {
        title: c.t('chart.loss_title'),
        labels: pts.map((p) => p.duty),
        xTitle: c.t('chart.duty_x'),
        yTitle: `${c.t('chart.loss_y')} (${c.sym('pressure')})`,
        yLog: true, points: false,
        datasets: [
          { label: c.t('chart.ds_pipe'), data: pts.map((p) => pr(p.pipeLoss)), color: '#4a90e2' },
          { label: c.t('chart.ds_circuit'), data: pts.map((p) => pr(p.circuitLoss)), color: '#ff9f0a' },
          { label: c.t('chart.ds_pump'), data: pts.map((p) => pr(p.pumpLoss)), color: '#a78bfa', dashed: true },
          { label: c.t('chart.ds_total'), data: pts.map((p) => pr(p.totalLoss)), color: '#ff6b6b' },
        ],
      },
    ];
  },
};
