/**
 * Contrôle des traductions — lancé automatiquement avant chaque publication (npm run build).
 * Bloque la publication si :
 *  - une clé existe en français mais manque dans une autre langue (ou l'inverse) ;
 *  - une variable {xxx} diffère entre le français et la traduction ;
 *  - un pluriel n'a pas toutes les formes exigées par la langue (ex. polonais, arabe).
 * Référence : le français.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { LANGUAGES } from '../src/core/i18n-core.js';

const REF = 'fr';
const codes = LANGUAGES.map((l) => l.code);
const errors = [];

/** Liste des dossiers de traductions : textes communs + chaque module. */
function localeDirs() {
  const dirs = [['commun', 'src/locales', (c) => `${c}.json`]];
  const root = 'src/modules';
  for (const group of readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const mod of readdirSync(join(root, group.name), { withFileTypes: true }).filter((d) => d.isDirectory())) {
      const dir = join(root, group.name, mod.name, 'locales');
      if (existsSync(dir)) dirs.push([`${group.name}/${mod.name}`, dir, (c) => `${c}.json`]);
    }
  }
  return dirs;
}

const isPlural = (v) => v && typeof v === 'object' && 'other' in v;
function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !isPlural(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}
const vars = (v) => [...new Set(JSON.stringify(v).match(/\{\w+\}/g) || [])].sort().join(',');

for (const [label, dir, file] of localeDirs()) {
  const read = (c) => {
    const p = join(dir, file(c));
    if (!existsSync(p)) { errors.push(`[${label}] fichier manquant : ${p}`); return null; }
    try { return flatten(JSON.parse(readFileSync(p, 'utf8'))); } catch (e) { errors.push(`[${label}] JSON invalide : ${p} (${e.message})`); return null; }
  };
  const ref = read(REF);
  if (!ref) continue;
  for (const code of codes.filter((c) => c !== REF)) {
    const d = read(code);
    if (!d) continue;
    for (const k of Object.keys(ref)) {
      if (!(k in d)) { errors.push(`[${label}] ${code} : clé manquante "${k}"`); continue; }
      if (vars(ref[k]).replace('{count}', '') !== vars(d[k]).replace('{count}', '')) errors.push(`[${label}] ${code} : variables différentes pour "${k}"`);
      if (isPlural(ref[k]) !== isPlural(d[k])) errors.push(`[${label}] ${code} : "${k}" doit être un pluriel`);
      if (isPlural(d[k])) {
        const locale = LANGUAGES.find((l) => l.code === code).locale;
        for (const cat of new Intl.PluralRules(locale).resolvedOptions().pluralCategories) {
          if (!(cat in d[k])) errors.push(`[${label}] ${code} : forme de pluriel "${cat}" manquante pour "${k}"`);
        }
      }
      if (typeof d[k] === 'string' && !d[k].trim()) errors.push(`[${label}] ${code} : texte vide pour "${k}"`);
    }
    for (const k of Object.keys(d)) if (!(k in ref)) errors.push(`[${label}] ${code} : clé en trop "${k}" (absente du français)`);
  }
}

if (errors.length) {
  console.error(`✖ Traductions : ${errors.length} problème(s)\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log(`✔ Traductions complètes (${codes.length} langues)`);
