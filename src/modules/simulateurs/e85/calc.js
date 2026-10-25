/**
 * Conversion E85 — formules reprises À L'IDENTIQUE de l'ancien site (e85_conversion.php).
 * Entrées : fuel ('sp95'|'sp98'|'e10'), injCcMin, railBar, power (n'importe quelle unité, calcul en rapport),
 *           boostBar (relatif), l100 (L/100 km), kmYear, priceFuel / priceE85 (par litre), conversionCost.
 */
export const FUEL_PROPERTIES = {
  sp95: { name: 'SP95', afr: 14.7, energy: 32.0, density: 0.75, octane: 95, ethanol: 5 },
  sp98: { name: 'SP98', afr: 14.7, energy: 32.5, density: 0.755, octane: 98, ethanol: 5 },
  e10: { name: 'E10', afr: 14.4, energy: 31.5, density: 0.752, octane: 95, ethanol: 10 },
  e85: { name: 'E85', afr: 9.8, energy: 21.3, density: 0.79, octane: 104, ethanol: 85 },
};
export const TIMING_GAIN = 0.04; // +4 % grâce à l'avance supplémentaire
export const COOLING_C = 12; // refroidissement de la charge (°C)
export const EXTRA_BOOST = 0.2; // bar supplémentaires tolérés en E85
export const PRACTICAL_INCREASE = 1.25; // +25 % de consommation observée
export const MAX_PRESSURE_BAR = 5.5;

export function computeE85(i) {
  const cur = FUEL_PROPERTIES[i.fuel];
  const afrRatio = cur.afr / FUEL_PROPERTIES.e85.afr;
  const newInjector = i.injCcMin * afrRatio;
  const newPressure = i.railBar * Math.pow(newInjector / i.injCcMin, 2);
  const changeInjectors = newPressure > MAX_PRESSURE_BAR;

  const densityGain = 293.15 / (293.15 - COOLING_C) - 1;
  const boostGain = i.boostBar > 0 ? (i.boostBar + EXTRA_BOOST) / i.boostBar - 1 : 0;
  const totalGain = (1 + TIMING_GAIN) * (1 + densityGain) * (1 + boostGain) - 1;
  const newPower = i.power * (1 + totalGain);

  const l100E85 = i.l100 * PRACTICAL_INCREASE;
  const litresFuel = (i.kmYear / 100) * i.l100;
  const costFuel = litresFuel * i.priceFuel;
  const litresE85 = (i.kmYear / 100) * l100E85;
  const costE85 = litresE85 * i.priceE85;
  const savings = costFuel - costE85;
  const savingsPct = (savings / costFuel) * 100;
  const roiMonths = savings > 0 ? i.conversionCost / (savings / 12) : Infinity;

  return {
    afrRatio, newInjector, newPressure, changeInjectors, totalGain, newPower, powerGain: newPower - i.power,
    l100E85, costFuel, costE85, savings, savingsPct, roiMonths, cur,
    injectorStatus: newInjector / i.injCcMin > 1.6 ? 'warn' : 'ok',
    roiStatus: roiMonths > 36 ? 'danger' : roiMonths > 24 ? 'warn' : 'ok',
  };
}
