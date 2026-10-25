/** Fiche du simulateur « Conversion E85 ». */
import { computeE85, FUEL_PROPERTIES, COOLING_C, PRACTICAL_INCREASE } from './calc.js';
import { CURRENCIES, defaultCurrency, currencySymbol, money } from '../../../core/money.js';

export default {
  id: 'e85',
  intro: 'intro',
  inputs: [
    { id: 'fuel', type: 'select', numeric: false, default: 'sp95', options: () => ['sp95', 'sp98', 'e10'].map((k) => ({ value: k, label: FUEL_PROPERTIES[k].name })) },
    { id: 'injectors', quantity: 'injector_flow', default: 440, min: 50, max: 5000 },
    { id: 'rail', quantity: 'pressure', default: 3, min: 0.5, max: 10 },
    { id: 'power', quantity: 'power', default: 300 * 0.73549875, min: 10, max: 2500 },
    { id: 'boost', quantity: 'pressure', default: 0, min: 0, max: 5, hint: 'boost_hint' },
    { id: 'consumption', quantity: 'fuel_economy', default: 8, min: 2, max: 40 },
    { id: 'distance', quantity: 'distance', default: 20000, min: 100, max: 300000 },
    { id: 'currency', type: 'select', numeric: false, default: defaultCurrency(), options: () => CURRENCIES.map((c) => ({ value: c, label: `${c} (${currencySymbol(c)})` })) },
    { id: 'priceFuel', quantity: 'price_volume', default: 1.85, min: 0.01, max: 50, labelParams: (c) => ({ cur: currencySymbol(c.values.currency) }) },
    { id: 'priceE85', quantity: 'price_volume', default: 1.1, min: 0.01, max: 50, labelParams: (c) => ({ cur: currencySymbol(c.values.currency) }) },
    { id: 'conversionCost', default: 1200, min: 0, max: 100000, decimals: 0, suffix: (c) => currencySymbol(c.values.currency) },
  ],
  groups: [
    { title: 'g_engine', fields: ['fuel', 'injectors', 'rail', 'power', 'boost'] },
    { title: 'g_usage', fields: ['consumption', 'distance', 'currency', 'priceFuel', 'priceE85', 'conversionCost'] },
  ],

  /** La devise change les libellés des prix : on redessine. */
  onChange(id) { return id === 'currency' ? { __rerender: true } : null; },

  compute(v) {
    return { ...computeE85({
      fuel: v.fuel, injCcMin: v.injectors, railBar: v.rail, power: v.power, boostBar: v.boost,
      l100: v.consumption, kmYear: v.distance, priceFuel: v.priceFuel, priceE85: v.priceE85, conversionCost: v.conversionCost,
    }), v };
  },

  results(r, c) {
    const { v } = r;
    const m = (x) => money(x, v.currency);
    return [
      { label: c.t('r.injectors'), value: r.newInjector, q: 'injector_flow', alt: true, status: r.injectorStatus,
        note: c.t('r.injectors_note', { pct: c.fmt((r.afrRatio - 1) * 100, { decimals: 0 }) }) },
      r.changeInjectors
        ? { label: c.t('r.pressure'), text: c.t('r.change_injectors'), status: 'warn', note: c.t('r.pressure_note', { p: c.f('pressure', r.newPressure) }) }
        : { label: c.t('r.pressure'), value: r.newPressure, q: 'pressure', note: c.t('r.pressure_keep') },
      { label: c.t('r.power_gain'), text: `+${c.f('power', r.powerGain)}`, status: 'ok',
        note: `${c.f('power', v.power)} → ${c.f('power', r.newPower)} (+${c.fmt(r.totalGain * 100, { decimals: 1 })} %)` },
      { label: c.t('r.consumption'), value: r.l100E85, q: 'fuel_economy', note: c.t('r.consumption_note', { pct: c.fmt((PRACTICAL_INCREASE - 1) * 100, { decimals: 0 }) }) },
      { label: c.t('r.savings'), text: `${m(r.savings)}${c.tc('unit.per_year')}`, status: r.savings > 0 ? 'ok' : 'danger',
        note: `${r.savings > 0 ? '−' : '+'}${c.fmt(Math.abs(r.savingsPct), { decimals: 0 })} % (${m(r.costFuel)} → ${m(r.costE85)})` },
      { label: c.t('r.roi'), text: Number.isFinite(r.roiMonths) ? `${c.fmt(r.roiMonths, { decimals: 1 })} ${c.tc('unit.months')}` : '—',
        status: Number.isFinite(r.roiMonths) ? r.roiStatus : 'danger',
        note: Number.isFinite(r.roiMonths) ? `${m(v.conversionCost)} ÷ ${m(r.savings / 12)}` : c.t('r.roi_never') },
      { label: c.t('r.details'), wide: true, text: c.t('r.details_text', {
        afr: c.fmt(r.cur.afr, { decimals: 1 }), afr85: c.fmt(9.8, { decimals: 1 }), ron: r.cur.octane, ron85: 104, cool: c.f('temperature_delta', COOLING_C, { decimals: 0 }) }) },
    ];
  },

  charts(r, c) {
    const { v } = r;
    return [
      {
        title: c.t('chart.economy_title'), type: 'bar', legend: false,
        labels: [FUEL_PROPERTIES[v.fuel].name, 'E85', c.t('chart.savings')],
        yTitle: `${currencySymbol(v.currency)} ${c.tc('unit.per_year')}`,
        datasets: [{ label: currencySymbol(v.currency), data: [r.costFuel, r.costE85, r.savings], colors: ['#ff6b6b', '#4ecdc4', '#00d4ff'] }],
      },
      {
        title: c.t('chart.power_title'), type: 'bar', legend: false,
        labels: [FUEL_PROPERTIES[v.fuel].name, 'E85'],
        yTitle: `${c.t('chart.power_y')} (${c.sym('power')})`,
        datasets: [{ label: c.sym('power'), data: [c.cv('power', v.power), c.cv('power', r.newPower)], colors: ['#a78bfa', '#4ecdc4'] }],
      },
    ];
  },
};
