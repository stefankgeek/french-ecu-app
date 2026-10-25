/**
 * Ressorts de soupapes — marge contre l'affolement.
 * Base : ancien site (valve_spring.php). Conservé : force au siège, force à levée maxi, marge avant spires
 * jointives, multiplicateur ×1,8 pour un double ressort (ressort intérieur ≈ 80 % du principal).
 * Corrections (règle du 25/10/2026) :
 *  1. Accélération de la soupape : l'ancien site utilisait ω²·levée/2 avec la vitesse du MOTEUR et
 *     ignorait la durée de la came (champ inutilisé). Ici : profil harmonique sur la durée réelle de
 *     l'ouverture : a = (levée/2)·(2π/T)², T = durée (° vilebrequin) / (6·tr/min).
 *  2. Masse en mouvement : soupape + coupelle/clavettes + ⅓ du ressort + poussoir/linguet.
 *  3. Hauteur libre saisie (l'ancien site supposait « hauteur montée + 10 mm »).
 *  4. Raideur en N/mm (lb/in au choix) : l'ancien site mélangeait N/mm dans le calcul et lb/in à l'affichage.
 *  5. Régime limite recalculé avec la même accélération (marge de 30 %).
 */
export const TARGET_MARGIN = 0.3;

export function computeValveSpring(i) {
  const mult = i.dual ? 1.8 : 1;
  const k = i.rate * mult; // N/mm
  const preload = i.freeHeight - i.installed; // mm
  const seat = k * preload; // N
  const open = seat + k * i.lift; // N
  const massKg = (i.valve + i.retainer + i.springMass / 3 + i.follower) / 1000;
  const T = i.duration / (6 * i.rpm); // s
  const accel = (i.lift / 2000) * ((2 * Math.PI) / T) ** 2; // m/s²
  const required = massKg * accel; // N
  const margin = (open - required) / required;
  const bindMargin = i.installed - i.lift - i.coilBind;
  const rpmLimit = i.rpm * Math.sqrt(open / (required * (1 + TARGET_MARGIN)));
  const risk = margin < 0 ? 'critical' : margin < 0.2 ? 'high' : margin < 0.5 ? 'moderate' : 'low';
  return { k, preload, seat, open, massKg, accel, accelG: accel / 9.80665, required, margin, bindMargin, rpmLimit, risk };
}

/** Force du ressort et force d'inertie selon la levée / le régime. */
export const forceCurve = (i) => {
  const r = computeValveSpring(i);
  return Array.from({ length: 11 }, (_, n) => ({ lift: (i.lift * n) / 10, f: r.seat + r.k * ((i.lift * n) / 10) }));
};
export const marginCurve = (i) => {
  const pts = [];
  for (let rpm = 2000; rpm <= Math.max(i.rpm * 1.3, 4000); rpm += 500) pts.push({ rpm, m: computeValveSpring({ ...i, rpm }).margin * 100 });
  return pts;
};
