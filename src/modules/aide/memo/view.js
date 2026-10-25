/**
 * Aide-mémoire : fiches de référence (filetages, couples, freinage, capteurs…), recherche
 * instantanée et dépliage par rubrique. Textes dans locales/<langue>.json (espace « memo »).
 */
import { t, lang } from '../../../core/i18n.js';
import { getLanguage } from '../../../core/i18n-core.js';
import { esc } from '../../../core/ui.js';
import { MEMO } from './content.js';

const NUMERIC = /^[≈><λ ]*\d[\d.]*(\s*[–-]\s*\d[\d.]*)?(\s?(%|°C|V|bar|kPa|mm|N·m|°|A|g\/s))?$/;
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Texte d'une cellule : clé traduite, ou valeur littérale (nombres au format de la langue). */
function cellText(v, sep) {
  if (v.startsWith('@')) return t(`memo.${v.slice(1)}`);
  return sep !== '.' && NUMERIC.test(v) ? v.replace(/(\d)\.(\d)/g, `$1${sep}$2`) : v;
}

function blockHtml(b, sep) {
  if (b.type === 'table') {
    return `<div class="table-wrap"><table class="table table--wrap memo__table">
      <thead><tr>${b.columns.map((c) => `<th>${esc(cellText(c, sep))}</th>`).join('')}</tr></thead>
      <tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td dir="auto">${esc(cellText(c, sep))}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
  }
  if (b.type === 'list') return `<ul class="memo__list">${b.items.map((x) => `<li>${esc(cellText(x, sep))}</li>`).join('')}</ul>`;
  if (b.type === 'text') return `<p class="memo__text">${esc(cellText(b.text, sep))}</p>`;
  return `<p class="note is-${b.type === 'warn' ? 'warn' : 'info'}">${esc(cellText(b.text, sep))}</p>`;
}

export function mountMemo(root) {
  const sep = new Intl.NumberFormat(getLanguage(lang()).locale).format(1.5).replace(/\d/g, '') || '.';
  root.innerHTML = `
    <div class="memo">
      <p class="sim__intro">${esc(t('memo.ui.intro'))}</p>
      <div class="search memo__search">
        <input type="search" id="memo-search" placeholder="${esc(t('memo.ui.search'))}" aria-label="${esc(t('memo.ui.search'))}" autocomplete="off" />
      </div>
      <p class="hint" id="memo-empty" hidden>${esc(t('memo.ui.no_result'))}</p>
      ${MEMO.map((c) => `
        <details class="panel memo__cat" data-cat="${c.id}">
          <summary>
            <span class="memo__cat-title">${esc(t(`memo.${c.id}.title`))}</span>
            <span class="memo__count">${c.items.length}</span>
            <span class="memo__cat-desc">${esc(t(`memo.${c.id}.desc`))}</span>
          </summary>
          ${c.items.map((it) => `
            <section class="memo__item">
              <h3 class="memo__item-title">${esc(cellText(it.title, sep))}</h3>
              ${it.blocks.map((b) => blockHtml(b, sep)).join('')}
            </section>`).join('')}
        </details>`).join('')}
      <p class="hint memo__disclaimer">${esc(t('memo.ui.disclaimer'))}</p>
    </div>`;

  // Recherche : affiche les fiches qui contiennent le texte et ouvre leur rubrique.
  const cats = [...root.querySelectorAll('.memo__cat')];
  cats.forEach((d) => d.querySelectorAll('.memo__item').forEach((s) => { s.dataset.search = norm(s.textContent); }));
  root.querySelector('#memo-search').addEventListener('input', (e) => {
    const q = norm(e.target.value.trim());
    let any = false;
    cats.forEach((d) => {
      const head = norm(d.querySelector('summary').textContent);
      let n = 0;
      d.querySelectorAll('.memo__item').forEach((s) => {
        const ok = !q || head.includes(q) || s.dataset.search.includes(q);
        s.hidden = !ok;
        if (ok) n++;
      });
      d.hidden = n === 0;
      d.open = !!q && n > 0;
      if (n) any = true;
    });
    root.querySelector('#memo-empty').hidden = any;
  });
}
