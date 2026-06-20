(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  var COLORS = {
    rdc: "#e9edf0",
    r1: "#f4d25a",
    r2: "#e78b3c",
    stairs: "#87c7e8",
    special: "#d7dedf",
    outdoor: "#dfe8dc",
    path: "#d8d0ba"
  };

  /*
    Stylized building data traced from the reference school plan.
    Coordinates are map cells, not pixels. The real plan has angled wings;
    here they are approximated with short rectangular blocks so the minimap
    remains recognizable and the raycasted corridors stay easy to navigate.
  */
  var COLLEGE_BUILDINGS = [
    { id: "cour", label: "Cour centrale", floor: "EXT", x: 24, y: 18, width: 18, height: 10, color: COLORS.outdoor, collidable: false },
    { id: "parvis", label: "PARVIS", floor: "EXT", x: 16, y: 31, width: 10, height: 5, color: COLORS.outdoor, collidable: false },
    { id: "preau", label: "Préau", floor: "EXT", x: 13, y: 27, width: 8, height: 5, color: COLORS.outdoor, collidable: false },
    { id: "entree-principale", label: "Entrée", floor: "EXT", x: 21, y: 29, width: 4, height: 3, color: COLORS.path, collidable: false },
    { id: "couloir-central", label: "Axe principal", floor: "EXT", x: 21, y: 15, width: 24, height: 18, color: COLORS.path, collidable: false },
    { id: "couloir-self", label: "Coursive self", floor: "EXT", x: 45, y: 11, width: 8, height: 18, color: COLORS.path, collidable: false },
    { id: "couloir-haut", label: "Aile haute", floor: "EXT", x: 8, y: 8, width: 20, height: 11, color: COLORS.path, collidable: false },
    { id: "couloir-29-32", label: "Couloir 29-32", floor: "EXT", x: 3, y: 6, width: 20, height: 5, color: COLORS.path, collidable: false },
    { id: "couloir-bas-gauche", label: "Aile basse", floor: "EXT", x: 24, y: 33, width: 27, height: 8, color: COLORS.path, collidable: false },

    { id: "gymnase", label: "Gymnase", floor: "RDC", x: 7, y: 34, width: 10, height: 7, color: COLORS.rdc, collidable: true, wallToken: "W0", doors: [{ x: 16, y: 36 }] },
    { id: "vie-scolaire", label: "Vie scolaire", floor: "SPECIAL", x: 21, y: 27, width: 5, height: 3, color: COLORS.special, collidable: true, wallToken: "WS", doors: [{ x: 23, y: 29 }] },
    { id: "escaliers-entree", label: "Esc.", floor: "STAIRS", x: 17, y: 26, width: 3, height: 2, color: COLORS.stairs, collidable: false },

    { id: "salles-12-14", label: "12 13 14", floor: "R+2", x: 26, y: 16, width: 10, height: 4, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 31, y: 19 }] },
    { id: "cdi", label: "CDI", floor: "R+1", x: 26, y: 21, width: 10, height: 3, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 31, y: 23 }] },
    { id: "ulis", label: "ULIS", floor: "SPECIAL", x: 25, y: 29, width: 5, height: 3, color: COLORS.special, collidable: true, wallToken: "WS", doors: [{ x: 27, y: 29 }] },
    { id: "salles-15-16", label: "15 16", floor: "R+2", x: 30, y: 29, width: 5, height: 3, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 32, y: 29 }] },
    { id: "animation", label: "Animation", floor: "SPECIAL", x: 37, y: 28, width: 5, height: 3, color: COLORS.special, collidable: true, wallToken: "WS", doors: [{ x: 38, y: 28 }] },
    { id: "multi-1", label: "Multi 1", floor: "RDC", x: 40, y: 24, width: 3, height: 5, color: COLORS.rdc, collidable: true, wallToken: "W0", doors: [{ x: 40, y: 26 }] },
    { id: "conseils", label: "Conseils", floor: "R+1", x: 44, y: 25, width: 6, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 44, y: 27 }] },
    { id: "escaliers-centre", label: "Esc.", floor: "STAIRS", x: 23, y: 24, width: 2, height: 3, color: COLORS.stairs, collidable: false },
    { id: "escaliers-cdi", label: "Esc.", floor: "STAIRS", x: 23, y: 17, width: 2, height: 2, color: COLORS.stairs, collidable: false },

    { id: "auditorium", label: "Auditorium", floor: "SPECIAL", x: 47, y: 19, width: 5, height: 6, color: COLORS.special, collidable: true, wallToken: "WS", doors: [{ x: 47, y: 22 }] },
    { id: "ds-9", label: "DS / 9", floor: "R+1", x: 52, y: 24, width: 9, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 52, y: 26 }] },
    { id: "self-eleves", label: "Self élèves", floor: "RDC", x: 49, y: 14, width: 10, height: 3, color: COLORS.rdc, collidable: true, wallToken: "W0", doors: [{ x: 51, y: 16 }] },
    { id: "self-adulte", label: "Self adulte", floor: "R+2", x: 47, y: 9, width: 6, height: 4, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 49, y: 12 }] },
    { id: "salles-5-8", label: "5 6 7 8", floor: "R+2", x: 53, y: 8, width: 9, height: 5, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 53, y: 11 }] },
    { id: "salles-1-4", label: "1 2 3 4", floor: "R+1", x: 55, y: 3, width: 7, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 56, y: 6 }] },
    { id: "infirmerie", label: "Infirmerie", floor: "SPECIAL", x: 52, y: 5, width: 3, height: 3, color: COLORS.special, collidable: true, wallToken: "WS", doors: [{ x: 53, y: 7 }] },
    { id: "escaliers-droite", label: "Esc.", floor: "STAIRS", x: 45, y: 22, width: 2, height: 3, color: COLORS.stairs, collidable: false },
    { id: "escaliers-self", label: "Esc.", floor: "STAIRS", x: 53, y: 15, width: 3, height: 2, color: COLORS.stairs, collidable: false },

    { id: "salles-29-32", label: "29 30 31 32", floor: "R+1", x: 3, y: 5, width: 20, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 20, y: 8 }] },
    { id: "salles-17-18-27-28", label: "17 18 27 28", floor: "R+1", x: 4, y: 12, width: 8, height: 5, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 10, y: 16 }] },
    { id: "musique", label: "Musique", floor: "R+1", x: 10, y: 12, width: 6, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 13, y: 15 }] },
    { id: "arts", label: "Arts", floor: "R+1", x: 15, y: 13, width: 5, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 17, y: 16 }] },
    { id: "multi-2", label: "Multi 2", floor: "RDC", x: 20, y: 12, width: 4, height: 3, color: COLORS.rdc, collidable: true, wallToken: "W0", doors: [{ x: 21, y: 14 }] },
    { id: "salles-10-11", label: "10 / 11", floor: "R+2", x: 22, y: 10, width: 6, height: 4, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 23, y: 13 }] },
    { id: "escaliers-haut", label: "Esc.", floor: "STAIRS", x: 5, y: 9, width: 3, height: 2, color: COLORS.stairs, collidable: false },

    { id: "aumonerie", label: "Aumônerie", floor: "RDC", x: 25, y: 36, width: 6, height: 4, color: COLORS.rdc, collidable: true, wallToken: "W0", doors: [{ x: 28, y: 36 }] },
    { id: "salles-23-26", label: "23 24 25 26", floor: "R+1", x: 31, y: 34, width: 8, height: 5, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 33, y: 34 }] },
    { id: "salles-19-22", label: "19 20 21 22", floor: "R+2", x: 39, y: 35, width: 10, height: 5, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 41, y: 35 }] },
    { id: "escaliers-bas-gauche", label: "Esc.", floor: "STAIRS", x: 31, y: 32, width: 3, height: 2, color: COLORS.stairs, collidable: false }
  ];

  var LANDMARKS = [
    { label: "Cour centrale", x: 33, y: 22 },
    { label: "Entrée principale", x: 22.5, y: 31.5 },
    { label: "Aile Arts / Musique", x: 15, y: 10.5 },
    { label: "Aile self", x: 52, y: 18 },
    { label: "Aile basse", x: 36, y: 33.5 }
  ];

  window.TreasureGame.CollegeMap = {
    width: 64,
    height: 44,
    colors: COLORS,
    buildings: COLLEGE_BUILDINGS,
    landmarks: LANDMARKS
  };
})();
