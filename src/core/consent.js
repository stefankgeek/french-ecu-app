/**
 * Écran de consentement RGPD (premier lancement) : statistiques anonymes oui / non.
 * Le choix est modifiable à tout moment dans Réglages.
 */
import { t } from './i18n.js';
import { esc } from './ui.js';
import { consent, setConsent, analyticsEnabled } from './analytics.js';

export function askConsentIfNeeded() {
  if (!analyticsEnabled() || consent() !== null || document.getElementById('consent')) return;
  const el = document.createElement('div');
  el.id = 'consent';
  el.className = 'consent';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-labelledby', 'consent-title');
  el.innerHTML = `
    <div class="consent__sheet">
      <h2 id="consent-title" class="consent__title">${esc(t('consent.title'))}</h2>
      <p class="consent__text">${esc(t('consent.text'))}</p>
      <details class="consent__details">
        <summary>${esc(t('consent.details_btn'))}</summary>
        <ul>${['d1', 'd2', 'd3', 'd4', 'd5'].map((k) => `<li>${esc(t(`consent.${k}`))}</li>`).join('')}</ul>
      </details>
      <div class="consent__actions">
        <button class="btn btn--ghost" data-c="denied">${esc(t('consent.refuse'))}</button>
        <button class="btn btn--primary" data-c="granted">${esc(t('consent.accept'))}</button>
      </div>
    </div>`;
  el.addEventListener('click', async (e) => {
    const v = e.target.closest('[data-c]')?.dataset.c;
    if (!v) return;
    el.remove();
    await setConsent(v);
  });
  document.body.appendChild(el);
}
