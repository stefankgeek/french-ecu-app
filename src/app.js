/**
 * Écrans de l'appli : accueil (menu), réglages, page d'un module.
 * Tout le texte passe par t() → changement de langue instantané.
 */
import { t, fmt, lang, LANGUAGES, setLanguage, onLanguageChange } from './core/i18n.js';
import { QUANTITIES, getSystem, setSystem, getUnit, setUnit, unitInfo, fromBase, onUnitsChange } from './core/units.js';
import { route, fallback, navigate, startRouter, currentPath } from './core/router.js';
import { installMode, promptInstall, onInstallChange } from './core/install.js';
import { MODULES, CATEGORIES, MEMO, findModule } from './modules/registry.js';
import { icon } from './core/icons.js';
import { esc } from './core/ui.js';
import { track, trackPage, consent, setConsent, analyticsEnabled } from './core/analytics.js';

const view = () => document.getElementById('view');
let rerender = () => {};

/* ---------- Cadre général (barre du haut + zone de contenu) ---------- */
function shell() {
  document.getElementById('app').innerHTML = `
    <header class="topbar">
      <button class="icon-btn topbar__back" id="btn-back" hidden>${icon('back', 'ico ico--flip')}<span class="sr" id="lbl-back"></span></button>
      <a class="brand" href="#/" id="brand">
        <img src="${import.meta.env.BASE_URL}icons/logo-mark.svg" alt="" width="30" height="30" />
        <span class="brand__name">FRENCH ECU</span>
      </a>
      <h1 class="topbar__title" id="topbar-title"></h1>
      <a class="icon-btn" href="#/reglages" id="btn-settings">${icon('settings')}<span class="sr" id="lbl-settings"></span></a>
    </header>
    <main id="view" class="view" tabindex="-1"></main>`;
  document.getElementById('btn-back').addEventListener('click', () => {
    if (history.length > 1) history.back(); else navigate('/');
  });
}

function setChrome({ title = '', back = false }) {
  document.getElementById('btn-back').hidden = !back;
  document.getElementById('brand').hidden = back;
  document.getElementById('topbar-title').textContent = title;
  document.getElementById('lbl-back').textContent = t('nav.back');
  document.getElementById('lbl-settings').textContent = t('nav.settings');
  document.getElementById('btn-settings').setAttribute('aria-label', t('nav.settings'));
  document.title = title ? `${title} · French ECU` : 'French ECU';
}

/* ---------- Accueil : menu des logiciels ---------- */
function card(m) {
  const soon = m.status !== 'ready';
  return `
    <a class="card" href="#/outil/${m.id}" style="--c:${m.color}" data-search="${esc((t(`modules.${m.id}.title`) + ' ' + t(`modules.${m.id}.desc`)).toLowerCase())}">
      <span class="card__icon">${icon(m.icon)}</span>
      <span class="card__body">
        <span class="card__title">${esc(t(`modules.${m.id}.title`))}</span>
        <span class="card__desc">${esc(t(`modules.${m.id}.desc`))}</span>
      </span>
      ${soon ? `<span class="badge">${esc(t('status.soon'))}</span>` : ''}
    </a>`;
}

function installCard() {
  const mode = installMode();
  if (!mode) return '';
  return `
    <div class="install">
      <span class="install__icon">${icon('download')}</span>
      <div class="install__text">
        <strong>${esc(t('install.title'))}</strong>
        ${mode === 'ios' ? `<span>${esc(t('install.ios_hint'))}</span>` : ''}
      </div>
      ${mode === 'native' ? `<button class="btn btn--primary" id="btn-install">${esc(t('install.action'))}</button>` : ''}
    </div>`;
}

function home() {
  setChrome({});
  const sections = CATEGORIES.map((cat) => {
    const mods = MODULES.filter((m) => m.category === cat);
    return `
      <section class="section" data-section>
        <h2 class="section__title">${esc(t(`categories.${cat}`))}</h2>
        <div class="grid">${mods.map(card).join('')}</div>
      </section>`;
  }).join('');

  view().innerHTML = `
    <div class="hero">
      <p class="hero__tagline">${esc(t('app.tagline'))}</p>
      <p class="hero__count">${esc(t('home.tools_count', { count: MODULES.length }))}</p>
    </div>
    ${installCard()}
    <label class="search">
      ${icon('search')}
      <input type="search" id="search" placeholder="${esc(t('home.search_placeholder'))}" aria-label="${esc(t('home.search_label'))}" autocomplete="off" enterkeyhint="search" />
    </label>
    <section class="section" data-section>
      <h2 class="section__title">${esc(t('categories.memo'))}</h2>
      <div class="grid">${card(MEMO)}</div>
    </section>
    ${sections}
    <p class="empty" id="no-result" hidden>${esc(t('home.no_result'))}</p>`;

  // Recherche instantanée (insensible aux accents)
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  document.getElementById('search').addEventListener('input', (e) => {
    const q = norm(e.target.value.trim());
    let any = false;
    view().querySelectorAll('[data-section]').forEach((sec) => {
      let visible = 0;
      sec.querySelectorAll('.card').forEach((c) => {
        const ok = !q || norm(c.dataset.search).includes(q);
        c.hidden = !ok;
        if (ok) visible++;
      });
      sec.hidden = visible === 0;
      if (visible) any = true;
    });
    document.getElementById('no-result').hidden = any;
  });
  document.getElementById('btn-install')?.addEventListener('click', promptInstall);
}

/* ---------- Réglages : langue + unités ---------- */
const EXAMPLES = [
  ['pressure', 1.2], ['temperature', 90], ['power', 147.1], ['torque', 320], ['injector_flow', 550], ['displacement', 1998],
];

