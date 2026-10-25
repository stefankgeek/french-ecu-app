/**
 * Graphiques (Chart.js) adaptés au mobile — corrige les défauts de l'ancien site :
 *  - hauteur minimale garantie (plus de graphiques écrasés à 80 px sur téléphone) ;
 *  - légendes et axes lisibles (contraste suffisant, pas de texte noir sur fond noir) ;
 *  - étiquettes horizontales espacées automatiquement (plus de texte coupé en diagonale) ;
 *  - nombres au format de la langue ; thème clair pour l'export PDF.
 */
import { Chart, registerables } from 'chart.js';
import { lang } from '../i18n.js';
import { getLanguage } from '../i18n-core.js';

Chart.register(...registerables);

export const PALETTE = ['#00d4ff', '#feca57', '#ff6b6b', '#4ecdc4', '#a78bfa', '#34c759', '#ff9f0a'];

const THEMES = {
  dark: { text: '#b7c0cf', title: '#e6ebf2', grid: 'rgba(255,255,255,.08)', bg: 'transparent' },
  light: { text: '#3b4454', title: '#11161e', grid: 'rgba(0,0,0,.08)', bg: '#ffffff' },
};

/**
 * Construit la configuration Chart.js finale.
 * @param {object} spec { type, labels, datasets:[{label,data,color?,dashed?,fill?}], xTitle, yTitle, yLog?, stacked? , title? }
 */
export function buildConfig(spec, theme = 'dark') {
  const th = THEMES[theme];
  const locale = getLanguage(lang()).locale;
  const isBar = spec.type === 'bar';
  const isDoughnut = spec.type === 'doughnut';
  const datasets = spec.datasets.map((d, i) => {
    const c = d.color || PALETTE[i % PALETTE.length];
    const colors = d.colors || null;
    return {
      label: d.label,
      data: d.data,
      borderColor: colors || c,
      backgroundColor: colors || (isBar ? c + 'cc' : d.fill ? c + '22' : c),
      borderWidth: isBar ? 0 : 2.5,
      borderRadius: isBar ? 6 : 0,
      borderDash: d.dashed ? [6, 4] : undefined,
      fill: !!d.fill,
      tension: 0.3,
      pointRadius: spec.points === false ? 0 : 2.5,
      pointHoverRadius: 5,
      yAxisID: d.axis || 'y',
    };
  });
  const scale = (title, extra = {}) => ({
    title: { display: !!title, text: title, color: th.text, font: { size: 12, weight: '600' } },
    ticks: { color: th.text, font: { size: 11 }, maxRotation: 0, autoSkip: true, autoSkipPadding: 10 },
    grid: { color: th.grid },
    border: { color: th.grid },
    ...extra,
  });
  // Barres : toutes les étiquettes affichées, coupées sur plusieurs lignes si besoin (jamais masquées)
  const wrap = (l) => {
    const words = String(l).split(' ');
    const lines = [];
    for (const w of words) {
      if (lines.length && (lines[lines.length - 1] + ' ' + w).length <= 12) lines[lines.length - 1] += ' ' + w;
      else lines.push(w);
    }
    return lines.length > 1 ? lines : l;
  };
  const labels = isBar ? spec.labels.map(wrap) : spec.labels;
  const xExtra = isBar ? { ticks: { color: th.text, font: { size: 11 }, maxRotation: 0, autoSkip: false } } : {};
  const scales = isDoughnut ? {} : {
    x: scale(spec.xTitle, { ...(spec.xType ? { type: spec.xType } : {}), ...xExtra }),
    y: scale(spec.yTitle, { type: spec.yLog ? 'logarithmic' : 'linear', beginAtZero: spec.beginAtZero ?? isBar }),
  };
  if (spec.y2Title) scales.y2 = scale(spec.y2Title, { position: 'right', grid: { drawOnChartArea: false } });
  return {
    type: spec.type || 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: theme === 'light' ? false : { duration: 350 },
      locale,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: 4 },
      plugins: {
        legend: {
          display: spec.legend ?? (datasets.length > 1 || isDoughnut),
          position: 'bottom',
          rtl: document.documentElement.dir === 'rtl',
          labels: { color: th.text, font: { size: 12 }, boxWidth: 12, boxHeight: 12, usePointStyle: true, padding: 14 },
        },
        title: { display: !!spec.title && theme === 'light', text: spec.title, color: th.title, font: { size: 14, weight: '700' } },
        tooltip: { rtl: document.documentElement.dir === 'rtl' },
      },
      scales,
    },
  };
}

/** Crée (ou remplace) un graphique dans un canvas. */
export function renderChart(canvas, spec, previous) {
  previous?.destroy();
  return new Chart(canvas, buildConfig(spec, 'dark'));
}

/** Image PNG (thème clair) d'un graphique, pour le PDF. */
export async function chartImage(spec, width = 900, height = 420) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  canvas.style.cssText = `width:${width}px;height:${height}px;position:fixed;left:-10000px;top:0`;
  const box = document.createElement('div');
  box.style.cssText = `width:${width}px;height:${height}px;position:fixed;left:-10000px;top:0`;
  box.appendChild(canvas);
  document.body.appendChild(box);
  const cfg = buildConfig(spec, 'light');
  cfg.options.responsive = false;
  cfg.options.devicePixelRatio = 2;
  cfg.plugins = [{ id: 'bg', beforeDraw: (c) => { const x = c.ctx; x.save(); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.restore(); } }];
  const chart = new Chart(canvas, cfg);
  const url = chart.toBase64Image('image/png');
  chart.destroy();
  box.remove();
  return url;
}
