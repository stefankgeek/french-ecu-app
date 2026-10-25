/**
 * Base de données carburants (données pures, sans dépendance à l'interface → utilisable dans les calculs
 * et les tests). Reprise à l'identique de l'ancien site (fuel_database.js).
 * Champs : ron, mon, density (kg/L), bsfc (lb/hp·h), pci (MJ/kg), afr (stœchiométrique), ethanol (%), viscosity (Pa·s).
 * Correction 25/10/2026 : PCI de l'E85 = 29,3 MJ/kg (85 % éthanol 26,8 + 15 % essence 43,5) ; l'ancien
 * fichier reprenait la valeur de l'éthanol pur (26,8).
 */
export const FUELS = {
  sp95: { name: 'SP95', ron: 95, mon: 85, density: 0.75, bsfc: 0.5, pci: 44, afr: 14.7, ethanol: 0, viscosity: 0.00055, category: 'standard' },
  sp98: { name: 'SP98', ron: 98, mon: 88, density: 0.75, bsfc: 0.48, pci: 44.2, afr: 14.7, ethanol: 0, viscosity: 0.00055, category: 'standard' },
  e10: { name: 'E10', ron: 95, mon: 85, density: 0.74, bsfc: 0.52, pci: 43.5, afr: 14.1, ethanol: 10, viscosity: 0.00057, category: 'standard' },
  e85: { name: 'E85', ron: 105, mon: 89, density: 0.78, bsfc: 0.7, pci: 29.3, afr: 9.8, ethanol: 85, viscosity: 0.0012, category: 'ethanol' },
  sp95_e10: { name: 'SP95-E10 Premium', ron: 95, mon: 85, density: 0.74, bsfc: 0.51, pci: 43.5, afr: 14.1, ethanol: 10, viscosity: 0.00057, category: 'premium' },
  sp98_premium: { name: 'SP98 Premium', ron: 98, mon: 88, density: 0.75, bsfc: 0.47, pci: 44.3, afr: 14.7, ethanol: 0, viscosity: 0.00054, category: 'premium' },
  shell_v_power: { name: 'Shell V-Power', ron: 99, mon: 89, density: 0.75, bsfc: 0.46, pci: 44.1, afr: 14.7, ethanol: 0, viscosity: 0.00054, category: 'premium' },
  total_excellium: { name: 'Total Excellium', ron: 98, mon: 88, density: 0.75, bsfc: 0.47, pci: 44.2, afr: 14.7, ethanol: 0, viscosity: 0.00054, category: 'premium' },
  bp_ultimate: { name: 'BP Ultimate', ron: 102, mon: 90, density: 0.75, bsfc: 0.45, pci: 44.4, afr: 14.8, ethanol: 0, viscosity: 0.00053, category: 'premium' },
  avgas_100ll: { name: 'AVGAS 100LL', ron: 100, mon: 90, density: 0.72, bsfc: 0.45, pci: 44, afr: 14.8, ethanol: 0, viscosity: 0.00052, category: 'race' },
  race_fuel_100: { nameKey: 'race', ron: 100, mon: 90, density: 0.74, bsfc: 0.48, pci: 44.5, afr: 14.8, ethanol: 0, viscosity: 0.00053, category: 'race' },
  race_fuel_102: { nameKey: 'race', ron: 102, mon: 92, density: 0.74, bsfc: 0.47, pci: 44.6, afr: 14.8, ethanol: 0, viscosity: 0.00052, category: 'race' },
  race_fuel_105: { nameKey: 'race', ron: 105, mon: 94, density: 0.74, bsfc: 0.46, pci: 44.7, afr: 14.9, ethanol: 0, viscosity: 0.00051, category: 'race' },
  race_fuel_110: { nameKey: 'race', ron: 110, mon: 98, density: 0.74, bsfc: 0.45, pci: 44.8, afr: 15, ethanol: 0, viscosity: 0.0005, category: 'race' },
  diesel: { nameKey: 'diesel', ron: 0, mon: 0, density: 0.84, bsfc: 0.38, pci: 43.1, afr: 14.5, ethanol: 0, viscosity: 0.003, category: 'diesel' },
  ethanol: { nameKey: 'ethanol', ron: 108, mon: 89, density: 0.79, bsfc: 0.75, pci: 26.8, afr: 9, ethanol: 100, viscosity: 0.0012, category: 'ethanol' },
  e15: { name: 'E15', ron: 95, mon: 85, density: 0.74, bsfc: 0.54, pci: 41.8, afr: 13.8, ethanol: 15, viscosity: 0.00058, category: 'ethanol' },
  e30: { name: 'E30', ron: 96, mon: 86, density: 0.75, bsfc: 0.58, pci: 38.2, afr: 12.9, ethanol: 30, viscosity: 0.00062, category: 'ethanol' },
  e50: { name: 'E50', ron: 98, mon: 87, density: 0.76, bsfc: 0.63, pci: 34.5, afr: 11.8, ethanol: 50, viscosity: 0.00068, category: 'ethanol' },
  methanol: { nameKey: 'methanol', ron: 107, mon: 92, density: 0.79, bsfc: 1, pci: 19.7, afr: 6.4, ethanol: 0, viscosity: 0.00059, category: 'methanol' },
  toluene: { nameKey: 'toluene', ron: 120, mon: 109, density: 0.87, bsfc: 0.42, pci: 40.6, afr: 13.4, ethanol: 0, viscosity: 0.00059, category: 'special' },
  custom: { nameKey: 'custom', ron: 95, mon: 85, density: 0.75, bsfc: 0.5, pci: 44, afr: 14.7, ethanol: 0, viscosity: 0.00055, category: 'special' },
};
