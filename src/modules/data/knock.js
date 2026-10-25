/**
 * Estimation indicative de l'indice d'octane requis (essence, culasse alu 4 soupapes).
 * - Atmosphérique : selon le taux de compression DYNAMIQUE (TCD) : RON ≈ 91,5 + 6,5 × (TCD − 8,5).
 * - Suralimenté : selon le taux EFFECTIF TCE = TCD × (P_abs / P_atm)^(1/1,3), charge refroidie,
 *   avance adaptée : RON ≈ 98 + (TCE − 13,5) / 0,35.
 * Ces règles d'atelier donnent un ordre de grandeur ; l'avance à l'allumage réellement utilisée,
 * l'injection directe et la température d'admission font varier fortement la limite.
 */
export const P_ATM = 1.01325;

export const effectiveCr = (dcr, boostBar) => dcr * Math.pow((P_ATM + boostBar) / P_ATM, 1 / 1.3);

export function requiredRon(dcr, boostBar) {
  if (boostBar <= 0) return 91.5 + 6.5 * (dcr - 8.5);
  return 98 + (effectiveCr(dcr, boostBar) - 13.5) / 0.35;
}

export function fuelForRon(ron) {
  return ron < 95 ? 'sp95' : ron < 98 ? 'sp98' : ron < 102 ? 'race' : 'e85';
}

/** Risque de cliquetis : écart entre l'octane requis et celui du carburant. */
export function knockRisk(requiredRonValue, fuelRon) {
  const d = requiredRonValue - fuelRon;
  return d <= 0 ? 'low' : d <= 3 ? 'medium' : 'high';
}
