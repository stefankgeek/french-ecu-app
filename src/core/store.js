/**
 * Stockage local des réglages (langue, unités, consentement…).
 *
 * Toutes les lectures/écritures sont protégées : en navigation privée ou si le
 * stockage est bloqué, l'appli continue de fonctionner avec les valeurs par défaut.
 * Plus tard (Capacitor), il suffira de remplacer ces 2 fonctions par le plugin
 * @capacitor/preferences, sans toucher au reste du code.
 */
const PREFIX = 'fe:';

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* stockage indisponible : on ignore silencieusement */
  }
}
