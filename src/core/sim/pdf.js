/**
 * Export PDF d'un calcul — fonctionne entièrement sur le téléphone (aucun serveur).
 *
 * Méthode : on construit un rapport HTML (thème clair, format A4), on le photographie
 * (html2canvas) puis on le place dans un PDF (jsPDF). Avantage : toutes les langues
 * s'affichent correctement, y compris l'arabe et le polonais, sans police à embarquer.
 * Ensuite : partage natif (téléphone) ou téléchargement (PC).
 */
import { t, lang } from '../i18n.js';
import { getLanguage } from '../i18n-core.js';
import { esc } from '../ui.js';

const A4_W = 794; // largeur A4 en px à 96 dpi

/**
 * @param {{title:string, subtitle?:string, inputs:[string,string][], results:{label:string,value:string,note?:string,status?:string}[],
 *          tables:{title:string, columns:string[], rows:{cells:string[], status?:string}[]}[], notes:{text:string,status?:string}[],
 *          charts:{title:string, img:string}[], fileBase:string}} report
 */
export async function exportPdf(report) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([import('jspdf'), import('html2canvas')]);
  const dir = document.documentElement.dir;
  const locale = getLanguage(lang()).locale;
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
  const logo = `${import.meta.env.BASE_URL}icons/icon-192.png`;

  const statusColor = { ok: '#1a7f4b', warn: '#a86300', danger: '#c62828' };

  /** Tableau ; une table de calculateur trop large est coupée en blocs de colonnes (axe répété). */
  const MAX_COLS = 17;
  const cellOf = (c) => (c && typeof c === 'object' ? c : { v: c });
  function tableHtml(tb) {
    const n = tb.columns.length;
    const chunks = [];
    if (tb.grid && n > MAX_COLS) {
      for (let a = 1; a < n; a += MAX_COLS - 1) chunks.push([0, ...Array.from({ length: Math.min(MAX_COLS - 1, n - a) }, (_, k) => a + k)]);
    } else chunks.push(tb.columns.map((_, i) => i));
    const fs = tb.grid ? 10 : 12;
    const pad = tb.grid ? '3px 2px' : '5px 8px';
    return chunks.map((cols, ci) => `
      <div data-block="title" style="break-inside:avoid">
        <h2 style="font-size:15px;margin:14px 0 8px;color:#0b6e8a">${esc(tb.title)}${chunks.length > 1 ? ` (${ci + 1}/${chunks.length})` : ''}</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:${fs}px" ${tb.grid ? 'dir="ltr"' : ''}>
        <tr data-block>${cols.map((i) => `<th style="text-align:${tb.grid ? 'center' : 'start'};padding:${pad};background:#0b6e8a;color:#fff">${esc(tb.columns[i])}</th>`).join('')}</tr>
        ${tb.rows.map((r) => `<tr data-block>${cols.map((i) => {
          const c = cellOf(r.cells[i]);
          const st = i === r.cells.length - 1 && r.status ? `color:${statusColor[r.status]};font-weight:700;` : '';
          const bg = c.bg ? `background:${c.bg};` : r.highlight ? 'background:#eaf6fb;' : '';
          return `<td style="padding:${pad};border:${tb.grid ? '1px solid #cfd6e0' : '0'};border-bottom:1px solid #e6e9ef;${tb.grid ? 'text-align:center;' : ''}${st}${bg}" dir="auto">${esc(c.v)}</td>`;
        }).join('')}</tr>`).join('')}
      </table>`).join('');
  }
  const root = document.createElement('div');
  root.dir = dir;
  root.lang = document.documentElement.lang;
  root.style.cssText = `position:fixed;left:-20000px;top:0;width:${A4_W}px;background:#fff;color:#11161e;font:13px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,'Noto Sans','Noto Sans Arabic',Tahoma,sans-serif;padding:36px 40px;box-sizing:border-box`;
  root.innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;border-bottom:3px solid #00a8cc;padding-bottom:12px;margin-bottom:18px">
      <img src="${logo}" width="48" height="48" style="border-radius:10px" crossorigin="anonymous"/>
      <div style="flex:1">
        <div style="font-size:20px;font-weight:800">${esc(report.title)}</div>
        <div style="color:#5b6575">French ECU · ${esc(t('sim.report_title'))} · ${esc(date)}</div>
      </div>
    </div>
    <h2 style="font-size:15px;margin:0 0 8px;color:#0b6e8a">${esc(t('sim.inputs'))}</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:18px">
      ${report.inputs.map(([k, v], i) => `<tr data-block style="background:${i % 2 ? '#f5f7fa' : '#fff'}"><td style="padding:5px 8px">${esc(k)}</td><td style="padding:5px 8px;text-align:end;font-weight:600" dir="auto">${esc(v)}</td></tr>`).join('')}
    </table>
    <h2 style="font-size:15px;margin:0 0 8px;color:#0b6e8a">${esc(t('sim.results'))}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px">
      ${report.results.map((r) => `
        <div data-block style="border:1px solid #dfe4ec;border-inline-start:4px solid ${statusColor[r.status] || '#00a8cc'};border-radius:8px;padding:8px 10px">
          <div style="color:#5b6575;font-size:12px">${esc(r.label)}</div>
          <div style="font-size:17px;font-weight:800;color:${statusColor[r.status] || '#11161e'}" dir="auto">${esc(r.value)}</div>
          ${r.note ? `<div style="color:#5b6575;font-size:11.5px">${esc(r.note)}</div>` : ''}
        </div>`).join('')}
    </div>
    ${report.notes.map((n) => `<div data-block style="padding:8px 10px;border-radius:8px;margin-bottom:8px;background:${n.status === 'danger' ? '#fdecea' : n.status === 'warn' ? '#fff4e0' : '#eaf6fb'}">${esc(n.text)}</div>`).join('')}
    ${report.tables.map(tableHtml).join('')}
    ${report.charts.map((c) => `
      <div data-block style="break-inside:avoid;margin-top:14px">
        <div style="font-weight:700;margin-bottom:4px">${esc(c.title)}</div>
        <img src="${c.img}" style="width:100%;border:1px solid #e6e9ef;border-radius:8px"/>
      </div>`).join('')}
    <p style="margin-top:20px;color:#7a8494;font-size:11px">${esc(t('sim.disclaimer'))}</p>`;
  document.body.appendChild(root);
  await Promise.all([...root.querySelectorAll('img')].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));

  try {
    const canvas = await html2canvas(root, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
    const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const pxPerPt = canvas.width / pageW;
    const sliceH = Math.floor(pageH * pxPerPt);
    // Coupures de page : jamais au milieu d'une ligne de tableau, d'une carte ou d'un graphique.
    const scale = canvas.width / root.offsetWidth;
    const top0 = root.getBoundingClientRect().top;
    const blocks = [...root.querySelectorAll('[data-block]')].map((el) => {
      const r = el.getBoundingClientRect();
      // Un titre de tableau reste avec ses premières lignes (pas de titre seul en bas de page)
      const extra = el.dataset.block === 'title' ? 110 : 0;
      return { top: Math.round((r.top - top0) * scale), bottom: Math.round((r.bottom - top0 + extra) * scale) };
    });
    const MARGIN = Math.round(24 * pxPerPt); // marge haute des pages suivantes
    let y = 0;
    for (let page = 0; y < canvas.height; page++) {
      const room = page === 0 ? sliceH : sliceH - MARGIN;
      let end = Math.min(y + room, canvas.height);
      if (end < canvas.height) {
        // Un bloc coupé par la limite ? on s'arrête juste avant lui (s'il n'occupe pas toute la page).
        const cut = blocks.find((b) => b.top < end && b.bottom > end && b.top > y + room * 0.3);
        if (cut) end = cut.top;
      }
      const part = document.createElement('canvas');
      part.width = canvas.width;
      part.height = end - y;
      const g = part.getContext('2d');
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, part.width, part.height);
      g.drawImage(canvas, 0, y, canvas.width, part.height, 0, 0, canvas.width, part.height);
      if (page > 0) pdf.addPage();
      pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', 0, page === 0 ? 0 : MARGIN / pxPerPt, pageW, part.height / pxPerPt);
      y = end;
    }
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `french-ecu-${report.fileBase}-${stamp}.pdf`;
    const blob = pdf.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: report.title }); return 'shared'; } catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
    }
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: fileName });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return 'downloaded';
  } finally {
    root.remove();
  }
}
