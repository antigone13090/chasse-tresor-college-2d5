(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  var COLORS = {
    rdc: "#e9edf0",
    r1: "#f4d25a",
    r2: "#e78b3c",
    stairs: "#87c7e8",
    special: "#c96a45",
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
    { id: "cour", label: "Cour centrale", floor: "EXT", x: 20, y: 12, width: 18, height: 12, color: COLORS.outdoor, collidable: false },
    { id: "parvis", label: "PARVIS", floor: "EXT", x: 5, y: 20, width: 9, height: 6, color: COLORS.outdoor, collidable: false },
    { id: "preau", label: "Préau", floor: "EXT", x: 12, y: 14, width: 7, height: 5, color: COLORS.outdoor, collidable: false },
    { id: "passage-bleu", label: "Passage", floor: "STAIRS", x: 16, y: 18, width: 3, height: 2, color: COLORS.stairs, collidable: false },
    { id: "gymnase", label: "Gymnase", floor: "RDC", x: 3, y: 10, width: 10, height: 7, color: COLORS.rdc, collidable: true, wallToken: "W0", doors: [{ x: 12, y: 14 }] },

    { id: "vie-scolaire", label: "Vie scolaire", floor: "SPECIAL", x: 19, y: 15, width: 4, height: 4, color: COLORS.special, collidable: true, wallToken: "WS", doors: [{ x: 22, y: 17 }] },
    { id: "ulis", label: "ULIS", floor: "SPECIAL", x: 16, y: 20, width: 6, height: 3, color: COLORS.special, collidable: true, wallToken: "WS", doors: [{ x: 19, y: 20 }] },
    { id: "salles-15-16", label: "15 16", floor: "R+2", x: 15, y: 23, width: 5, height: 3, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 18, y: 23 }] },
    { id: "animation", label: "Animation", floor: "SPECIAL", x: 22, y: 23, width: 4, height: 3, color: COLORS.special, collidable: true, wallToken: "WS", doors: [{ x: 23, y: 23 }] },
    { id: "salles-12-14", label: "12 13 14", floor: "R+2", x: 25, y: 15, width: 8, height: 4, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 28, y: 18 }] },
    { id: "cdi", label: "CDI", floor: "R+1", x: 25, y: 19, width: 8, height: 3, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 29, y: 19 }] },
    { id: "multi-1", label: "Multi 1", floor: "RDC", x: 27, y: 23, width: 3, height: 4, color: COLORS.rdc, collidable: true, wallToken: "W0", doors: [{ x: 28, y: 23 }] },
    { id: "conseils", label: "Conseils", floor: "R+1", x: 31, y: 24, width: 5, height: 3, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 32, y: 24 }] },
    { id: "escaliers-centre", label: "Esc.", floor: "STAIRS", x: 23, y: 18, width: 2, height: 2, color: COLORS.stairs, collidable: false },
    { id: "escaliers-parvis", label: "Esc.", floor: "STAIRS", x: 5, y: 27, width: 3, height: 2, color: COLORS.stairs, collidable: false },

    { id: "auditorium", label: "Auditorium", floor: "SPECIAL", x: 36, y: 22, width: 5, height: 7, color: COLORS.special, collidable: true, wallToken: "WS", doors: [{ x: 36, y: 25 }] },
    { id: "ds-9", label: "DS / 9", floor: "R+1", x: 41, y: 23, width: 8, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 41, y: 25 }] },
    { id: "salles-1-2", label: "1 / 2", floor: "RDC", x: 36, y: 30, width: 4, height: 4, color: COLORS.rdc, collidable: true, wallToken: "W0", doors: [{ x: 38, y: 30 }] },
    { id: "salles-3-5", label: "3 4 5", floor: "R+1", x: 43, y: 13, width: 9, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 43, y: 15 }] },
    { id: "salles-6-8", label: "6 7 8", floor: "R+2", x: 44, y: 17, width: 9, height: 5, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 44, y: 19 }] },
    { id: "self-eleves", label: "Self élèves", floor: "RDC", x: 41, y: 29, width: 11, height: 3, color: COLORS.rdc, collidable: true, wallToken: "W0", doors: [{ x: 43, y: 29 }] },
    { id: "self-adulte", label: "Self adulte", floor: "R+2", x: 42, y: 32, width: 10, height: 4, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 44, y: 32 }] },
    { id: "infirmerie", label: "Infirmerie", floor: "SPECIAL", x: 49, y: 12, width: 3, height: 2, color: COLORS.special, collidable: true, wallToken: "WS", doors: [{ x: 49, y: 13 }] },
    { id: "escaliers-droite", label: "Esc.", floor: "STAIRS", x: 38, y: 28, width: 2, height: 2, color: COLORS.stairs, collidable: false },

    { id: "salles-19-22", label: "19 20 21 22", floor: "R+2", x: 15, y: 2, width: 9, height: 5, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 21, y: 6 }] },
    { id: "salles-23-26", label: "23 24 25 26", floor: "R+1", x: 24, y: 5, width: 9, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 27, y: 8 }] },
    { id: "aumonerie", label: "Aumônerie", floor: "RDC", x: 33, y: 6, width: 5, height: 4, color: COLORS.rdc, collidable: true, wallToken: "W0", doors: [{ x: 33, y: 8 }] },
    { id: "salles-17-18-27-28", label: "17 18 27 28", floor: "R+1", x: 39, y: 2, width: 9, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 43, y: 5 }] },
    { id: "arts", label: "Arts", floor: "R+1", x: 35, y: 10, width: 4, height: 6, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 35, y: 13 }] },
    { id: "musique", label: "Musique", floor: "R+1", x: 39, y: 9, width: 7, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 39, y: 11 }] },
    { id: "salles-29-32", label: "29 30 31 32", floor: "R+1", x: 46, y: 7, width: 8, height: 4, color: COLORS.r1, collidable: true, wallToken: "W1", doors: [{ x: 46, y: 9 }] },
    { id: "salles-10-11", label: "10 / 11", floor: "R+2", x: 35, y: 16, width: 6, height: 4, color: COLORS.r2, collidable: true, wallToken: "W2", doors: [{ x: 35, y: 18 }] },
    { id: "multi-2", label: "Multi 2", floor: "RDC", x: 41, y: 17, width: 4, height: 3, color: COLORS.rdc, collidable: true, wallToken: "W0", doors: [{ x: 41, y: 18 }] },
    { id: "escaliers-haut", label: "Esc.", floor: "STAIRS", x: 48, y: 5, width: 2, height: 2, color: COLORS.stairs, collidable: false }
  ];

  var LANDMARKS = [
    { label: "Cour centrale", x: 29, y: 13 },
    { label: "Entrée principale", x: 15.5, y: 20.5 },
    { label: "Aile haute", x: 30.5, y: 10.5 },
    { label: "Aile self", x: 43.5, y: 28 },
    { label: "Axe principal", x: 36.5, y: 21 }
  ];

  window.TreasureGame.CollegeMap = {
    width: 56,
    height: 39,
    colors: COLORS,
    buildings: COLLEGE_BUILDINGS,
    landmarks: LANDMARKS
  };
})();
