"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.resolve(__dirname, "..");
var context = {
  console: console,
  window: { TreasureGame: {} }
};

vm.createContext(context);

[
  "src/config.js",
  "src/mapCollege.js",
  "src/map.js"
].forEach(function (file) {
  var source = fs.readFileSync(path.join(root, file), "utf8");
  vm.runInContext(source, context, { filename: file });
});

var game = context.window.TreasureGame;
var mapData = game.MapData;
var config = game.Config;
var grid = mapData.baseGrid;
var expected = {
  C1: "Vie scolaire",
  C2: "CDI",
  C3: "Auditorium",
  C4: "Gymnase / Préau",
  C5: "Arts / Musique",
  C6: "Self élèves",
  T: "Conseils / Multi 1"
};
var failures = [];

function fail(message) {
  failures.push(message);
}

function isWalkableToken(token) {
  return !mapData.isBlockingToken(token);
}

function key(x, y) {
  return x + "," + y;
}

function bfs(startX, startY) {
  var queue = [{ x: startX, y: startY }];
  var visited = {};
  visited[key(startX, startY)] = true;

  for (var i = 0; i < queue.length; i += 1) {
    var cell = queue[i];
    [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 }
    ].forEach(function (next) {
      if (!mapData.isInside(next.x, next.y) || visited[key(next.x, next.y)]) {
        return;
      }
      if (!isWalkableToken(grid[next.y][next.x])) {
        return;
      }
      visited[key(next.x, next.y)] = true;
      queue.push(next);
    });
  }

  return visited;
}

function checkDimensions() {
  if (grid.length !== game.CollegeMap.height) {
    fail("Hauteur de carte incorrecte : " + grid.length + " au lieu de " + game.CollegeMap.height);
  }
  grid.forEach(function (row, y) {
    if (row.length !== game.CollegeMap.width) {
      fail("Largeur incorrecte ligne " + y + " : " + row.length + " au lieu de " + game.CollegeMap.width);
    }
  });
}

function checkClueTexts() {
  for (var i = 1; i <= config.clueTotal; i += 1) {
    var token = "C" + i;
    var clue = mapData.clues[token];
    if (!clue) {
      fail(token + " manque dans mapData.clues.");
      continue;
    }
    ["order", "title", "text", "objective"].forEach(function (field) {
      if (clue[field] === undefined || clue[field] === "") {
        fail(token + " a un champ vide ou manquant : " + field);
      }
    });
    if (clue.order !== i) {
      fail(token + " a un ordre incorrect : " + clue.order + " au lieu de " + i);
    }
  }
}

function checkReachability() {
  var startX = Math.floor(mapData.start.x);
  var startY = Math.floor(mapData.start.y);
  if (!mapData.isInside(startX, startY)) {
    fail("Le départ est hors carte.");
    return;
  }
  if (!isWalkableToken(grid[startY][startX])) {
    fail("Le départ est sur une case bloquante : " + grid[startY][startX]);
    return;
  }

  var reachable = bfs(startX, startY);

  Object.keys(expected).forEach(function (token) {
    var position = mapData.findToken(token);
    if (!position) {
      fail(token + " est absent de la grille.");
      return;
    }
    var tile = grid[position.y][position.x];
    var zone = mapData.zoneAt(position.x, position.y);

    if (!isWalkableToken(tile)) {
      fail(token + " est sur une case bloquante : " + tile);
    }
    if (!reachable[key(position.x, position.y)]) {
      fail(token + " n'est pas atteignable depuis le départ.");
    }
    if (zone !== expected[token]) {
      fail(token + " affiche la zone HUD \"" + zone + "\" au lieu de \"" + expected[token] + "\".");
    }

    console.log(token + " OK - (" + position.x + "," + position.y + ") - " + zone);
  });
}

checkDimensions();
checkClueTexts();
checkReachability();

if (failures.length > 0) {
  console.error("\nVérification carte échouée :");
  failures.forEach(function (message) {
    console.error("- " + message);
  });
  process.exit(1);
}

console.log("\nCarte OK : dimensions, départ, C1-C6, trésor et zones HUD vérifiés.");
