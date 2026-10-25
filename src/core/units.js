/**
 * Unités — couche appli : système choisi (métrique / impérial) + choix par grandeur.
 *
 * Exemple : un Européen règle « Métrique » mais préfère la pression turbo en psi
 * → setUnit('pressure', 'psi'). Le choix est mémorisé.
 */
import { QUANTITIES, SYSTEMS, detectSystem, toBase, fromBase, convert, unitInfo } from './units-core.js';
import { load, save } from './store.js';

let system = 'metric';
let overrides = {};
const listeners = new Set();

export { QUANTITIES, toBase, fromBase, convert, unitInfo };

export function initUnits() {
  system = load('unitSystem') || detectSystem(navigator.languages || [navigator.language]);
  overrides = load('unitOverrides', {}) || {};
}

export const getSystem = () => system;

/** Unité actuellement utilisée pour une grandeur. */
export const getUnit = (quantity) => overrides[quantity] || SYSTEMS[system][quantity];

/** Change le système complet (efface les choix individuels). */
export function setSystem(next) {
  if (!SYSTEMS[next]) return;
  system = next;
  overrides = {};
  save('unitSystem', system);
  save('unitOverrides', overrides);
  notify();
}

/** Change l'unité d'une seule grandeur. */
export function setUnit(quantity, unit) {
  if (!QUANTITIES[quantity]?.units[unit]) return;
  overrides = { ...overrides, [quantity]: unit };
  save('unitOverrides', overrides);
  notify();
}

export function onUnitsChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn({ system, overrides }));
}
