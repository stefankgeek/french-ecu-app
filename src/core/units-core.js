/**
 * Conversions d'unités — fonctions pures (testables).
 *
 * PRINCIPE : les formules des simulateurs travaillent TOUJOURS en métrique (unité "base").
 * Conversion uniquement à l'entrée (saisie → base) et à la sortie (base → affichage).
 * On ne modifie donc jamais une formule pour gérer l'impérial.
 *
 * Points sensibles traités ici :
 *  - Température ≠ écart de température (20 °C = 68 °F, mais un écart de 20 °C = 36 °F).
 *  - Pression relative (bar / psig) ≠ pression absolue (bar a / psia) : deux grandeurs distinctes.
 *  - Débit injecteur cc/min ↔ lb/h dépend de la densité du carburant (paramètre).
 *  - Pas d'arrondi pendant les conversions : arrondi uniquement à l'affichage.
 */

const lin = (factor, offset = 0) => ({
  toBase: (v) => v * factor + offset,
  fromBase: (v) => (v - offset) / factor,
});

/** Densité essence de référence (g/cm³) → 1 lb/h ≈ 10,5 cc/min (valeur standard de l'industrie). */
export const DEFAULT_FUEL_DENSITY = 0.72;
const LB_G = 453.59237;

/**
 * Grandeurs physiques. Pour chaque grandeur : unité de base (métrique) + unités disponibles.
 * `symbol` : clé de traduction du symbole (certaines langues l'écrivent différemment).
 */
