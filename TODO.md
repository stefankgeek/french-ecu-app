# French ECU — Suivi du projet

Légende : ✅ terminé · 🔄 en cours · ⏳ à faire

## Phase 1 — Fondations ✅
- ✅ Projet Vite + PWA (installable, hors connexion, chemins relatifs compatibles Capacitor)
- ✅ Logo French ECU + icônes (Android, maskable, iPhone/iPad, favicon)
- ✅ Écran de démarrage 2 s (une fois par lancement, animations réduites si demandé)
- ✅ Moteur multilingue 10 langues (FR, EN, ES, DE, IT, PT, NL, PL, TR, AR droite-à-gauche)
- ✅ Format des nombres par langue + saisie « 2,5 » ou « 2.5 »
- ✅ Unités métrique / impérial + choix par grandeur (19 grandeurs)
- ✅ Menu par catégories + recherche + réglages
- ✅ Message « Nouvelle version disponible » + bouton « Installer »
- ✅ Contrôle automatique des traductions avant publication
- ✅ 80 tests automatiques (conversions, traductions, nombres)
- ✅ Publication automatique GitHub Pages

## Phase 2 — Portage des logiciels 🔄
Pour chaque logiciel : formules inchangées (en métrique), champs avec choix d'unité,
graphiques corrigés (hauteur mini mobile, légendes lisibles), traduction complète,
comparaison des résultats avec l'ancien site.
- ✅ Composants communs : champ avec unité, calcul automatique, cartes de résultat, tableaux,
  graphiques mobiles (Chart.js 4), export PDF (toutes langues, arabe compris), lien de partage,
  mémorisation des dernières valeurs
- ✅ Carburant : injecteurs, débit pompe, E85, lambda/AFR, NOS — 75/75 résultats identiques à l'ancien site
- ⏳ Export PDF : éviter qu'un saut de page coupe une ligne de tableau
- ⏳ Suralimentation : turbo, wastegate, intercooler, échappement
- ⏳ Moteur : compression, arbre à cames, vitesse piston, ressorts, segments, embiellage, Harmonics3+
- ⏳ Cartographie : générateur de tables ECU
- ⏳ Châssis : répartition de freinage, radiateur d'huile
- ⏳ Aide-mémoire (filetages, couples, inserts, capteurs, turbo, jeux…)
- ⏳ À vérifier avec Stéphane : Bielle (couple 0 Nm par défaut), radiateur d'huile (−120 °C)
- ✅ Corrections de formules validées par Stéphane (v0.2.1, 25/10/2026) :
  - Injecteurs : débit nominal ramené à 3 bar (Q ∝ √P, plus de correction inversée) ; temps d'injection
    par cylindre (≈ 15,8 ms au lieu de ~1 ms) ; conversion lb/h ↔ cc/min selon la densité du carburant ;
    comparateur avec le duty cycle réel de chaque taille ; courbe « régulateur non référencé » en turbo
  - Débit pompe : consommation au duty cycle maxi × 1,2 (le débit augmente avec le duty) ; retour = excédent
  - Lambda : zone légèrement pauvre (λ > 1,05) signalée comme la plus chaude, très pauvre (> 1,15) en danger
  - NOS : consommation de N₂O déduite de la chimie (≈ 4 lb/h par hp, 10 lb ≈ 90 s pour 100 hp)
  - Champs sans effet supprimés : altitude, humidité, températures carburant/moteur (injecteurs),
    pression de rampe (pompe), taux de compression (E85)

## Phase 3 — Statistiques administrateur ⏳
- ⏳ PostHog (UE) : installations, actifs en temps réel, logiciels utilisés, pays, langues, erreurs
- ⏳ Écran de consentement RGPD au premier lancement
- ⏳ Tableau de bord administrateur

## Phase 4 — Tests appareils ⏳
- ⏳ Android téléphone / tablette, iPhone, iPad, PC (Chrome/Edge)

## Phase 5 — Stores (plus tard, optionnel) ⏳
- ⏳ Emballage Capacitor → Google Play (.aab) et App Store

## Projet futur (non démarré)
- Boutique pièces détachées / goodies en dropshipping (emplacement prévu : `src/modules/boutique`)
