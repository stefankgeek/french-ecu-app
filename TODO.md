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

## Phase 2 — Portage des logiciels ⏳
Pour chaque logiciel : formules inchangées (en métrique), champs avec choix d'unité,
graphiques corrigés (hauteur mini mobile, légendes lisibles), traduction complète,
comparaison des résultats avec l'ancien site.
- ⏳ Composants communs : champ avec unité, carte de résultat, graphique (Chart.js), export PDF
- ⏳ Carburant : injecteurs, débit pompe, E85, lambda/AFR, NOS
- ⏳ Suralimentation : turbo, wastegate, intercooler, échappement
- ⏳ Moteur : compression, arbre à cames, vitesse piston, ressorts, segments, embiellage, Harmonics3+
- ⏳ Cartographie : générateur de tables ECU
- ⏳ Châssis : répartition de freinage, radiateur d'huile
- ⏳ Aide-mémoire (filetages, couples, inserts, capteurs, turbo, jeux…)
- ⏳ À vérifier avec Stéphane : Bielle (couple 0 Nm par défaut), radiateur d'huile (−120 °C)

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
