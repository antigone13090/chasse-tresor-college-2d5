(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  var college = window.TreasureGame.CollegeMap;
  var BLOCKING_TOKENS = ["1", "W0", "W1", "W2", "WS", "D", "F"];

  /*
    Grid legend:
    1  = outside boundary wall
    0  = walkable path, courtyard or corridor
    W0 = RDC wall, W1 = R+1 wall, W2 = R+2 wall, WS = special/admin wall
    D  = normal door, F = final locked door
    S  = stairs marker, P = outdoor landmark marker
    C1..C6 = quest clues, T = final treasure
  */
  function createEmptyGrid(width, height) {
    var grid = [];
    for (var y = 0; y < height; y += 1) {
      var row = [];
      for (var x = 0; x < width; x += 1) {
        row.push(x === 0 || y === 0 || x === width - 1 || y === height - 1 ? "1" : "0");
      }
      grid.push(row);
    }
    return grid;
  }

  function fillRect(grid, building) {
    var marker = building.floor === "STAIRS" ? "S" : "P";
    var token = building.collidable ? building.wallToken : marker;

    for (var y = building.y; y < building.y + building.height; y += 1) {
      for (var x = building.x; x < building.x + building.width; x += 1) {
        if (isInsideGrid(grid, x, y)) {
          grid[y][x] = token;
        }
      }
    }

    if (building.doors) {
      building.doors.forEach(function (door) {
        if (isInsideGrid(grid, door.x, door.y)) {
          grid[door.y][door.x] = door.final ? "F" : "D";
        }
      });
    }
  }

  function isInsideGrid(grid, x, y) {
    return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
  }

  function buildGrid() {
    var grid = createEmptyGrid(college.width, college.height);

    college.buildings.forEach(function (building) {
      fillRect(grid, building);
    });

    // Quest markers are placed in walkable cells just outside recognizable rooms.
    grid[17][23] = "C1"; // Vie scolaire
    grid[22][29] = "C2"; // CDI
    grid[27][35] = "C3"; // Auditorium
    grid[14][13] = "C4"; // Gymnase / Preau
    grid[12][34] = "C5"; // Arts / Musique
    grid[28][43] = "C6"; // Self eleves
    grid[23][30] = "T";  // Cour centrale, near Conseils / Multi 1

    return grid;
  }

  var grid = buildGrid();

  var clues = {
    C1: {
      order: 1,
      title: "Indice 1 - Vie scolaire",
      text: "Premier indice : là où les absences sont notées.",
      objective: "Va au CDI pour trouver l'indice 2."
    },
    C2: {
      order: 2,
      title: "Indice 2 - CDI",
      text: "Cherche parmi les livres et les savoirs.",
      objective: "Va à l'auditorium pour trouver l'indice 3."
    },
    C3: {
      order: 3,
      title: "Indice 3 - Auditorium",
      text: "Le prochain indice aime les lieux où l'on écoute.",
      objective: "Va vers le gymnase pour trouver l'indice 4."
    },
    C4: {
      order: 4,
      title: "Indice 4 - Gymnase",
      text: "Ici, on court, on saute, on joue.",
      objective: "Monte vers Arts et Musique pour trouver l'indice 5."
    },
    C5: {
      order: 5,
      title: "Indice 5 - Arts et Musique",
      text: "Les créations et les sons indiquent la suite du parcours.",
      objective: "Va au self élèves pour trouver l'indice 6."
    },
    C6: {
      order: 6,
      title: "Indice 6 - Self élèves",
      text: "Le trésor se rapproche là où les élèves reprennent des forces.",
      objective: "Retourne dans la cour centrale, près de Conseils et Multi 1."
    }
  };

  var zones = college.buildings.map(function (building) {
    return {
      id: building.id,
      name: building.label,
      floor: building.floor,
      color: building.color,
      collidable: building.collidable,
      x1: building.x,
      y1: building.y,
      x2: building.x + building.width - 1,
      y2: building.y + building.height - 1
    };
  }).concat([
    { id: "couloir-gymnase", name: "Passage gymnase / preau", floor: "EXT", color: college.colors.path, collidable: false, x1: 13, y1: 13, x2: 19, y2: 20 },
    { id: "axe-central", name: "Axe principal", floor: "EXT", color: college.colors.path, collidable: false, x1: 20, y1: 9, x2: 38, y2: 24 },
    { id: "coursive-self", name: "Coursive self / auditorium", floor: "EXT", color: college.colors.path, collidable: false, x1: 35, y1: 20, x2: 43, y2: 32 },
    { id: "aile-haute", name: "Aile Arts et Musique", floor: "EXT", color: college.colors.path, collidable: false, x1: 33, y1: 5, x2: 50, y2: 16 },
    { id: "entree", name: "Entrée principale", floor: "EXT", color: college.colors.path, collidable: false, x1: 13, y1: 18, x2: 19, y2: 22 }
  ]);

  var tileColors = {
    "1": "#707982",
    W0: college.colors.rdc,
    W1: college.colors.r1,
    W2: college.colors.r2,
    WS: college.colors.special,
    D: "#9a6d44",
    F: "#7d4b3a",
    S: college.colors.stairs,
    P: college.colors.outdoor,
    "0": college.colors.path
  };

  var legend = [
    { label: "RDC", color: college.colors.rdc },
    { label: "R+1", color: college.colors.r1 },
    { label: "R+2", color: college.colors.r2 },
    { label: "Escaliers", color: college.colors.stairs },
    { label: "Zones spéciales", color: college.colors.special }
  ];

  function cloneGrid(source) {
    return source.map(function (row) {
      return row.slice();
    });
  }

  function isInside(x, y) {
    return isInsideGrid(grid, x, y);
  }

  function isBlockingToken(token) {
    return BLOCKING_TOKENS.indexOf(token) !== -1;
  }

  function isClueToken(token) {
    return Object.prototype.hasOwnProperty.call(clues, token);
  }

  function findToken(token) {
    for (var y = 0; y < grid.length; y += 1) {
      for (var x = 0; x < grid[y].length; x += 1) {
        if (grid[y][x] === token) {
          return { x: x, y: y };
        }
      }
    }
    return null;
  }

  function zoneAt(cellX, cellY) {
    for (var i = 0; i < zones.length; i += 1) {
      var zone = zones[i];
      if (cellX >= zone.x1 && cellX <= zone.x2 && cellY >= zone.y1 && cellY <= zone.y2) {
        return zone.name;
      }
    }
    return "Coursive ou chemin";
  }

  function tileColor(token) {
    if (isClueToken(token)) {
      return "#4ac0ad";
    }
    if (token === "T") {
      return "#f1c94d";
    }
    return tileColors[token] || tileColors["0"];
  }

  window.TreasureGame.MapData = {
    baseGrid: grid,
    zones: zones,
    clues: clues,
    legend: legend,
    buildings: college.buildings,
    landmarks: college.landmarks,
    start: { x: 15.5, y: 20.5, angle: -0.15 },
    cloneGrid: cloneGrid,
    isInside: isInside,
    isBlockingToken: isBlockingToken,
    isClueToken: isClueToken,
    findToken: findToken,
    zoneAt: zoneAt,
    tileColor: tileColor
  };
})();