export const QUANTITIES = {
  pressure: { base: 'bar', units: {
    bar: { ...lin(1), symbol: 'bar', decimals: 2 },
    psi: { ...lin(0.0689475729), symbol: 'psi', decimals: 1 },
    kPa: { ...lin(0.01), symbol: 'kPa', decimals: 0 },
  } },
  pressure_abs: { base: 'bara', units: {
    bara: { ...lin(1), symbol: 'bar a', decimals: 2 },
    psia: { ...lin(0.0689475729), symbol: 'psia', decimals: 1 },
    kPaa: { ...lin(0.01), symbol: 'kPa a', decimals: 0 },
  } },
  temperature: { base: 'C', units: {
    C: { ...lin(1), symbol: '°C', decimals: 0 },
    F: { toBase: (v) => (v - 32) / 1.8, fromBase: (v) => v * 1.8 + 32, symbol: '°F', decimals: 0 },
    K: { ...lin(1, -273.15), symbol: 'K', decimals: 0 },
  } },
  temperature_delta: { base: 'dC', units: {
    dC: { ...lin(1), symbol: '°C', decimals: 1 },
    dF: { ...lin(1 / 1.8), symbol: '°F', decimals: 1 },
    dK: { ...lin(1), symbol: 'K', decimals: 1 },
  } },
  length: { base: 'mm', units: {
    mm: { ...lin(1), symbol: 'mm', decimals: 2 },
    in: { ...lin(25.4), symbol: 'in', decimals: 3 },
  } },
  displacement: { base: 'cc', units: {
    cc: { ...lin(1), symbol: 'cm³', decimals: 0 },
    L: { ...lin(1000), symbol: 'L', decimals: 2 },
    ci: { ...lin(16.387064), symbol: 'ci', decimals: 1 },
  } },
  volume: { base: 'L', units: {
    L: { ...lin(1), symbol: 'L', decimals: 2 },
    galUS: { ...lin(3.785411784), symbol: 'gal', decimals: 2 },
  } },
  injector_flow: { base: 'ccmin', units: {
    ccmin: { ...lin(1), symbol: 'cc/min', decimals: 0 },
    // dépend de la densité : convert(..., { density })
    lbh: {
      toBase: (v, o = {}) => (v * LB_G) / ((o.density ?? DEFAULT_FUEL_DENSITY) * 60),
      fromBase: (v, o = {}) => (v * (o.density ?? DEFAULT_FUEL_DENSITY) * 60) / LB_G,
      symbol: 'lb/h', decimals: 1,
    },
  } },
  fuel_flow: { base: 'Lh', units: {
    Lh: { ...lin(1), symbol: 'L/h', decimals: 1 },
    galh: { ...lin(3.785411784), symbol: 'gal/h', decimals: 1 },
    ccmin: { ...lin(0.06), symbol: 'cc/min', decimals: 0 },
  } },
  liquid_flow: { base: 'Lmin', units: {
    Lmin: { ...lin(1), symbol: 'L/min', decimals: 1 },
    galmin: { ...lin(3.785411784), symbol: 'gal/min', decimals: 2 },
  } },
  mass_flow: { base: 'gs', units: {
    gs: { ...lin(1), symbol: 'g/s', decimals: 1 },
    lbmin: { ...lin(LB_G / 60), symbol: 'lb/min', decimals: 1 },
    lbh: { ...lin(LB_G / 3600), symbol: 'lb/h', decimals: 1 },
    kgh: { ...lin(1000 / 3600), symbol: 'kg/h', decimals: 0 },
  } },
  air_flow: { base: 'm3min', units: {
    m3min: { ...lin(1), symbol: 'm³/min', decimals: 2 },
    Lmin: { ...lin(0.001), symbol: 'L/min', decimals: 0 },
    cfm: { ...lin(0.0283168466), symbol: 'CFM', decimals: 0 },
  } },
  power: { base: 'kW', units: {
    kW: { ...lin(1), symbol: 'kW', decimals: 0 },
    hp: { ...lin(0.745699872), symbol: 'hp', decimals: 0 }, // cheval mécanique (US/UK)
    ch: { ...lin(0.73549875), symbol: 'ch', decimals: 0 },  // cheval-vapeur métrique (CV, PS)
  } },
  torque: { base: 'Nm', units: {
    Nm: { ...lin(1), symbol: 'N·m', decimals: 0 },
    lbft: { ...lin(1.3558179483), symbol: 'lb·ft', decimals: 0 },
  } },
  speed: { base: 'ms', units: {
    ms: { ...lin(1), symbol: 'm/s', decimals: 1 },
    ftmin: { ...lin(0.00508), symbol: 'ft/min', decimals: 0 },
  } },
  vehicle_speed: { base: 'kmh', units: {
    kmh: { ...lin(1), symbol: 'km/h', decimals: 0 },
    mph: { ...lin(1.609344), symbol: 'mph', decimals: 0 },
  } },
  mass: { base: 'kg', units: {
    kg: { ...lin(1), symbol: 'kg', decimals: 1 },
    lb: { ...lin(LB_G / 1000), symbol: 'lb', decimals: 1 },
  } },
  small_mass: { base: 'g', units: {
    g: { ...lin(1), symbol: 'g', decimals: 1 },
    oz: { ...lin(28.349523125), symbol: 'oz', decimals: 2 },
  } },
  force: { base: 'N', units: {
    N: { ...lin(1), symbol: 'N', decimals: 0 },
    lbf: { ...lin(4.4482216153), symbol: 'lbf', decimals: 0 },
  } },
  length_m: { base: 'm', units: {
    m: { ...lin(1), symbol: 'm', decimals: 2 },
    ft: { ...lin(0.3048), symbol: 'ft', decimals: 1 },
  } },
  distance: { base: 'km', units: {
    km: { ...lin(1), symbol: 'km', decimals: 0 },
    mi: { ...lin(1.609344), symbol: 'mi', decimals: 0 },
  } },
  flow_velocity: { base: 'ms', units: {
    ms: { ...lin(1), symbol: 'm/s', decimals: 2 },
    fts: { ...lin(0.3048), symbol: 'ft/s', decimals: 2 },
  } },
  stress: { base: 'MPa', units: {
    MPa: { ...lin(1), symbol: 'MPa', decimals: 0 },
    ksi: { ...lin(6.894757293), symbol: 'ksi', decimals: 1 },
  } },
  // Consommation : relation INVERSE entre L/100 km et mpg (pas un simple facteur)
  fuel_economy: { base: 'L100', units: {
    L100: { ...lin(1), symbol: 'L/100 km', decimals: 1 },
    mpgUS: { toBase: (v) => 235.214583 / v, fromBase: (v) => 235.214583 / v, symbol: 'mpg (US)', decimals: 1 },
    mpgUK: { toBase: (v) => 282.480936 / v, fromBase: (v) => 282.480936 / v, symbol: 'mpg (UK)', decimals: 1 },
  } },
  // Prix du carburant (par litre ou par gallon US) ; la devise est choisie à part
  price_volume: { base: 'perL', units: {
    perL: { ...lin(1), symbol: '/L', decimals: 2 },
    perGal: { ...lin(1 / 3.785411784), symbol: '/gal', decimals: 2 },
  } },
  // Consommation spécifique (BSFC)
  bsfc: { base: 'gkWh', units: {
    gkWh: { ...lin(1), symbol: 'g/kWh', decimals: 0 },
    lbhph: { ...lin(608.2773), symbol: 'lb/hp·h', decimals: 2 },
  } },
  spring_rate: { base: 'Nmm', units: {
    Nmm: { ...lin(1), symbol: 'N/mm', decimals: 1 },
    lbin: { ...lin(4.4482216153 / 25.4), symbol: 'lb/in', decimals: 0 },
  } },
};

