# French ECU — Suivi du projet

Légende : ✅ terminé · 🔄 en cours · ⏳ à faire

## Phase 1 — Fondations ✅
- ✅ Projet Vite + PWA (installable, hors connexion, chemins relatifs compatibles Capacitor)
- ✅ Logo French ECU + icônes (Android, maskable, iPhone/iPad, favicon)
- ✅ Écran de démarrage 3 s (une fois par lancement, animations réduites si demandé)
- ✅ Moteur multilingue 10 langues (FR, EN, ES, DE, IT, PT, NL, PL, TR, AR droite-à-gauche)
- ✅ Format des nombres par langue + saisie « 2,5 » ou « 2.5 »
- ✅ Unités métrique / impérial + choix par grandeur (19 grandeurs)
- ✅ Menu par catégories + recherche + réglages
- ✅ Message « Nouvelle version disponible » + bouton « Installer »
- ✅ Contrôle automatique des traductions avant publication
- ✅ 212 tests automatiques (conversions, traductions, nombres, physique des simulateurs)
- ✅ Publication automatique GitHub Pages

## Phase 2 — Portage des logiciels ✅
Pour chaque logiciel : formules inchangées (en métrique), champs avec choix d'unité,
graphiques corrigés (hauteur mini mobile, légendes lisibles), traduction complète,
comparaison des résultats avec l'ancien site.
- ✅ Composants communs : champ avec unité, calcul automatique, cartes de résultat, tableaux,
  graphiques mobiles (Chart.js 4), export PDF (toutes langues, arabe compris), lien de partage,
  mémorisation des dernières valeurs
- ✅ Carburant : injecteurs, débit pompe, E85, lambda/AFR, NOS — 75/75 résultats identiques à l'ancien site
- ✅ Export PDF : plus aucune ligne de tableau, carte ou graphique coupé entre deux pages ; grandes tables découpées en blocs de colonnes
- ✅ Suralimentation (v0.3.0) : turbo, wastegate, intercooler, échappement — formules de l'ancien site
  fausses, réécrites sur des bases physiques (détail en tête de chaque calc.js), 20 tests de cohérence
  - Turbo : densité au collecteur, débit corrigé (formule inversée), rapport de pression, T° échappement
    fantaisiste supprimée, diamètre d'échappement (donnait plusieurs mètres)
  - Wastegate : soupape conseillée ≈ 3 mm → règle des fabricants (Ø 38 ≈ 450 hp à 1 bar), ressort,
    pression obtenue, rapport cyclique EBC, risque de boost creep
  - Intercooler : débit d'air ×500 trop grand, perte de charge > 1 bar → méthode efficacité-NTU + Darcy
  - Échappement : CFM avec des cm³ au lieu de pouces cubes (×16), pertes ∝ débit², perte de pompage réelle
