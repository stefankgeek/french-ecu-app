# Génère src/modules/aide/memo/content.js et locales/fr.json depuis source_fr.py (python3 scripts/memo/gen.py).
# Après modification du français, mettre à jour les 9 autres langues (même ordre de clés).
import json,re,importlib.util,sys
spec=importlib.util.spec_from_file_location('s',__import__('os').path.join(__import__('os').path.dirname(__file__),'source_fr.py'));S=importlib.util.module_from_spec(spec);spec.loader.exec_module(S)
fr={}
def put(path,val):
    d=fr
    for p in path[:-1]: d=d.setdefault(p,{})
    d[path[-1]]=val
def cell(v,path):
    if v.startswith('='): return v[1:]
    if v.startswith('~'):
        put(path,v[1:]); return '@'+'.'.join(path)
    if re.search(r'[a-zà-ÿœ]{3,}',v):
        put(path,v); return '@'+'.'.join(path)
    return v
cats=[]
for cid,title,desc,items in S.CATS:
    put([cid,'title'],title); put([cid,'desc'],desc)
    c={'id':cid,'items':[]}
    for n,(it,blocks) in enumerate(items,1):
        ip=[cid,f'i{n}']
        put(ip+['title'],it)
        bl=[]
        for b,blk in enumerate(blocks,1):
            bp=ip+[f'b{b}']
            k=list(blk)[0]; v=blk[k]
            if k=='table':
                bl.append({'type':'table','columns':[cell(x,bp+[f'h{j}']) for j,x in enumerate(v['columns'],1)],
                  'rows':[[cell(x,bp+[f'r{r}c{j}']) for j,x in enumerate(row,1)] for r,row in enumerate(v['rows'],1)]})
            elif k=='list':
                bl.append({'type':'list','items':[cell(x,bp+[f'l{j}']) for j,x in enumerate(v,1)]})
            else:
                bl.append({'type':k,'text':cell(v,bp+['t'])})
        c['items'].append({'title':'@'+'.'.join(ip+['title']),'blocks':bl})
    cats.append(c)
for k,v in S.UI.items(): put(['ui',k],v)
out=__import__('os').path.join(__import__('os').path.dirname(__file__),'../../src/modules/aide/memo/')
open(out+'content.js','w').write("""/**
 * Aide-mémoire — structure (indépendante de la langue).
 * "@cle" = texte traduit (fichiers locales/<langue>.json, espace « memo ») ; sinon valeur littérale
 * (code, abréviation, nombre) affichée telle quelle dans toutes les langues.
 * Contenu repris de l'ancien site (pages/memo.php), vérifié et corrigé le 25/10/2026 :
 * trous de passage (ISO 273), forets STI M10/M12, couples 8.8/10.9/12.9 (VDI 2230, µ 0,14),
 * code couleur des frein-filets, DOT 5.1, test de sonde lambda, réglage de clé dynamométrique,
 * ordre de serrage de culasse (le schéma numéroté sans figure a été remplacé par la méthode),
 * pression d'injection directe, abréviations de capteurs (FPR = régulateur, pas capteur),
 * lignes de capteurs inventées ou en double supprimées.
 */
export const MEMO = """+json.dumps(cats,ensure_ascii=False,indent=1)+";\n")
json.dump(fr,open(out+'locales/fr.json','w'),ensure_ascii=False,indent=2)
def count(d): return sum(count(v) if isinstance(v,dict) else 1 for v in d.values())
print('strings',count(fr), 'chars',len(json.dumps(fr,ensure_ascii=False)))
