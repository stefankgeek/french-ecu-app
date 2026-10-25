/**
 * Lambda / AFR — formules reprises À L'IDENTIQUE de l'ancien site (lambda_afr.php).
 */
export const FUEL_PROPERTIES = {
  sp95: { name: 'SP95', afr: 14.7, octane: 95, ethanol: 5, energy: 32.0 },
  sp98: { name: 'SP98', afr: 14.7, octane: 98, ethanol: 5, energy: 32.5 },
  e10: { name: 'E10', afr: 14.4, octane: 95, ethanol: 10, energy: 31.5 },
  e85: { name: 'E85', afr: 9.8, octane: 104, ethanol: 85, energy: 21.3 },
};

/** Lambda cible par usage. */
export const TARGETS = { idle: 1.0, cruise: 1.0, part_throttle: 0.95, wot_na: 0.88, wot_turbo: 0.8, cold_start: 0.75 };

export const lambdaToAfr = (lambda, fuel) => lambda * FUEL_PROPERTIES[fuel].afr;
export const afrToLambda = (afr, fuel) => afr / FUEL_PROPERTIES[fuel].afr;

/** État du mélange : very_rich | rich | stoich | lean | very_lean (+ couleur). */
export function mixtureStatus(lambda) {
  if (lambda < 0.75) return { key: 'very_rich', status: 'danger' };
  if (lambda < 0.95) return { key: 'rich', status: 'warn' };
  if (lambda <= 1.05) return { key: 'stoich', status: 'ok' };
  if (lambda <= 1.15) return { key: 'lean', status: 'warn' };
  return { key: 'very_lean', status: 'danger' };
}

/**
 * Correction carburant (%) et estimation EGT (°C).
 * Correction validée le 25/10/2026 : l'EGT est maximale côté légèrement pauvre (λ ≈ 1,05–1,15).
 * L'ancien site classait λ 1,05–1,10 à 800 °C « sûr ». Valeurs indicatives (essence, pleine charge).
 */
export function correction(currentAfr, targetAfr, fuel) {
  const pct = (currentAfr / targetAfr - 1) * 100;
  const lambda = currentAfr / FUEL_PROPERTIES[fuel].afr;
  let egt;
  let egtKey;
  let egtStatus;
  if (lambda > 1.15) { egt = 900; egtKey = 'danger'; egtStatus = 'danger'; } // très pauvre : soupapes / détonation
  else if (lambda > 1.05) { egt = 900; egtKey = 'high'; egtStatus = 'warn'; } // pic de température
  else if (lambda >= 0.95) { egt = 850; egtKey = 'safe'; egtStatus = 'ok'; }
  else if (lambda >= 0.85) { egt = 800; egtKey = 'safe'; egtStatus = 'ok'; }
  else { egt = 750; egtKey = 'safe'; egtStatus = 'ok'; }
  return { pct, action: pct > 0 ? 'enrich' : 'lean', status: Math.abs(pct) > 10 ? 'warn' : 'ok', egt, egtKey, egtStatus, lambda };
}
