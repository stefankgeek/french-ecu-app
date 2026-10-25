/**
 * Moteur commun des simulateurs.
 *
 * Chaque logiciel fournit une « fiche » (spec) : ses champs, son calcul (fonction pure en
 * unités métriques) et ce qu'il affiche. Ce moteur s'occupe de tout le reste :
 * saisie avec choix d'unité, contrôle des valeurs, calcul automatique, cartes de résultats,
 * tableaux, graphiques, export PDF, lien de partage, mémorisation des dernières valeurs.
 *
 * Valeurs internes = TOUJOURS en unité de base (métrique). Conversion uniquement à l'affichage.
 */
import { t, fmt, lang, parseNumber } from '../i18n.js';
import { getLanguage } from '../i18n-core.js';
import { QUANTITIES, getUnit, setUnit, toBase, fromBase, unitInfo, altUnit } from '../units.js';
import { formatQ, symbolOf, toDisplay, smartDecimals } from '../format.js';
import { load, save } from '../store.js';
import { currentQuery } from '../router.js';
import { esc, toast } from '../ui.js';
import { icon } from '../icons.js';

/** Encode / décode les valeurs pour un lien de partage (#/outil/x?v=…). */
const encode = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const decode = (s) => { try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))); } catch { return null; } };

/**
 * Affiche un simulateur dans un conteneur.
 * @param {HTMLElement} root
 * @param {object} spec fiche du simulateur (voir modules/simulateurs/*)
 */
