/** Fiche du simulateur « Lambda / AFR » (conversion dans les deux sens). */
import { FUEL_PROPERTIES, TARGETS, lambdaToAfr, afrToLambda, mixtureStatus, correction } from './calc.js';

export default {
  id: 'lambda',
  intro: 'intro',
  inputs: [
    { id: 'fuel', type: 'select', numeric: false, default: 'sp95', options: () => Object.entries(FUEL_PROPERTIES).map(([k, f]) => ({ value: k, label: f.name })) },
    { id: 'lambda', default: 1, min: 0.5, max: 1.6, decimals: 3, suffix: () => 'λ' },
    { id: 'afr', default: 14.7, min: 4, max: 25, decimals: 2, suffix: () => 'AFR' },
    { id: 'usage', type: 'select', numeric: false, default: 'wot_turbo', options: (c) => Object.keys(TARGETS).map((k) => ({ value: k, label: c.t(`usage.${k}`) })) },
    { id: 'currentAfr', default: 13.5, min: 4, max: 25, decimals: 2, suffix: () => 'AFR' },
    { id: 'targetAfr', default: 12, min: 4, max: 25, decimals: 2, suffix: () => 'AFR' },
  ],
  groups: [
    { title: 'g_convert', fields: ['fuel', 'lambda', 'afr'] },
    { title: 'g_target', fields: ['usage'] },
    { title: 'g_correction', fields: ['currentAfr', 'targetAfr'] },
  ],

  /** Lambda ↔ AFR restent synchronisés. */
  onChange(id, v) {
    if (id === 'lambda' || id === 'fuel') return { afr: lambdaToAfr(v.lambda, v.fuel) };
    if (id === 'afr') return { lambda: afrToLambda(v.afr, v.fuel) };
    return null;
  },

  compute(v) {
    const mix = mixtureStatus(v.lambda);
    const targetLambda = TARGETS[v.usage];
    return { v, mix, targetLambda, targetAfr: lambdaToAfr(targetLambda, v.fuel), corr: correction(v.currentAfr, v.targetAfr, v.fuel) };
  },

  results(r, c) {
    const { v, corr } = r;
    return [
      { label: c.t('r.status'), text: c.t(`mix.${r.mix.key}`), status: r.mix.status,
        note: `λ = ${c.fmt(v.lambda, { decimals: 3 })} · AFR = ${c.fmt(v.afr, { decimals: 2 })}` },
      { label: c.t('r.target_lambda'), text: c.fmt(r.targetLambda, { decimals: 2, min: 2 }), note: c.t(`usage.${v.usage}`) },
      { label: c.t('r.target_afr'), text: c.fmt(r.targetAfr, { decimals: 2, min: 2 }), note: FUEL_PROPERTIES[v.fuel].name },
      { label: c.t('r.correction'), text: `${c.fmt(Math.abs(corr.pct), { decimals: 1 })} %`, status: corr.status,
        note: c.t('r.action', { a: c.t(`action.${corr.action}`) }) },
      { label: c.t('r.egt'), value: corr.egt, q: 'temperature', decimals: 0, status: corr.egtStatus, note: c.t(`egt.${corr.egtKey}`) },
    ];
  },

  tables(r, c) {
    return [{
      title: c.t('table.title'),
      columns: [c.t('table.fuel'), c.t('table.afr'), c.t('table.octane'), c.t('table.ethanol'), c.t('table.energy')],
      rows: Object.entries(FUEL_PROPERTIES).map(([k, f]) => ({
        cells: [f.name, c.fmt(f.afr, { decimals: 1 }), `${f.octane} RON`, `${f.ethanol} %`, `${c.fmt(f.energy, { decimals: 1 })} MJ/L`],
        highlight: k === r.v.fuel,
      })),
    }];
  },
};