/** Unité affichée par défaut pour chaque grandeur, selon le système choisi. */
export const SYSTEMS = {
  metric: {
    pressure: 'bar', pressure_abs: 'bara', temperature: 'C', temperature_delta: 'dC', length: 'mm',
    displacement: 'cc', volume: 'L', injector_flow: 'ccmin', fuel_flow: 'Lh', liquid_flow: 'Lmin', mass_flow: 'gs',
    air_flow: 'Lmin', power: 'ch', torque: 'Nm', speed: 'ms', vehicle_speed: 'kmh', mass: 'kg',
    small_mass: 'g', force: 'N', spring_rate: 'Nmm', length_m: 'm', distance: 'km', flow_velocity: 'ms',
    fuel_economy: 'L100', price_volume: 'perL', bsfc: 'gkWh', stress: 'MPa',
  },
  imperial: {
    pressure: 'psi', pressure_abs: 'psia', temperature: 'F', temperature_delta: 'dF', length: 'in',
    displacement: 'ci', volume: 'galUS', injector_flow: 'lbh', fuel_flow: 'galh', liquid_flow: 'galmin', mass_flow: 'lbmin',
    air_flow: 'cfm', power: 'hp', torque: 'lbft', speed: 'ftmin', vehicle_speed: 'mph', mass: 'lb',
    small_mass: 'oz', force: 'lbf', spring_rate: 'lbin', length_m: 'ft', distance: 'mi', flow_velocity: 'fts',
    fuel_economy: 'mpgUS', price_volume: 'perGal', bsfc: 'lbhph', stress: 'ksi',
  },
};

/** Pays qui utilisent l'impérial par défaut (le reste du monde : métrique). */
const IMPERIAL_REGIONS = ['US', 'LR', 'MM'];

/** Système par défaut d'après la région du téléphone (ex. "en-US" → impérial). */
export function detectSystem(preferred = []) {
  const tag = String(preferred[0] || '');
  const region = (tag.split('-')[1] || '').toUpperCase();
  return IMPERIAL_REGIONS.includes(region) ? 'imperial' : 'metric';
}

function unitDef(quantity, unit) {
  const q = QUANTITIES[quantity];
  if (!q) throw new Error(`Grandeur inconnue : ${quantity}`);
  const u = q.units[unit];
  if (!u) throw new Error(`Unité inconnue : ${unit} (${quantity})`);
  return u;
}

/** Saisie → unité de base (métrique) pour la formule. */
export const toBase = (quantity, value, unit, opts) => unitDef(quantity, unit).toBase(value, opts);
/** Unité de base → unité d'affichage. */
export const fromBase = (quantity, value, unit, opts) => unitDef(quantity, unit).fromBase(value, opts);
/** Conversion directe entre deux unités d'une même grandeur. */
export const convert = (quantity, value, from, to, opts) =>
  fromBase(quantity, toBase(quantity, value, from, opts), to, opts);
/** Symbole et nombre de décimales conseillé d'une unité. */
export const unitInfo = (quantity, unit) => {
  const { symbol, decimals } = unitDef(quantity, unit);
  return { symbol, decimals };
};
