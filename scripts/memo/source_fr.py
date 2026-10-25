# Contenu de l'aide-mémoire (français, corrigé). Règles :
#  - chaîne contenant un mot en minuscules (≥ 3 lettres) → texte traduisible
#  - chaîne commençant par "=" → littéral (code, abréviation, valeur), jamais traduit
T=lambda cols,rows:{'table':{'columns':cols,'rows':rows}}
Lst=lambda *x:{'list':list(x)}
P=lambda x:{'text':x}
N=lambda x:{'note':x}
W=lambda x:{'warn':x}
H=lambda x:{'heading':x}
CATS=[
 ('threads','Filetages métriques ISO','Pas, perçages avant taraudage, trous de passage, tolérances et longueurs en prise.',[
  ('Pas métriques ISO — pas gros et pas fin',[T(['Désignation','~Pas (mm)','Série','Classe','Usage'],[
    ['M3x0.5','0.5','gros','6g/6H','petite visserie, électronique'],
    ['M4x0.7','0.7','gros','6g/6H','colliers, petites fixations'],
    ['M5x0.8','0.8','gros','6g/6H','carrosserie, accessoires'],
    ['M6x1.0','1.0','gros','6g/6H','mécanique générale'],
    ['M8x1.25','1.25','gros','6g/6H','supports, sous-ensembles'],
    ['M10x1.5','1.5','gros','6g/6H','moteur, châssis'],
    ['M12x1.75','1.75','gros','6g/6H','suspension, fixations moyennes'],
    ['M14x2.0','2.0','gros','6g/6H','châssis lourd'],
    ['M6x0.75','0.75','fin','6g/6H','assemblages soumis aux vibrations'],
    ['M8x1.0','1.0','fin','6g/6H','assemblages soumis aux vibrations'],
    ['M10x1.25','1.25','fin','6g/6H','biellettes, automobile'],
    ['M12x1.5','1.5','fin','6g/6H','suspension, rotules, goujons de roue'],
  ])]),
  ('Perçage avant taraudage (≈ 75 % de filet)',[P('Règle : perçage ≈ diamètre nominal − pas (filetage métrique ISO).'),T(['Désignation','~Pas (mm)','Foret (mm)'],[
    ['M3x0.5','0.5','2.5'],['M4x0.7','0.7','3.3'],['M5x0.8','0.8','4.2'],['M6x1.0','1.0','5.0'],['M8x1.25','1.25','6.8'],
    ['M10x1.5','1.5','8.5'],['M12x1.75','1.75','10.2'],['M14x2.0','2.0','12.0'],['M10x1.25','1.25','8.8'],['M12x1.5','1.5','10.5']])]),
  ('Trous de passage (ISO 273)',[T(['Filetage','~Fin (mm)','Moyen (mm)','Large (mm)'],[
    ['M3','3.2','3.4','3.6'],['M4','4.3','4.5','4.8'],['M5','5.3','5.5','5.8'],['M6','6.4','6.6','7.0'],
    ['M8','8.4','9.0','10.0'],['M10','10.5','11.0','12.0'],['M12','13.0','13.5','14.5']]),
   N('Fin : centrage précis. Moyen : montage courant. Large : rattrapage de position. Trou oblong si un réglage est nécessaire.')]),
  ('Tolérances et longueur en prise',[Lst('Vis : classe de tolérance 6g ; taraudages et écrous : 6H.','Longueur en prise dans l\'acier : 1 à 1,5 × D.','Dans l\'aluminium : 1,5 à 2 × D.','Dans la fonte : 1 à 1,5 × D.'),
   N('Le pas fin résiste mieux au desserrage sous vibrations mais grippe plus facilement. Toujours chanfreiner l\'entrée (≈ 0,5 × pas) et ébavurer avant de tarauder.')]),
 ]),
 ('inserts','Inserts filetés (hélicoïdaux)','Réparation de filets : forets et tarauds STI, longueurs, pose et matériaux.',[
  ('Foret et taraud STI',[T(['Filet réparé','Foret STI (mm)','Taraud','Longueurs d\'insert'],[
    ['M5x0.8','5.2','=M5x0.8 STI','=1D · 1.5D · 2D'],['M6x1.0','6.3','=M6x1.0 STI','=1D · 1.5D · 2D · 3D'],['M8x1.25','8.4','=M8x1.25 STI','=1D · 1.5D · 2D'],
    ['M10x1.5','10.5','=M10x1.5 STI','=1D · 1.5D · 2D'],['M12x1.75','12.5','=M12x1.75 STI','=1D · 1.5D · 2D'],['M14x1.25','14.3','=M14x1.25 STI','=1D · 1.5D'],]),
   N('STI = Screw Thread Insert. Foret ≈ diamètre nominal + ¼ du pas (arrondi au foret courant) ; vérifiez la notice du kit. Le M14x1.25 correspond aux puits de bougie.')]),
  ('Pose d\'un insert hélicoïdal',[Lst('Percer au diamètre STI, bien perpendiculaire.','Tarauder avec le taraud STI, lubrifié, en revenant d\'un demi-tour pour casser le copeau.','Souffler et nettoyer le taraudage.','Visser l\'insert avec l\'outil de pose jusqu\'à ¼ à ½ tour sous la surface.','Casser l\'ergot d\'entraînement au chasse-goupille (inserts à ergot).','Contrôler avec une vis : elle doit entrer sans point dur.'),
   W('Insert inox dans de l\'aluminium : appliquer une pâte anti-corrosion pour éviter la corrosion galvanique. Ne pas déposer et reposer un insert : il est prévu pour une pose définitive.')]),
  ('Matériaux d\'inserts',[T(['Matériau','Usage'],[['inox A2 (1.4301)','usage général, corrosion modérée'],['inox A4 (1.4401)','milieu corrosif, marin'],['bronze phosphoreux','haute température, anti-grippage'],['inox avec frein (Screwlock)','vis soumises aux vibrations']])]),
 ]),
 ('torque','Couples de serrage génériques','Couples indicatifs par diamètre et classe de vis acier (filet métrique gros, coefficient de frottement ≈ 0,14).',[
  ('Vis acier classe 8.8',[T(['Filetage','~Sec (N·m)','Huilé (N·m)'],[['M5','6','5'],['M6','10','8.5'],['M8','25','21'],['M10','49','42'],['M12','85','72'],['M14','135','115'],['M16','210','180']])]),
  ('Vis acier classe 10.9',[T(['Filetage','~Sec (N·m)','Huilé (N·m)'],[['M6','15','13'],['M8','36','31'],['M10','72','61'],['M12','125','105'],['M14','200','170'],['M16','310','265']])]),
  ('Vis acier classe 12.9',[T(['Filetage','~Sec (N·m)','Huilé (N·m)'],[['M6','18','15'],['M8','43','36'],['M10','84','71'],['M12','145','125'],['M14','235','200'],['M16','365','310']]),
   N('Une vis huilée demande MOINS de couple pour la même tension. Pâte MoS₂ ou cuivre : réduire encore de 15 à 25 %. La notice du constructeur reste prioritaire, surtout pour les vis à serrage angulaire.')]),
  ('Vis dans l\'aluminium ou le magnésium',[Lst('Réduire le couple de 20 à 30 % par rapport à l\'acier.','Longueur en prise : 1,5 à 2 × D.','Pour les efforts importants, prévoir un insert hélicoïdal ou un goujon.')]),
 ]),
 ('engine_tightening','Serrages moteur','Culasse, collecteurs, volant moteur et jeux aux soupapes.',[
  ('Serrage de culasse (méthode générale)',[Lst('Ordre : en spirale, du centre vers l\'extérieur, en alternant gauche et droite.','Vis propres, filets et portées légèrement huilés si le constructeur le prescrit.','Pré-serrage en séquence (exemple courant M10 : 20 à 40 N·m).','Serrage angulaire en séquence (exemple courant : 90° puis 90°).','Vis à serrage angulaire (étirables) : toujours neuves.'),
   W('Exemple indicatif seulement : les couples et angles dépendent du moteur. Suivez toujours la notice constructeur.')]),
  ('Collecteur d\'échappement',[T(['Assemblage','Couple (N·m)'],[['goujon acier dans fonte ou acier','22–28'],['goujon acier dans aluminium','18–24']]),N('Serrer du centre vers l\'extérieur. Remplacer les écrous autobloquants (cuivrés) déposés. Recontrôler après le premier cycle de chauffe.')]),
  ('Volant moteur (exemples)',[T(['~Vis','Classe','Couple + angle'],[['M10','10.9','=45–60 N·m + 90°'],['M12','10.9','=60–80 N·m + 90°'],['M12','12.9','=80–100 N·m + 90°']]),N('Vis neuves, frein-filet si prescrit, serrage en croix.')]),
  ('Jeux aux soupapes (moteur froid, ordre de grandeur)',[T(['Soupape','~Jeu (mm)'],[['admission','0.15–0.25'],['échappement','0.25–0.35']]),N('Valeur exacte : documentation du moteur. Jeu trop faible = soupape qui ne ferme plus et brûle ; jeu trop grand = bruit et perte de levée.')]),
 ]),
 ('wheels','Roues et pneumatiques','Couples de roue, portées d\'écrous et indices de charge.',[
  ('Couples de roue (ordre de grandeur)',[T(['Goujon / vis','Jante acier (N·m)','Jante alu (N·m)','Remarque'],[
    ['M12x1.25 / 1.5','95–120','110–130','serrer en croix, recontrôler après 50 à 100 km'],['M14x1.25 / 1.5','110–140','120–150','filets propres et secs sauf prescription'],['=1/2"-20 UNF','95–120','110–130','vérifier la valeur du véhicule']])]),
  ('Portées d\'écrous et vis de roue',[Lst('Conique 60° : la plus courante.','Sphérique (rayon) : VW, Audi, Mercedes, Honda…','Plate avec rondelle : certaines jantes alliage.'),W('La portée de l\'écrou doit correspondre exactement au siège de la jante. Longueur en prise minimale : 1 × D (6 à 8 tours).')]),
  ('Indices de charge (extrait)',[T(['Indice','Charge par pneu (kg)'],[['82','475'],['85','515'],['88','560'],['91','615'],['94','670'],['98','750'],['102','850'],['105','925']])]),
  ('Indices de vitesse',[T(['Symbole','Vitesse maxi (km/h)'],[['=T','190'],['=H','210'],['=V','240'],['=W','270'],['=Y','300'],['=(Y)','> 300']])]),
 ]),
 ('brakes','Freinage','Liquides de frein, couples, usures minimales.',[
  ('Liquides de frein (points d\'ébullition minimaux, norme FMVSS 116)',[T(['Type','~Sec (°C)','Humide (°C)','Usage'],[
    ['DOT 3','205','140','véhicules anciens'],['DOT 4','230','155','standard ABS / ESP'],['DOT 5.1','260','180','performance, compatible DOT 4'],['DOT 5 (silicone)','260','180','collection, non miscible avec les autres']]),
   N('Le liquide absorbe l\'humidité : purge tous les 2 ans. Ne jamais mélanger le DOT 5 (silicone) avec les liquides glycol.')]),
  ('Couples de freinage (ordre de grandeur)',[T(['Élément','Couple (N·m)'],[['vis de coulisseau d\'étrier','25–35'],['support d\'étrier sur le moyeu','80–110'],['vis de maintien du disque','10–15'],['raccord de flexible (banjo M10)','15–20']])]),
  ('Usures minimales',[Lst('Plaquettes : remplacer à 2–3 mm de garniture.','Disques : épaisseur minimale gravée sur le disque (souvent 1 à 2 mm de moins que neuf).','Toujours remplacer par essieu complet.'),N('Un léger rainurage du disque est acceptable ; voile, fissures ou bourrelet important : remplacer.')]),
 ]),
 ('coolant','Liquide de refroidissement','Familles de liquides, compatibilités et précautions.',[
  ('Familles de liquides',[T(['Famille','Chimie','Couleur usuelle','Remarque'],[
    ['=IAT','inorganique (silicates)','vert / bleu','moteurs anciens, renouvellement fréquent'],['=OAT','organique (carboxylates)','orange / rouge','longue durée'],['=HOAT','hybride','jaune / bleu-vert','très répandu'],['=Si-OAT (G12+, G13)','silicates + organique','rose / violet','VW / Audi récents']]),
   W('La couleur ne suffit pas pour identifier un liquide : suivez la norme du constructeur.')]),
  ('Compatibilités (indicatif)',[Lst('VW / Audi : G12+ / G12++ / G13 (Si-OAT).','BMW / Mercedes : HOAT (type G48, MB 325.x).','PSA / Renault : OAT ou HOAT selon l\'année (voir le manuel).'),N('Changement de famille : rincer à l\'eau déminéralisée. Ne pas mélanger G11 (silicates) et G12 (OAT).')]),
 ]),
 ('electrical','Électricité','Fusibles, bornes, sections de câbles, batterie et alternateur.',[
  ('Fusibles (exemples d\'usage)',[T(['Calibre','Usage typique'],[['=5 A','calculateur, capteurs'],['=10 A','éclairage, audio'],['=15 A','pompe à essence'],['=20 A','lève-vitres'],['=30 A','dégivrage, ventilateur']])]),
  ('Couples de bornes',[T(['Élément','Couple (N·m)'],[['borne de batterie M6','5–7'],['borne de batterie M8','10–12'],['borne B+ d\'alternateur M8','12–15']])]),
  ('Section de câble en 12 V (longueur courte, < 3 m)',[T(['Courant (A)','Section mini (mm²)'],[['5','0.5'],['10','1.0'],['15','1.5'],['25','2.5'],['40','6'],['60','10'],['100','25']]),N('Longueur plus grande : prendre la section au-dessus (chute de tension maxi conseillée : 3 %).')]),
  ('Batterie et charge',[T(['Mesure','Valeur normale','Si anomalie'],[
    ['batterie au repos','~12,6 V (100 %) · 12,2 V (50 %)','recharger ; sous 12,0 V = déchargée'],['tension au démarrage','> 9.5 V','tester batterie et démarreur'],['moteur tournant','13.8–14.7 V','contrôler alternateur et courroie']])]),
 ]),
 ('diagnostics','Diagnostic et OBD','Codes OBD courants et tests rapides.',[
  ('Codes OBD II courants',[T(['Code','Signification','Causes probables','Contrôle rapide'],[
    ['=P0300','ratés d\'allumage multiples','bougies, bobines, injecteurs, prise d\'air','compteurs de ratés en direct, test d\'étincelle'],
    ['=P0171','mélange trop pauvre (banc 1)','prise d\'air, débitmètre, pression d\'essence faible','corrections STFT / LTFT, test fumigène'],
    ['=P0172','mélange trop riche (banc 1)','injecteur qui fuit, régulateur, débitmètre','pression d\'essence, corrections'],
    ['=P0420','efficacité du catalyseur trop faible','catalyseur usé, sonde aval, fuite d\'échappement','comparer sondes amont et aval'],
    ['=P0106','capteur MAP : plage / performance','capteur, durite, alimentation 5 V','tension du capteur, test de dépression'],
    ['=P0335','capteur de vilebrequin','capteur, faisceau, cible','signal à l\'oscilloscope'],
    ['=P0234','surpression turbo','wastegate bloquée, commande de pression','journal de pression, wastegate']])]),
  ('Test de la sonde lambda amont (à bande étroite)',[Lst('Moteur chaud, boucle fermée : la tension oscille entre 0,1 et 0,9 V environ.','Créer une prise d\'air (débrancher une petite durite de dépression) : la sonde passe pauvre (≈ 0,1 V) et la correction STFT augmente.','Enrichir (un peu de nettoyant carburateur à l\'admission) : la sonde passe riche (≈ 0,9 V).','Une bonne sonde bascule en moins de 100 à 150 ms.'),N('Sonde large bande : lire λ ou l\'AFR dans le calculateur, pas une tension.')]),
 ]),
 ('tools','Outillage et méthodes','Clé dynamométrique, serrage angulaire, frein-filet et conversions.',[
  ('Clé dynamométrique',[Lst('Faire contrôler l\'étalonnage chaque année (ou tous les 5 000 cycles).','Tirer régulièrement, perpendiculairement, jusqu\'au déclic, sans à-coup.','Après usage, ramener au minimum de l\'échelle (pas en dessous de zéro).'),W('À éviter : serrer au-delà du déclic, tirer sur une rallonge, utiliser la clé pour desserrer.')]),
  ('Serrage couple + angle',[P('Principe : un couple de pré-serrage met les pièces en appui, puis un angle impose l\'allongement de la vis, indépendamment du frottement.'),Lst('Avantage : tension beaucoup plus régulière qu\'au couple seul.','Vis étirables : toujours neuves.','Utiliser un rapporteur d\'angle ou repérer la position à la peinture.')]),
  ('Frein-filet et pâtes',[T(['Produit','Usage'],[['frein-filet faible (violet)','petites vis, démontable facilement'],['frein-filet moyen (bleu)','usage général, démontable à l\'outil'],['frein-filet fort (rouge)','assemblages permanents, chauffer pour démonter'],['pâte cuivre','anti-grippage haute température (échappement)']]),
   W('Ne pas graisser les filets de roue sauf prescription. Dégraisser avant tout frein-filet.')]),
  ('Conversions utiles',[T(['~De','Vers'],[['=1 N·m','=0.7376 lb·ft'],['=1 lb·ft','=1.3558 N·m'],['=1 N·m','=0.10197 kgf·m'],['=1 bar','=100 kPa = 14.504 psi'],['=1 psi','=6.895 kPa'],['=°F','=°C × 9/5 + 32'],['=K','=°C + 273.15'],['=1 in','=25.4 mm'],['=1 hp','~0,7457 kW = 1,0139 ch']])]),
 ]),
 ('alignment','Géométrie des trains roulants','Valeurs courantes de voiture de tourisme et symptômes.',[
  ('Valeurs courantes (tourisme)',[T(['Réglage','Valeur courante','Remarque'],[
    ['carrossage avant','=−1.0° … 0°','selon véhicule'],['carrossage arrière','=−2.0° … −0.5°','selon essieu'],['parallélisme avant (total)','=0 … +0.2°','pincement léger'],['parallélisme arrière (total)','=+0.1 … +0.4°','pincement : stabilité'],['chasse','=+3° … +7°','non réglable sur beaucoup de véhicules']]),
   N('Valeurs très variables selon le châssis et l\'usage : toujours partir des données constructeur. Contrôler après tout remplacement de pièce de direction ou de suspension.')]),
  ('Symptômes et contrôles',[T(['Symptôme','Cause probable'],[['usure de l\'épaule intérieure','carrossage trop négatif ou ouverture'],['usure des deux épaules','pression trop basse'],['usure en dents de scie','parallélisme incorrect'],['la voiture tire d\'un côté','pressions, carrossage ou chasse différents, frein qui frotte'],['volant décentré','parallélisme mal réparti entre les roues']])]),
 ]),
 ('mixture','Richesse (AFR et lambda)','Valeurs cibles et diagnostic de la richesse (essence).',[
  ('Valeurs cibles (essence, AFR stœchiométrique 14,7)',[T(['AFR','Lambda','Usage','Remarque'],[
    ['12.0–12.5','0.82–0.85','pleine charge turbo','marge contre le cliquetis'],['12.8–13.2','0.87–0.90','pleine charge atmosphérique','bon compromis puissance / fiabilité'],['14.7','1.00','ralenti, croisière','rendement optimal du catalyseur'],['15.5–16.5','1.05–1.12','croisière économique','échauffement, NOx élevés']]),
   N('Avec un autre carburant, raisonner en lambda : λ = AFR ÷ AFR stœchiométrique (E85 ≈ 9,8 ; méthanol ≈ 6,4).')]),
  ('Diagnostic par la richesse',[T(['Mesure','Symptôme','Risque','Correction'],[
    ['AFR ≈ 12 en croisière','odeur d\'essence, bougies noires','surconsommation, dilution de l\'huile','pression d\'essence, injecteurs, cartographie'],['AFR ≈ 14,7 en croisière','combustion stable','aucun','—'],['AFR ≥ 16 en charge','échauffement, cliquetis possible','soupapes, pistons','enrichir, chercher une prise d\'air'],['oscillations rapides','ralenti instable','ratés d\'allumage','sonde lambda, allumage']])]),
 ]),
 ('spark','Bougies et allumage','Écartement des électrodes, cliquetis et remèdes.',[
  ('Écartement des électrodes',[T(['Moteur','Écartement (mm)','Remarque'],[['atmosphérique','0.8–1.0','étincelle longue, bon allumage'],['turbo, pression modérée','0.7–0.8','évite les ratés sous pression'],['turbo, forte pression','0.5–0.7','la pression rend l\'étincelle plus difficile']]),N('Plus la pression dans le cylindre est élevée, plus la tension d\'allumage nécessaire augmente : on réduit l\'écartement.')]),
  ('Causes du cliquetis',[Lst('Avance à l\'allumage excessive.','Carburant à indice d\'octane trop faible.','Air d\'admission trop chaud.','Mélange trop pauvre.','Calamine, point chaud, taux de compression élevé.')]),
  ('Remèdes',[Lst('Carburant à indice d\'octane plus élevé (ou éthanol).','Réduire l\'avance dans la zone concernée.','Mieux refroidir l\'air d\'admission (intercooler, injection d\'eau-méthanol).','Enrichir légèrement.','Bougies d\'indice thermique plus froid.')]),
  ('Température d\'admission',[Lst('Air froid = plus dense = plus de puissance.','Environ 1 % de puissance perdue tous les 5 à 6 °C supplémentaires.','Air chaud = risque de cliquetis accru.')]),
 ]),
 ('egt','Températures des gaz d\'échappement (EGT)','Repères pour un moteur essence (sonde au collecteur).',[
  ('Repères EGT',[T(['EGT (°C)','Situation','Risque'],[['700–850','conduite normale','aucun'],['850–950','forte charge','normal sur turbo essence'],['950–1050','pleine charge prolongée','surveiller'],['> 1050','dépassement','soupapes, pistons, turbine']]),N('Une EGT élevée vient souvent d\'un mélange pauvre ou d\'un allumage trop retardé. Les turbos courants sont prévus pour 950 à 1 050 °C maximum.')]),
 ]),
 ('faults','Pannes courantes','Symptômes, causes et remèdes rapides.',[
  ('Diagnostic rapide',[T(['Symptôme','Causes possibles','Remède'],[
    ['ratés d\'allumage','bougies usées, écartement, bobine','bougies neuves, contrôler l\'écartement, tester les bobines'],
    ['surchauffe','liquide bas, thermostat bloqué, ventilateur, mélange pauvre','niveau, thermostat, ventilateur, richesse'],
    ['forte odeur d\'essence','injecteur qui fuit, mélange riche, fuite','pression d\'essence, étanchéité'],
    ['cliquetis','octane trop faible, avance excessive, air chaud','carburant adapté, réduire l\'avance'],
    ['perte de puissance turbo','fuite à l\'admission, wastegate, mélange pauvre','test d\'étanchéité, wastegate, richesse']])]),
 ]),
 ('maintenance','Entretien préventif','Contrôles réguliers d\'un moteur préparé.',[
  ('Liste de contrôle',[Lst('Bougies : contrôle tous les 10 000 km (plus souvent en turbo préparé).','Contrôler la richesse à la sonde large bande après toute modification.','Filtre à air : nettoyage ou remplacement tous les 15 000 km.','Surveiller la température d\'admission.','Lire les codes défaut, surtout ceux des sondes lambda.','Collecteur d\'échappement : une fuite fausse la richesse et l\'EGT.','Carburant de qualité, conforme au réglage.','Vidange et filtre selon le constructeur (plus souvent en usage piste).')]),
 ]),
 ('pressures','Pressions et températures moteur','Huile, carburant et suralimentation.',[
  ('Huile moteur',[T(['Mesure','Valeur courante','Si anomalie'],[['pression au ralenti (chaud)','1–2 bar','bruits, usure : niveau, pompe, crépine'],['pression en charge','3–5 bar','environ 1 bar par 1 000 tr/min jusqu\'au clapet'],['température d\'huile','90–110 °C','au-delà de 130 °C l\'huile se dégrade']])]),
  ('Carburant',[T(['Injection','Pression courante','Si anomalie'],[['multipoint essence','3–4 bar','régulateur, pompe, filtre'],['injection directe essence','50–350 bar','pompe haute pression, capteur de rail'],['suralimentation essence','0,5–1,5 bar','wastegate, durites, gestion']])]),
 ]),
 ('sensors','Capteurs et sondes','Rôle des capteurs et valeurs typiques.',[
  ('Capteurs moteur',[T(['Capteur','Abréviation','Rôle','Valeur typique'],[
    ['température moteur','=ECT','température du liquide de refroidissement','85–105 °C chaud'],
    ['température d\'air','=IAT','température de l\'air admis','ambiante + 0–30 °C'],
    ['pression collecteur','=MAP','pression absolue d\'admission (charge)','≈ 30 kPa ralenti, 100 kPa pleine charge atmo'],
    ['débitmètre','=MAF','masse d\'air admise','≈ 2–5 g/s au ralenti (2 L)'],
    ['sonde lambda bande étroite','=O2','richesse autour de λ = 1','0.1–0.9 V'],
    ['sonde lambda large bande','=UEGO','richesse exacte (réglage)','λ 0.65–1.30'],
    ['capteur de cliquetis','=KS','vibrations de détonation','signal piézoélectrique'],
    ['position du vilebrequin','=CKP','régime et position du moteur','inductif ou à effet Hall'],
    ['position de l\'arbre à cames','=CMP','phase (séquentiel, distribution variable)','effet Hall'],
    ['position du papillon','=TPS','ouverture du papillon','≈ 0.5–4.5 V'],
    ['pression d\'essence','=FPS','pression du circuit ou du rail','selon injection'],
    ['température d\'huile','=EOT','température d\'huile','90–110 °C'],
    ['pression d\'huile','=EOP','pression d\'huile','voir « Pressions »'],
    ['température d\'échappement','=EGT','température des gaz (thermocouple K)','voir « EGT »'],
    ['température après intercooler','=IAT2','efficacité de l\'intercooler','ambiante + 5–25 °C'],
    ['température de carburant','=FT','correction de densité, éthanol','ambiante'],
    ['teneur en éthanol','=Flex','pourcentage d\'éthanol','0–85 %'],
    ['position de wastegate','=WG','ouverture de la wastegate','enregistrement, régulation'],
    ['NOx','=NOx','oxydes d\'azote (dépollution)','diesel, injection directe pauvre']])]),
 ]),
]
UI={'intro':"Valeurs de référence pour l'atelier : filetages, couples, freinage, électricité, diagnostic, capteurs… Touchez une rubrique pour l'ouvrir.",
 'search':"Rechercher dans l'aide-mémoire…",'no_result':"Aucune fiche ne correspond à la recherche.",
 'disclaimer':"Valeurs génériques et indicatives : les données du constructeur du véhicule ou de la pièce restent prioritaires."}
