# Game design Dimitri

## Titre du projet

Chasse au trésor du collège Sacré-Coeur d'Aix - Projet Dimitri.

## Objectif du jeu

Explorer le collège, se repérer dans les lieux importants, collecter les indices C1 à C6 dans le bon ordre, puis trouver le trésor final.

## Public visé

Élèves du collège, élèves du club de codage, enseignants qui veulent présenter un prototype simple de jeu de visite.

## Contexte

Le joueur arrive au collège Sacré-Coeur d'Aix et suit une chasse au trésor qui l'oblige à passer par des lieux repères : Vie scolaire, CDI, Auditorium, Gymnase / Préau, Arts / Musique, Self élèves, puis Conseils / Multi 1 ou Cour centrale.

## Ambiance

Ambiance de visite mystérieuse mais lisible, avec une musique douce, des sons d'indice et un objectif clair à chaque étape.

## Style graphique

Le prototype HTML garde un style 2.5D simple, gris, rouge et noir, inspiré de la maquette de Dimitri. Une version future pourrait garder ce style arcade scolaire ou évoluer vers une visite 3D plus réaliste.

## Lieux importants

- Vie scolaire
- CDI
- Auditorium
- Gymnase / Préau
- Arts / Musique
- Self élèves
- Conseils / Multi 1
- Cour centrale
- Entrée principale

## Système d'indices

Les indices sont collectés dans l'ordre. Chaque indice donne un texte court et indique le prochain lieu. Le trésor final reste verrouillé tant que les six indices ne sont pas trouvés.

## Étage spécial de Dimitri

Nom de l'étage :

Ambiance :

Objectif du joueur :

Lieux présents :

Nombre d'indices :

Type d'énigmes :

Obstacles :

Récompense finale :

Sons souhaités :

Couleurs dominantes :

Ce que le joueur doit ressentir :

## Idées d'énigmes

- Retrouver une salle à partir d'un indice de lieu.
- Associer une matière à une zone du collège.
- Suivre une suite d'indices visuels sur la mini-carte.
- Trouver un objet symbolique dans une salle.
- Ouvrir une porte après avoir collecté plusieurs indices.

## Sons et ambiance musicale

Le prototype utilise des sons générés par la Web Audio API : clics, panneau, indice, trésor et musique d'ambiance. Une version future pourrait ajouter des ambiances par lieu, tout en gardant des sons simples et libres de droits.

## Contraintes techniques

- Garder le prototype HTML jouable dans le navigateur.
- Rester compatible GitHub Pages.
- Ne pas ajouter de dépendance externe au prototype actuel.
- Tester avec `python3 -m http.server 8000`.
- Vérifier les licences des images, sons, textures et modèles.

## Ce qui existe déjà dans le prototype HTML

- Menu principal.
- Paramètres.
- Crédits de Dimitri.
- Sons et musique d'ambiance.
- Carte stylisée du collège.
- Indices C1 à C6.
- Trésor final.
- Mini-carte et HUD.
- Script de vérification de la carte.

## Ce qui pourrait évoluer dans Unreal Engine

- Une vraie map 3D du collège.
- Des lumières et textures plus réalistes.
- Des déplacements plus immersifs.
- Des collisions et portes plus naturelles.
- Des assets créés ou adaptés par les élèves.
- Des énigmes avec objets 3D.
- Une visite virtuelle plus ambitieuse.
