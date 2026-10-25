/**
 * Petits éléments d'interface partagés : bandeau (mise à jour, installation) et notification.
 * Les notifications s'affichent en HAUT de l'écran, sous la barre de titre, pour ne jamais
 * masquer les résultats ou les graphiques (défaut relevé sur l'ancien site).
 */
import { t } from './i18n.js';

/** Échappe le texte injecté dans le HTML (protection XSS). */
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let toastTimer;
export function toast(message, ms = 3500) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), ms);
}

/**
 * Bandeau d'action en bas d'écran (zone sûre respectée).
 * @param {{id:string, textKey:string, actionKey:string, onAction:()=>void, dismissKey?:string}} o
 */
export function banner({ id, textKey, actionKey, onAction, dismissKey = 'update.later' }) {
  document.getElementById(id)?.remove();
  const el = document.createElement('div');
  el.id = id;
  el.className = 'banner';
  el.setAttribute('role', 'alertdialog');
  el.innerHTML = `
    <span class="banner__text" data-i18n="${textKey}">${esc(t(textKey))}</span>
    <button class="btn btn--ghost" data-act="dismiss" data-i18n="${dismissKey}">${esc(t(dismissKey))}</button>
    <button class="btn btn--primary" data-act="ok" data-i18n="${actionKey}">${esc(t(actionKey))}</button>`;
  el.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'ok') onAction();
    if (act) el.remove();
  });
  document.body.appendChild(el);
}