export function mountSimulator(root, spec) {
  const NS = spec.id;
  const tt = (k, p) => t(`${NS}.${k}`, p);
  const byId = Object.fromEntries(spec.inputs.map((f) => [f.id, f]));
  const defaults = Object.fromEntries(spec.inputs.map((f) => [f.id, f.default]));

  // Valeurs : lien partagé > dernière utilisation > valeurs par défaut
  const shared = currentQuery().get('v');
  const saved = load(`sim:${NS}`, {});
  const state = { ...defaults, ...(saved || {}), ...(shared ? decode(shared) || {} : {}) };
  for (const k of Object.keys(state)) if (!(k in byId)) delete state[k];
  if (shared) {
    // Valeurs du lien appliquées une fois : on les enregistre puis on nettoie l'adresse
    save(`sim:${NS}`, state);
    history.replaceState(null, '', `${location.href.split('#')[0]}#/outil/${NS}`);
  }
  const errors = {};
  let charts = [];
  let lastResult = null;
  let lastView = null;

  /* ---------- Construction de la page ---------- */
  const ctx = {
    t: tt, tc: t, f: formatQ, cv: toDisplay, sym: symbolOf, fmt,
    get values() { return state; },
  };

  root.innerHTML = `
    <div class="sim">
      ${spec.intro ? `<p class="sim__intro">${esc(tt(spec.intro))}</p>` : ''}
      <div class="sim__layout">
        <div class="sim__inputs">
          ${spec.groups.map((g) => `
            <section class="panel">
              <h2 class="panel__title">${esc(tt(g.title))}</h2>
              <div class="fields">${g.fields.map((id) => fieldHtml(byId[id])).join('')}</div>
            </section>`).join('')}
          <div class="sim__actions">
            <button class="btn btn--ghost" data-act="reset">${esc(t('sim.reset'))}</button>
            <button class="btn btn--ghost" data-act="share">${esc(t('sim.share'))}</button>
            <button class="btn btn--primary" data-act="pdf">${icon('download')}<span>${esc(t('sim.pdf'))}</span></button>
          </div>
        </div>
        <div class="sim__outputs" aria-live="polite">
          <section class="panel">
            <h2 class="panel__title">${esc(t('sim.results'))}</h2>
            <div class="sim__error" hidden>${esc(t('sim.fix_inputs'))}</div>
            <div class="results"></div>
            <div class="sim__notes"></div>
          </section>
          <div class="sim__tables"></div>
          <div class="sim__charts"></div>
        </div>
      </div>
    </div>`;

  function fieldHtml(f) {
    const label = esc(tt(`in.${f.id}`, f.labelParams?.(ctx)));
    const hint = f.hint ? `<p class="field__hint">${esc(tt(f.hint))}</p>` : '';
    if (f.type === 'select') {
      return `<div class="field" data-field="${f.id}">
        <label for="f-${f.id}">${label}</label>
        <div class="field__control"><select id="f-${f.id}">${optionsHtml(f)}</select></div>${hint}
      </div>`;
    }
    const units = f.quantity && !f.quantity.startsWith('u:') ? Object.keys(QUANTITIES[f.quantity].units) : null;
    const unitCtl = units && units.length > 1
      ? `<select class="field__unit" dir="ltr" data-unit-for="${f.quantity}" aria-label="${esc(t('sim.unit'))}">${units.map((u) => `<option value="${u}" ${u === getUnit(f.quantity) ? 'selected' : ''}>${esc(unitInfo(f.quantity, u).symbol)}</option>`).join('')}</select>`
      : (f.quantity || f.suffix ? `<span class="field__unit field__unit--fixed" dir="ltr">${esc(f.suffix ? f.suffix(ctx) : symbolOf(f.quantity))}</span>` : '');
    return `<div class="field" data-field="${f.id}">
      <label for="f-${f.id}">${label}</label>
      <div class="field__control">
        <input id="f-${f.id}" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" dir="ltr" value="${esc(displayValue(f))}" />
        ${unitCtl}
      </div>
      <p class="field__error" hidden></p>${hint}
    </div>`;
  }

  function optionsHtml(f) {
    const opts = typeof f.options === 'function' ? f.options(ctx) : f.options;
    return opts.map((o) => o.group
      ? `<optgroup label="${esc(o.group)}">${o.items.map((i) => opt(i, f)).join('')}</optgroup>`
      : opt(o, f)).join('');
  }
  function opt(o, f) {
    return `<option value="${esc(o.value)}" ${String(o.value) === String(state[f.id]) ? 'selected' : ''}>${esc(o.label)}</option>`;
  }

  /** Valeur de base → texte du champ (unité choisie, format de la langue, sans séparateur de milliers). */
  function displayValue(f) {
    const base = state[f.id];
    if (base === null || base === undefined || !Number.isFinite(base)) return '';
    const v = toDisplay(f.quantity, base);
    const d = f.decimals ?? (f.quantity && !f.quantity.startsWith('u:') ? unitInfo(f.quantity, getUnit(f.quantity)).decimals + 1 : 3);
    // Pas de séparateur de milliers dans un champ de saisie (plus simple à corriger au clavier)
    return new Intl.NumberFormat(getLanguage(lang()).locale, { maximumFractionDigits: smartDecimals(v, d), useGrouping: false }).format(v);
  }

  /* ---------- Saisie ---------- */
  const $ = (sel) => root.querySelector(sel);
  root.querySelectorAll('.field input').forEach((input) => {
    input.addEventListener('input', () => onInput(input.closest('.field').dataset.field, input.value));
    input.addEventListener('blur', () => { const id = input.closest('.field').dataset.field; if (!errors[id]) input.value = displayValue(byId[id]); });
  });
  root.querySelectorAll('.field select:not(.field__unit)').forEach((sel) => {
    sel.addEventListener('change', () => {
      const f = byId[sel.closest('.field').dataset.field];
      state[f.id] = f.numeric === false ? sel.value : Number(sel.value);
      afterChange(f.id);
    });
  });
  root.querySelectorAll('.field__unit[data-unit-for]').forEach((sel) => {
    sel.addEventListener('change', () => setUnit(sel.dataset.unitFor, sel.value)); // → onUnitsChange redessine
  });

  function onInput(id, raw) {
    const f = byId[id];
    const n = parseNumber(raw);
    const el = $(`[data-field="${id}"] .field__error`);
    let msg = '';
    if (!Number.isFinite(n)) msg = t('sim.invalid_number');
    else {
      const base = f.quantity && !f.quantity.startsWith('u:') ? toBase(f.quantity, n, getUnit(f.quantity)) : n;
      if ((f.min !== undefined && base < f.min - 1e-9) || (f.max !== undefined && base > f.max + 1e-9)) {
        msg = t('sim.invalid_range', { min: formatQ(f.quantity, f.min ?? -Infinity), max: formatQ(f.quantity, f.max ?? Infinity) });
      } else {
        state[id] = base;
      }
    }
    errors[id] = !!msg;
    el.textContent = msg;
    el.hidden = !msg;
    $(`[data-field="${id}"]`).classList.toggle('is-invalid', !!msg);
    if (!msg) afterChange(id);
    else showError(true);
  }

  /** Après une modification : champs liés (ex. carburant → BSFC), puis recalcul. */
  function afterChange(id) {
    if (spec.onChange) {
      const patch = spec.onChange(id, { ...state }) || {};
      if (patch.__rerender) { delete patch.__rerender; Object.assign(state, patch); save(`sim:${NS}`, state); return rerender(); }
      for (const [k, v] of Object.entries(patch)) {
        state[k] = v;
        const inp = $(`#f-${k}`);
        if (inp && document.activeElement !== inp) inp.value = inp.tagName === 'SELECT' ? String(v) : displayValue(byId[k]);
      }
    }
    save(`sim:${NS}`, state);
    schedule();
  }

  let timer;
  function schedule() { clearTimeout(timer); timer = setTimeout(compute, 120); }

  function showError(on) { $('.sim__error').hidden = !on; root.querySelector('.sim__outputs').classList.toggle('is-stale', on); }

  /* ---------- Calcul et affichage ---------- */
  function compute() {
    if (Object.values(errors).some(Boolean)) return showError(true);
    showError(false);
    let r;
    try { r = spec.compute({ ...state }); } catch (e) { console.error(e); return showError(true); }
    lastResult = r;
    lastView = buildView(r);
    renderResults(lastView);
    renderTables(lastView.tables);
    renderCharts(lastView.charts);
  }

  function buildView(r) {
    return {
      cards: spec.results(r, ctx),
      notes: spec.notes ? spec.notes(r, ctx) : [],
      tables: spec.tables ? spec.tables(r, ctx) : [],
      charts: spec.charts ? spec.charts(r, ctx) : [],
    };
  }

  function cardValue(c) {
    if (c.text !== undefined) return c.text;
    return formatQ(c.q, c.value, { decimals: c.decimals, opts: c.opts });
  }
  function cardAlt(c) {
    if (!c.alt || !c.q || c.q.startsWith('u:')) return '';
    const u = altUnit(c.q);
    if (!u) return '';
    const v = fromBase(c.q, c.value, u, c.opts);
    const { symbol, decimals } = unitInfo(c.q, u);
    return `≈ ${fmt(v, { decimals: smartDecimals(v, decimals) })} ${symbol}`;
  }

  function renderResults(v) {
    $('.results').innerHTML = v.cards.map((c) => `
      <div class="result ${c.status ? 'is-' + c.status : ''} ${c.wide ? 'result--wide' : ''} ${c.text !== undefined && c.wide ? 'result--text' : ''}">
        <div class="result__label">${esc(c.label)}</div>
        <div class="result__value" dir="ltr">${esc(cardValue(c))}</div>
        ${cardAlt(c) ? `<div class="result__alt" dir="ltr">${esc(cardAlt(c))}</div>` : ''}
        ${c.note ? `<div class="result__note">${esc(c.note)}</div>` : ''}
      </div>`).join('');
    $('.sim__notes').innerHTML = v.notes.map((n) => `<p class="note is-${n.status || 'info'}">${esc(n.text)}</p>`).join('');
  }

  function renderTables(tables) {
    $('.sim__tables').innerHTML = tables.map((tb) => `
      <section class="panel">
        <h2 class="panel__title">${esc(tb.title)}</h2>
        ${tb.intro ? `<p class="hint">${esc(tb.intro)}</p>` : ''}
        <div class="table-wrap"><table class="table">
          <thead><tr>${tb.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>${tb.rows.map((row) => `<tr class="${row.status ? 'is-' + row.status : ''} ${row.highlight ? 'is-highlight' : ''}">${row.cells.map((c) => `<td dir="auto">${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>
      </section>`).join('');
  }

  async function renderCharts(specs) {
    const box = $('.sim__charts');
    const sameShape = charts.length === specs.length && box.children.length === specs.length;
    if (!sameShape) {
      charts.forEach((c) => c?.destroy());
      charts = [];
      box.innerHTML = specs.map((c, i) => `
        <section class="panel">
          <h2 class="panel__title">${esc(c.title)}</h2>
          <div class="chart"><canvas id="chart-${NS}-${i}" role="img" aria-label="${esc(c.title)}"></canvas></div>
        </section>`).join('');
    } else {
      specs.forEach((c, i) => { box.children[i].querySelector('.panel__title').textContent = c.title; });
    }
    if (!specs.length) return;
    const { renderChart } = await import('./chart.js');
    specs.forEach((c, i) => { charts[i] = renderChart(box.querySelector(`#chart-${NS}-${i}`), c, charts[i]); });
  }

  /* ---------- Actions ---------- */
  root.querySelector('.sim__actions').addEventListener('click', async (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (act === 'reset') {
      Object.assign(state, defaults);
      Object.keys(errors).forEach((k) => delete errors[k]);
      save(`sim:${NS}`, state);
      rerender();
    }
    if (act === 'share') share();
    if (act === 'pdf') pdf(e.target.closest('button'));
  });

  async function share() {
    const diff = Object.fromEntries(Object.entries(state).filter(([k, v]) => v !== defaults[k]));
    const url = `${location.href.split('#')[0]}#/outil/${NS}${Object.keys(diff).length ? '?v=' + encode(diff) : ''}`;
    const title = `French ECU — ${t(`modules.${NS}.title`)}`;
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch (err) { if (err.name === 'AbortError') return; }
    }
    try { await navigator.clipboard.writeText(url); toast(t('sim.link_copied')); } catch { prompt(title, url); }
  }

  async function pdf(btn) {
    if (!lastResult || Object.values(errors).some(Boolean)) return toast(t('sim.fix_inputs'));
    btn.disabled = true;
    toast(t('sim.pdf_generating'));
    try {
      const { chartImage } = await import('./chart.js');
      const { exportPdf } = await import('./pdf.js');
      const v = lastView;
      const inputs = spec.inputs.filter((f) => !f.hideInReport).map((f) => {
        if (f.type === 'select') {
          const all = (typeof f.options === 'function' ? f.options(ctx) : f.options).flatMap((o) => o.items || [o]);
          return [tt(`in.${f.id}`, f.labelParams?.(ctx)), all.find((o) => String(o.value) === String(state[f.id]))?.label ?? String(state[f.id])];
        }
        return [tt(`in.${f.id}`, f.labelParams?.(ctx)), formatQ(f.quantity, state[f.id], { decimals: f.decimals }) + (f.suffix ? `\u00A0${f.suffix(ctx)}` : '')];
      });
      const chartsImg = [];
      for (const c of v.charts) chartsImg.push({ title: c.title, img: await chartImage({ ...c, title: '' }) });
      const result = await exportPdf({
        title: t(`modules.${NS}.title`),
        fileBase: NS.replace(/_/g, '-'),
        inputs,
        results: v.cards.map((c) => ({ label: c.label, value: [cardValue(c), cardAlt(c)].filter(Boolean).join('  ·  '), note: c.note, status: c.status })),
        notes: v.notes,
        tables: v.tables,
        charts: chartsImg,
      });
      if (result === 'downloaded') toast(t('sim.pdf_ready'));
    } catch (err) {
      console.error(err);
      toast(t('sim.pdf_error'));
    } finally {
      btn.disabled = false;
    }
  }

  /* ---------- Redessiner (réinitialisation) — langue et unités sont gérées par app.js ---------- */
  function rerender() {
    const y = window.scrollY;
    root._simCleanup?.();
    mountSimulator(root, spec);
    window.scrollTo(0, y);
  }
  root._simCleanup = () => { charts.forEach((c) => c?.destroy()); charts = []; clearTimeout(timer); };

  compute();
}