function settings() {
  setChrome({ title: t('settings.title'), back: true });
  const sys = getSystem();
  const langs = LANGUAGES.map((l) => `
    <label class="choice">
      <input type="radio" name="lang" value="${l.code}" ${l.code === lang() ? 'checked' : ''} />
      <span lang="${l.code}" dir="${l.dir}">${esc(l.name)}</span>
    </label>`).join('');

  const examples = EXAMPLES.map(([q, v]) => {
    const u = getUnit(q);
    const { symbol, decimals } = unitInfo(q, u);
    return `<li><span>${esc(t(`quantity.${q}`))}</span><strong dir="ltr">${esc(fmt(fromBase(q, v, u), { decimals }))} ${esc(symbol)}</strong></li>`;
  }).join('');

  const advanced = Object.entries(QUANTITIES).map(([q, def]) => `
    <label class="row">
      <span>${esc(t(`quantity.${q}`))}</span>
      <select data-quantity="${q}">
        ${Object.keys(def.units).map((u) => `<option value="${u}" ${u === getUnit(q) ? 'selected' : ''}>${esc(unitInfo(q, u).symbol)}</option>`).join('')}
      </select>
    </label>`).join('');

  view().innerHTML = `
    <section class="panel">
      <h2 class="panel__title">${esc(t('settings.language'))}</h2>
      <div class="choices">${langs}</div>
    </section>

    <section class="panel">
      <h2 class="panel__title">${esc(t('settings.units'))}</h2>
      <div class="segmented" role="radiogroup" aria-label="${esc(t('settings.units'))}">
        <button role="radio" aria-checked="${sys === 'metric'}" data-system="metric">${esc(t('settings.units_metric'))}</button>
        <button role="radio" aria-checked="${sys === 'imperial'}" data-system="imperial">${esc(t('settings.units_imperial'))}</button>
      </div>
      <p class="hint">${esc(t('settings.units_hint'))}</p>
      <h3 class="panel__sub">${esc(t('settings.example'))}</h3>
      <ul class="examples">${examples}</ul>
      <details class="advanced">
        <summary>${esc(t('settings.units_advanced'))}</summary>
        <div class="rows">${advanced}</div>
      </details>
    </section>

    <section class="panel">
      <h2 class="panel__title">${esc(t('settings.number_format'))}</h2>
      <p class="mono" dir="ltr">${esc(fmt(12345.678, { decimals: 3 }))}</p>
    </section>

    ${analyticsEnabled() ? `<section class="panel">
      <h2 class="panel__title">${esc(t('consent.settings_title'))}</h2>
      <label class="switch-row"><span>${esc(t('consent.settings_label'))}</span>
        <input type="checkbox" id="stats-toggle" ${consent() === 'granted' ? 'checked' : ''} /></label>
      <p class="hint">${esc(t('consent.settings_text'))}</p>
    </section>` : ''}

    <section class="panel">
      <h2 class="panel__title">${esc(t('settings.about'))}</h2>
      <p>French ECU — ${esc(t('settings.version', { version: __APP_VERSION__ }))}</p>
    </section>`;

  view().querySelectorAll('input[name="lang"]').forEach((r) => r.addEventListener('change', (e) => setLanguage(e.target.value)));
  view().querySelectorAll('[data-system]').forEach((b) => b.addEventListener('click', () => setSystem(b.dataset.system)));
  document.getElementById('stats-toggle')?.addEventListener('change', (e) => setConsent(e.target.checked ? 'granted' : 'denied'));
  view().querySelectorAll('select[data-quantity]').forEach((s) => s.addEventListener('change', () => setUnit(s.dataset.quantity, s.value)));
}

/* ---------- Page d'un module ---------- */
async function moduleView({ id }) {
  const m = findModule(id);
  if (!m) return navigate('/');
  setChrome({ title: t(`modules.${id}.title`), back: true });
  track('tool_open', { tool: id, category: m.category || 'memo' });
  if (m.status === 'ready' && m.view) {
    const { mountMemo } = await m.view();
    return mountMemo(view());
  }
  if (m.status === 'ready' && m.load) {
    const [{ default: spec }, { mountSimulator }] = await Promise.all([m.load(), import('./core/sim/page.js')]);
    return mountSimulator(view(), spec);
  }
  view().innerHTML = `
    <section class="panel coming" style="--c:${m.color}">
      <span class="coming__icon">${icon(m.icon)}</span>
      <h2>${esc(t('module.coming_title'))}</h2>
      <p>${esc(t(`modules.${id}.desc`))}</p>
      <p class="hint">${esc(t('module.coming_text'))}</p>
    </section>`;
}

/* ---------- Démarrage ---------- */
export function startApp() {
  shell();
  const wrap = (fn) => (params) => {
    trackPage(currentPath(), params?.id ? { tool: params.id } : {});
    rerender = () => { view()._simCleanup?.(); fn(params); };
    view()._simCleanup?.();
    fn(params);
    view().scrollTo?.(0, 0);
    window.scrollTo(0, 0);
  };
  route('/', wrap(home));
  route('/reglages', wrap(settings));
  route('/outil/:id', wrap(moduleView));
  fallback(() => navigate('/'));

  // Changement de langue ou d'unités : on redessine l'écran courant sans perdre la position
  const keepScroll = () => { const y = window.scrollY; rerender(); window.scrollTo(0, y); };
  onLanguageChange(keepScroll);
  onUnitsChange(keepScroll);
  onInstallChange(() => { if (currentPath() === '/') keepScroll(); });
  startRouter();
}
