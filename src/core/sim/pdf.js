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
      ${report.inputs.map(([k, v], i) => `<tr style="background:${i % 2 ? '#f5f7fa' : '#fff'}"><td style="padding:5px 8px">${esc(k)}</td><td style="padding:5px 8px;text-align:end;font-weight:600" dir="auto">${esc(v)}</td></tr>`).join('')}
    </table>
    <h2 style="font-size:15px;margin:0 0 8px;color:#0b6e8a">${esc(t('sim.results'))}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px">
      ${report.results.map((r) => `
        <div style="border:1px solid #dfe4ec;border-inline-start:4px solid ${statusColor[r.status] || '#00a8cc'};border-radius:8px;padding:8px 10px">
          <div style="color:#5b6575;font-size:12px">${esc(r.label)}</div>
          <div style="font-size:17px;font-weight:800;color:${statusColor[r.status] || '#11161e'}" dir="auto">${esc(r.value)}</div>
          ${r.note ? `<div style="color:#5b6575;font-size:11.5px">${esc(r.note)}</div>` : ''}
        </div>`).join('')}
    </div>
    ${report.notes.map((n) => `<div style="padding:8px 10px;border-radius:8px;margin-bottom:8px;background:${n.status === 'danger' ? '#fdecea' : n.status === 'warn' ? '#fff4e0' : '#eaf6fb'}">${esc(n.text)}</div>`).join('')}
    ${report.tables.map((tb) => `
      <h2 style="font-size:15px;margin:14px 0 8px;color:#0b6e8a">${esc(tb.title)}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:12px">
        <tr>${tb.columns.map((c) => `<th style="text-align:start;padding:5px 8px;background:#0b6e8a;color:#fff">${esc(c)}</th>`).join('')}</tr>
        ${tb.rows.map((r) => `<tr>${r.cells.map((c, i) => `<td style="padding:5px 8px;border-bottom:1px solid #e6e9ef;${i === r.cells.length - 1 && r.status ? `color:${statusColor[r.status]};font-weight:700` : ''}${r.highlight ? 'background:#eaf6fb;' : ''}" dir="auto">${esc(c)}</td>`).join('')}</tr>`).join('')}
      </table>`).join('')}
    ${report.charts.map((c) => `
      <div style="break-inside:avoid;margin-top:14px">
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
    for (let y = 0, page = 0; y < canvas.height; y += sliceH, page++) {
      const part = document.createElement('canvas');
      part.width = canvas.width;
      part.height = Math.min(sliceH, canvas.height - y);
      part.getContext('2d').drawImage(canvas, 0, y, canvas.width, part.height, 0, 0, canvas.width, part.height);
      if (page > 0) pdf.addPage();
      pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW, part.height / pxPerPt);
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
