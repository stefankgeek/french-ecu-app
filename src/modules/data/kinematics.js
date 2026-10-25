/**
 * Cinématique du système bielle-manivelle (fonctions partagées par plusieurs simulateurs).
 * θ : angle vilebrequin en degrés depuis le PMH ; r : rayon de manivelle (= course / 2) ; L : entraxe de bielle.
 */
const rad = (d) => (d * Math.PI) / 180;

/** Distance du piston sous le PMH (même unité que r et L). */
export function pistonPosition(thetaDeg, r, L) {
  const t = rad(thetaDeg);
  return r * (1 - Math.cos(t)) + L - Math.sqrt(L * L - (r * Math.sin(t)) ** 2);
}

/** Vitesse du piston (m/s) pour r, L en mètres et un régime en tr/min. */
export function pistonVelocity(thetaDeg, r, L, rpm) {
  const w = (2 * Math.PI * rpm) / 60;
  const t = rad(thetaDeg);
  const s = Math.sin(t);
  return w * r * (s + (r * s * Math.cos(t)) / Math.sqrt(L * L - (r * s) ** 2));
}

/** Accélération du piston (m/s²), formule exacte (dérivée numérique de la vitesse). */
export function pistonAcceleration(thetaDeg, r, L, rpm) {
  const w = (2 * Math.PI * rpm) / 60;
  const h = 0.01; // degrés
  return ((pistonVelocity(thetaDeg + h, r, L, rpm) - pistonVelocity(thetaDeg - h, r, L, rpm)) / rad(2 * h)) * w;
}

/** Fraction de course restant à comprimer quand l'admission se ferme (IVC en ° après le PMB). */
export function effectiveStrokeFraction(ivcAbdc, r, L) {
  return pistonPosition(180 + ivcAbdc, r, L) / (2 * r);
}