- ✅ Graphiques en barres : toutes les étiquettes visibles (retour à la ligne)
- ✅ Moteur (v0.4.0) : compression, arbre à cames, vitesse piston, ressorts, segments, embiellage
  — 30 tests de cohérence physique (tests/engine.test.js)
  - Compression : taux dynamique géométrique (bielle), octane conseillé d'après le taux dynamique, gain Otto
  - Arbre à cames : croisement faux (288° au lieu de 60°) → (durée adm + durée éch)/2 − 2·LSA ;
    plage de régime selon la durée et la cylindrée unitaire ; taux dynamique avec le vrai taux
  - Vitesse piston : accélération avec r/L (et non course/bielle), vraie vitesse maxi, ⅓ de la bielle en masse alternative
  - Ressorts : la durée de came n'était pas utilisée → décélération harmonique ; masses, hauteur libre, N/mm
  - Segments : méthode juste, reprise telle quelle (alésage en pouces × coefficient)
  - Embiellage : reconstruit (couple affiché 0 N·m à cause d'une erreur kN·m, course figée, pression sans combustion)
  - Harmonics3+ : supprimé à la demande de Stéphane (25/10/2026)
  - Données carburant : PCI de l'E85 corrigé (29,3 MJ/kg)
- ✅ Cartographie (v0.5.0) : générateur de cartes de départ (carburant, avance, VE, lambda + 7 courbes),
  tables colorées, export CSV (.zip) et JSON, 8 calculateurs + CSV générique
  - Ancien site : carburant ∝ pression² en turbo, VE 150–300 %, pression d'essence ignorée, contrôle
    injecteurs sans la suralimentation, démarrage bloqué à 20 ms (cm³ pris pour des litres), chauffe
    discontinue à 0 °C, correction d'air plafonnée, correction baro appliquée en speed-density
- ✅ Châssis (v0.5.0) : répartition de freinage, radiateur d'huile
  - Freinage : distance fausse (adhérence comptée deux fois) ; ajout de la décélération réellement
    atteignable selon le réglage et de l'essieu qui bloque en premier
  - Radiateur d'huile : modèle faux (huile pouvant sortir à −120 °C, huile/eau calculé contre l'air,
    débit d'huile inventé) → méthode efficacité-NTU, température stabilisée, taille conseillée
- ✅ Aide-mémoire (v0.6.0) : 18 rubriques, 48 fiches, recherche instantanée, 10 langues
  - Corrigé : trous de passage (ISO 273), forets STI M10/M12, couples 8.8/10.9/12.9, couleurs de
    frein-filet (bleu = moyen, pas faible), DOT 5.1, test de sonde lambda (le nettoyant frein ne sert
    pas à tester une sonde), clé dynamométrique (pas « remettre à 0 »), schéma de culasse numéroté sans
    figure → méthode, injection directe jusqu'à 350 bar, abréviations de capteurs (FPR = régulateur),
    lignes de capteurs inventées ou en double supprimées, unités du tableau « référence rapide »
  - Source modifiable : scripts/memo/source_fr.py → python3 scripts/memo/gen.py
- ✅ Corrections de formules validées par Stéphane (v0.2.1, 25/10/2026) :
  - Injecteurs : débit nominal ramené à 3 bar (Q ∝ √P, plus de correction inversée) ; temps d'injection
    par cylindre (≈ 15,8 ms au lieu de ~1 ms) ; conversion lb/h ↔ cc/min selon la densité du carburant ;
    comparateur avec le duty cycle réel de chaque taille ; courbe « régulateur non référencé » en turbo
  - Débit pompe : consommation au duty cycle maxi × 1,2 (le débit augmente avec le duty) ; retour = excédent
  - Lambda : zone légèrement pauvre (λ > 1,05) signalée comme la plus chaude, très pauvre (> 1,15) en danger
  - NOS : consommation de N₂O déduite de la chimie (≈ 4 lb/h par hp, 10 lb ≈ 90 s pour 100 hp)
  - Champs sans effet supprimés : altitude, humidité, températures carburant/moteur (injecteurs),
    pression de rampe (pompe), taux de compression (E85)

## Installation obligatoire ✅ (v0.7.0)
- ✅ Dans un navigateur : seul l'écran « Installer French ECU » s'affiche (bouton natif Android/PC, étapes iPhone/iPad,
  Mac Safari « Ajouter au Dock », navigateurs intégrés → copier le lien, Firefox PC → ouvrir avec Chrome/Edge)
- ✅ Appli installée (ou future appli des stores) : accès complet

## Phase 3 — Statistiques administrateur 🔄 (v0.8.0)
- ✅ PostHog UE branché (src/core/analytics.js), chargé seulement après accord
- ✅ Écran de consentement RGPD au premier lancement + interrupteur dans Réglages (10 langues)
- ✅ Événements : app_open, app_first_open_installed, app_installed, install_gate_view, install_prompt_*,
  install_copy_link, $pageview, tool_open, tool_calculated (valeurs saisies), tool_pdf, tool_share, tool_reset,
  tool_download, tool_error, memo_open, memo_search, language_changed, units_changed, update_available,
  update_applied, consent_given/withdrawn, exceptions + clics (autocapture)
- ⏳ Variable GitHub VITE_POSTHOG_KEY à créer par Stéphane (sinon la version en ligne n'envoie rien)
- ⏳ Tableau de bord administrateur dans PostHog

## Phase 4 — Tests appareils ⏳
- ⏳ Android téléphone / tablette, iPhone, iPad, PC (Chrome/Edge)

## Phase 5 — Stores (plus tard, optionnel) ⏳
- ⏳ Emballage Capacitor → Google Play (.aab) et App Store

## Projet futur (non démarré)
- Boutique pièces détachées / goodies en dropshipping (emplacement prévu : `src/modules/boutique`)
