/**
 * Jeu à la coupe des segments — reprise À L'IDENTIQUE de l'ancien site (ring_gap.php + data/gap.json).
 * Méthode vérifiée : jeu = alésage (pouces) × coefficient selon l'usage et la position du segment
 * (valeurs conformes aux recommandations des fabricants de pistons/segments). Rails racleurs : 0,015" mini.
 * Tolérance : jusqu'à +30 % au-dessus du jeu calculé sans effet notable ; JAMAIS en dessous (grippage).
 */
export const APPLICATIONS = {
  four_stroke: {
    naturally_aspirated: { top: 0.004, second: 0.005 },
    naturally_aspirated_racing: { top: 0.0045, second: 0.0055 },
    forced_induction: { top: 0.0055, second: 0.0065 },
    heavy_load_high_heat: { top: 0.006, second: 0.007 },
  },
  two_stroke: {
    naturally_aspirated: { top: 0.004, second: 0.004 },
    naturally_aspirated_racing: { top: 0.0045, second: 0.0045 },
    snow_marine: { top: 0.005, second: 0.005 },
    heavy_load_high_heat: { top: 0.0055, second: 0.0055 },
    forced_induction: { top: 0.006, second: 0.0065 },
  },
};
export const OIL_RAIL_MIN_IN = 0.015;
export const OVER_TOLERANCE = 0.3;

/** @param {object} i boreMm, engine ('four_stroke'|'two_stroke'), application */
export function computeRingGap(i) {
  const apps = APPLICATIONS[i.engine];
  const c = apps[i.application] || Object.values(apps)[0];
  const boreIn = i.boreMm / 25.4;
  const top = boreIn * c.top * 25.4;
  const second = boreIn * c.second * 25.4;
  const oil = i.engine === 'four_stroke' ? OIL_RAIL_MIN_IN * 25.4 : null;
  return { boreIn, coefTop: c.top, coefSecond: c.second, top, second, oil, topMax: top * (1 + OVER_TOLERANCE), secondMax: second * (1 + OVER_TOLERANCE) };
}
