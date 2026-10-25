/**
 * Catalogue des modules de l'appli.
 *
 * Ajouter un logiciel = ajouter une ligne ici + un dossier dans modules/simulateurs/<id>/
 * (avec ses textes dans locales/<langue>.json). Rien d'autre à modifier.
 *
 * status : 'ready' (disponible) | 'soon' (en cours de portage)
 * load   : import dynamique du module → chaque simulateur n'est chargé que s'il est ouvert.
 */
export const CATEGORIES = ['fuel', 'boost', 'engine', 'ecu', 'chassis'];

export const MODULES = [
  // Carburant & injection
  { id: 'injectors', category: 'fuel', icon: 'injector', color: '#ff6b6b', status: 'ready', load: () => import('./simulateurs/injectors/index.js') },
  { id: 'fuel_pump', category: 'fuel', icon: 'pump', color: '#4ecdc4', status: 'ready', load: () => import('./simulateurs/fuel_pump/index.js') },
  { id: 'e85', category: 'fuel', icon: 'drop', color: '#34c759', status: 'ready', load: () => import('./simulateurs/e85/index.js') },
  { id: 'lambda', category: 'fuel', icon: 'lambda', color: '#ff2d55', status: 'ready', load: () => import('./simulateurs/lambda/index.js') },
  { id: 'nitrous', category: 'fuel', icon: 'bottle', color: '#ff9500', status: 'ready', load: () => import('./simulateurs/nitrous/index.js') },
  // Suralimentation & échappement
  { id: 'turbo', category: 'boost', icon: 'turbo', color: '#ff9500', status: 'ready', load: () => import('./simulateurs/turbo/index.js') },
  { id: 'wastegate', category: 'boost', icon: 'gauge', color: '#5ac8fa', status: 'ready', load: () => import('./simulateurs/wastegate/index.js') },
  { id: 'intercooler', category: 'boost', icon: 'cooler', color: '#007aff', status: 'ready', load: () => import('./simulateurs/intercooler/index.js') },
  { id: 'exhaust', category: 'boost', icon: 'exhaust', color: '#ff9f0a', status: 'ready', load: () => import('./simulateurs/exhaust/index.js') },
  // Moteur
  { id: 'compression', category: 'engine', icon: 'piston', color: '#34c759', status: 'soon' },
  { id: 'camshaft', category: 'engine', icon: 'cam', color: '#af52de', status: 'soon' },
  { id: 'piston_speed', category: 'engine', icon: 'speed', color: '#ff6b6b', status: 'soon' },
  { id: 'valve_spring', category: 'engine', icon: 'spring', color: '#bf5af2', status: 'soon' },
  { id: 'ring_gap', category: 'engine', icon: 'ring', color: '#ff453a', status: 'soon' },
  { id: 'conrod', category: 'engine', icon: 'conrod', color: '#7b68ee', status: 'soon' },
  { id: 'harmonics', category: 'engine', icon: 'wave', color: '#4a90e2', status: 'soon' },
  // Cartographie
  { id: 'ecu_map', category: 'ecu', icon: 'chip', color: '#7b68ee', status: 'soon' },
  // Châssis & refroidissement
  { id: 'brake_bias', category: 'chassis', icon: 'brake', color: '#ff3b30', status: 'soon' },
  { id: 'oil_cooler', category: 'chassis', icon: 'oil', color: '#30d158', status: 'soon' },
];

/** Aide-mémoire (section à part dans le menu). */
export const MEMO = { id: 'memo', icon: 'book', color: '#9c27b0', status: 'soon' };

/**
 * Boutique (pièces détachées, goodies en dropshipping) — PROJET FUTUR, désactivé.
 * Prévu pour se brancher plus tard (Shopify Storefront API, Printful…) sans toucher au reste.
 */
export const SHOP = { id: 'boutique', enabled: false };

export const findModule = (id) => (id === MEMO.id ? MEMO : MODULES.find((m) => m.id === id));
