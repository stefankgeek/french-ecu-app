/**
 * Statistiques administrateur (PostHog, serveurs en Europe) — uniquement avec l'accord de l'utilisateur.
 *
 * - Sans accord (ou refus) : AUCUNE donnée envoyée, la bibliothèque n'est même pas téléchargée.
 * - Avec accord : pages vues, logiciels ouverts et calculs (valeurs saisies, sans donnée personnelle),
 *   exports PDF, partages, téléchargements, langue, unités, appareil, pays (déduit par PostHog),
 *   installations, mises à jour et erreurs. Aucun nom, e-mail ou identifiant personnel.
 * - Clé PUBLIQUE de projet dans .env / variable GitHub VITE_POSTHOG_KEY (pas un secret).
 */
import { load, save } from './store.js';

const KEY = import.meta.env.VITE_POSTHOG_KEY;
const HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';

let ph = null;
let starting = null;
const queue = [];
const supers = {};
const pending = []; // événements de lancement en attente de la réponse au consentement

/** 'granted' | 'denied' | null (pas encore demandé) */
export const consent = () => load('consent', null);
/** Les statistiques sont-elles configurées pour cette version de l'appli ? */
export const analyticsEnabled = () => Boolean(KEY);

async function start() {
  if (ph || !KEY) return;
  if (!starting) {
    starting = import('posthog-js').then(({ default: posthog }) => {
      posthog.init(KEY, {
        api_host: HOST,
        persistence: 'localStorage', // pas de cookie
        person_profiles: 'always',
        capture_pageview: false, // pages envoyées par l'appli (navigation par #)
        capture_pageleave: true,
        autocapture: true, // clics sur les boutons → cartes de chaleur
        capture_exceptions: true,
        disable_session_recording: true,
        loaded: (p) => { if (import.meta.env.DEV) p.debug(false); },
      });
      posthog.register(supers);
      ph = posthog;
      while (queue.length) { const [e, p] = queue.shift(); ph.capture(e, p); }
    }).catch(() => { starting = null; });
  }
  await starting;
}

/** Démarre les statistiques si l'utilisateur a déjà accepté. */
export async function initAnalytics() {
  if (consent() === 'granted') await start();
}

/** Enregistre le choix de l'utilisateur (écran de consentement ou réglages). */
export async function setConsent(value) {
  save('consent', value);
  if (value === 'granted') {
    await start();
    ph?.opt_in_capturing();
    track('consent_given');
    while (pending.length) { const [e, p] = pending.shift(); track(e, p); }
  } else {
    pending.length = 0;
  }
  if (value !== 'granted' && ph) {
    ph.capture('consent_withdrawn');
    ph.opt_out_capturing();
    ph.reset();
  }
}

/** Propriétés jointes à tous les événements (version, langue, unités, appareil…). */
export function setSuperProps(props) {
  Object.assign(supers, props);
  ph?.register(props);
}

/** Envoie un événement (ignoré sans accord). */
export function track(event, props = {}) {
  if (!KEY || consent() !== 'granted') return;
  if (ph) ph.capture(event, props);
  else { queue.push([event, props]); start(); }
}

/**
 * Événement de lancement (ouverture, installation, écran d'installation) : si l'utilisateur
 * n'a pas encore répondu, il est gardé en mémoire et envoyé seulement s'il accepte.
 */
export function trackLaunch(event, props = {}) {
  if (!KEY) return;
  if (consent() === null) pending.push([event, props]);
  else track(event, props);
}

/** Page vue (l'appli navigue par #/…). */
export function trackPage(path, props = {}) {
  track('$pageview', { $current_url: location.href, path, ...props });
}

/** Valeurs d'un calcul : nombres arrondis (4 chiffres significatifs) et choix des listes. */
export function summarizeInputs(state) {
  const out = {};
  for (const [k, v] of Object.entries(state)) {
    out[k] = typeof v === 'number' && Number.isFinite(v) ? Number(v.toPrecision(4)) : v;
  }
  return out;
}
