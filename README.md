# French ECU

Simulateurs de préparation moteur et aide-mémoire technique — application mobile gratuite,
installable sur Android, iPhone, iPad (et PC), qui fonctionne **hors connexion** et en **10 langues**.

**Ouvrir l'appli :** https://stefankgeek.github.io/french-ecu-app/

---

## Installer l'appli sur un téléphone

| Appareil | Marche à suivre |
|---|---|
| Android (Chrome) | Ouvrir le lien → bouton **Installer** dans l'appli (ou menu ⋮ → *Installer l'application*) |
| iPhone / iPad (Safari) | Ouvrir le lien → **Partager** → **Sur l'écran d'accueil** |
| PC (Chrome / Edge) | Ouvrir le lien → icône d'installation dans la barre d'adresse |

**Mises à jour :** automatiques. Quand une nouvelle version est publiée, l'appli affiche
« Nouvelle version disponible – Mettre à jour ».

---

## Pour le développeur

### Prérequis
- Node.js 20 ou plus récent

### Commandes
```bash
npm install          # installer les dépendances
npm run dev          # lancer en local (http://localhost:5173)
npm test             # tests automatiques (conversions, traductions, nombres)
npm run i18n:check   # vérifier qu'aucune traduction ne manque
npm run build        # construire la version publiée (dans dist/)
npm run icons        # régénérer logo et icônes (scripts/logo.mjs)
```

### Organisation
```
src/
├── main.js              Démarrage (langue, unités, écran de démarrage, mises à jour)
├── app.js               Écrans : accueil, réglages, page d'un module
├── core/
│   ├── i18n-core.js     Traductions, pluriels, format et saisie des nombres (testé)
│   ├── i18n.js          Chargement des langues, changement instantané, RTL
│   ├── units-core.js    Conversions métrique / impérial (testé)
│   ├── units.js         Système choisi + choix par grandeur
│   ├── splash.js        Écran de démarrage 2 s
│   ├── update.js        Mises à jour automatiques
│   ├── install.js       Bouton « Installer » / instructions iPhone
│   ├── router.js        Navigation (#/…) compatible GitHub Pages et Capacitor
│   └── store.js         Réglages enregistrés sur l'appareil
├── locales/<langue>.json  Textes communs
├── modules/
│   ├── registry.js      Catalogue des logiciels (ajouter un logiciel = 1 ligne)
│   ├── simulateurs/<id>/  Un dossier par logiciel (+ locales/<langue>.json)
│   ├── memo/            Aide-mémoire
│   └── boutique/        Réservé (projet futur, désactivé)
└── styles/app.css
```

### Règles importantes
- **Calculs toujours en métrique.** Les conversions se font uniquement à la saisie et à
  l'affichage (`units-core.js`). On ne modifie jamais une formule pour l'impérial.
- **Température ≠ écart de température**, **pression relative ≠ pression absolue** :
  ce sont des grandeurs distinctes dans `units-core.js`.
- **Aucun texte écrit en dur** : tout passe par `t('cle')`. Le contrôle `npm run i18n:check`
  bloque la publication si une traduction manque dans l'une des 10 langues.

### Ajouter une langue
1. Ajouter une ligne dans `LANGUAGES` (`src/core/i18n-core.js`).
2. Copier `src/locales/en.json` vers `src/locales/<code>.json` et traduire
   (faire de même dans chaque `modules/*/*/locales/`).
3. `npm run i18n:check`.

### Publication
Chaque envoi sur la branche `main` lance automatiquement : tests → contrôle des traductions →
construction → mise en ligne sur GitHub Pages (`.github/workflows/deploy.yml`).
Si une étape échoue, rien n'est publié.

Pour publier une nouvelle version : augmenter `version` dans `package.json`.

### Évolutions prévues
- **Google Play / App Store** : emballage avec Capacitor (le code est déjà compatible :
  chemins relatifs, navigation par #, stockage isolé dans `store.js`).
- **Boutique** (pièces détachées, goodies) : module `boutique` prévu, désactivé.

---

© 2026 French ECU — tous droits réservés (voir `LICENSE`).
