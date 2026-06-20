# Chasse au trésor du collège 2.5D

Jeu éducatif jouable dans un navigateur, en HTML/CSS/JavaScript pur, avec un rendu 2.5D par raycasting. Le projet est inspiré des anciens FPS 2.5D pour le style technique, sans reprendre leurs assets, noms, sons ou contenus.

La carte actuelle est une version stylisée de plan de collège : cour centrale, Vie scolaire, CDI, Multi 1, Conseils, gymnase, préau, parvis, auditorium, selfs, Arts, Musique, Multi 2, infirmerie, escaliers et blocs de salles numérotées.

## Installation

Aucune dépendance obligatoire.

Le jeu peut être ouvert directement :

```bash
xdg-open index.html
```

ou depuis le navigateur en ouvrant le fichier `index.html`.

## Lancement avec serveur local optionnel

Depuis le dossier du projet :

```bash
python3 -m http.server 8000
```

Puis ouvrir :

```text
http://localhost:8000
```

## Touches

- `Z` ou `Flèche haut` : avancer
- `S` ou `Flèche bas` : reculer
- `Q` : déplacement latéral gauche
- `D` : déplacement latéral droit
- `Flèche gauche` / `Flèche droite` : tourner
- Souris : regarder à gauche/droite après clic dans le jeu
- `E` : interagir avec un indice, une porte ou le trésor
- `Échap` : pause
- `M` : afficher/masquer la mini-carte
- `F1` : mode professeur/debug

## Carte inspirée du collège

La carte jouable est générée depuis `src/mapCollege.js`. Ce fichier contient une liste de bâtiments faciles à modifier :

```js
{
  id: "gymnase",
  label: "Gymnase",
  floor: "RDC",
  x: 3,
  y: 10,
  width: 8,
  height: 6,
  color: "#e9edf0",
  collidable: true
}
```

Code couleur :

- RDC : gris clair / blanc
- R+1 : jaune
- R+2 : orange
- Escaliers : bleu clair
- Zones importantes ou administratives : rouge / orange foncé
- Espaces extérieurs : gris très clair ou vert pâle
- Chemins praticables : beige ou gris clair

La mini-carte affiche les labels des zones principales. Le rendu 2.5D utilise les mêmes couleurs pour teinter les murs.

## Structure du projet

```text
index.html
style.css
README.md
assets/textures/
  wall.png
  door.png
  floor.png
  ceiling.png
  clue.png
  treasure.png
src/
  main.js
  config.js
  mapCollege.js
  map.js
  player.js
  raycaster.js
  renderer.js
  input.js
  interactions.js
  gameState.js
  audio.js
  ui.js
```

## Modifier la carte

La carte finale est générée dans `src/map.js` depuis les bâtiments de `src/mapCollege.js`.

Légende :

- `1` : mur de bordure
- `0` : espace libre
- `W0` : mur RDC
- `W1` : mur R+1
- `W2` : mur R+2
- `WS` : mur de zone spéciale
- `D` : porte ouvrable
- `F` : porte finale, bloquée jusqu'aux 6 indices
- `S` : escalier visible sur la mini-carte
- `P` : préau, parvis ou zone extérieure
- `C1` à `C6` : indices à trouver dans l'ordre
- `T` : trésor final

Pour ajouter une salle, ajouter de préférence un objet dans `COLLEGE_BUILDINGS` dans `src/mapCollege.js`. `src/map.js` convertit ensuite ces données en grille jouable.

## Ajouter un indice

Dans `src/map.js` :

1. Placer un jeton libre dans `buildGrid()` dans `src/map.js`, par exemple `C7`.
2. Ajouter une entrée dans l'objet `clues` avec `order`, `title`, `text` et `objective`.
3. Augmenter `clueTotal` dans `src/config.js`.

Les interactions reconnaissent automatiquement les jetons présents dans l'objet `clues`.

## Ajouter une porte

Dans `src/map.js`, placer :

- `D` pour une porte simple ;
- `F` pour une porte qui nécessite tous les indices.

Une porte ouverte devient une case `0`.

## Remplacer les textures par des photos du collège

Les fichiers à remplacer sont dans `assets/textures/`. Garder les mêmes noms pour éviter de modifier le code :

- `wall.png` : photo de mur ou de couloir
- `door.png` : photo de porte
- `floor.png` : photo de sol
- `ceiling.png` : photo de plafond
- `clue.png` : image de panneau, carnet ou symbole d'indice
- `treasure.png` : image du coffre, diplôme, blason ou objet final

Conseils :

- utiliser des images carrées, idéalement `64x64`, `128x128` ou `256x256` ;
- compresser les images pour Moodle ;
- éviter les photos avec visages identifiables sans autorisation ;
- préférer des textures bien éclairées et lisibles.

Pour ajouter des textures spécifiques, par exemple un panneau CDI ou un laboratoire, ajouter un nouveau fichier dans `assets/textures/`, puis adapter `renderer.js` pour choisir cette image selon le type de case ou d'objet.

## Intégration Moodle

Le projet ne dépend pas d'un serveur particulier. Pour Moodle, déposer le dossier complet dans une ressource fichier, un paquet web ou une activité compatible HTML. Vérifier que les chemins relatifs restent inchangés :

```text
index.html
style.css
src/
assets/
```

## Audio

Les effets sonores et la musique d'ambiance sont générés directement dans le navigateur avec la Web Audio API, dans `src/audio.js`.

Aucun fichier musical externe, CDN ou morceau commercial n'est utilisé. La musique est originale et générée par le code du projet avec des oscillateurs, des accords lents, un filtre passe-bas et de petites notes espacées.

Les paramètres permettent de couper tout le son, de régler le volume, de désactiver uniquement la musique d'ambiance ou de désactiver uniquement les effets sonores. Ces réglages sont sauvegardés dans `localStorage`.

## Tests

Vérification syntaxique des fichiers principaux :

```bash
node -c src/main.js
node -c src/ui.js
node -c src/audio.js
node -c src/gameState.js
node -c src/interactions.js
node -c src/renderer.js
node -c src/map.js
node -c src/mapCollege.js
node -c scripts/check-map.js
```

Vérification interne de la carte, des indices et du trésor :

```bash
node scripts/check-map.js
```

## Prochaines améliorations

- ajouter un chronomètre ;
- ajouter un score ;
- ajouter des énigmes avec réponses ;
- créer plusieurs niveaux ;
- importer un vrai plan du collège ;
- convertir le plan du collège en grille jouable ;
- ajouter un mode édition pour placer les indices ;
- afficher des panneaux propres à chaque salle ;
- sauvegarder la progression dans `localStorage`.
