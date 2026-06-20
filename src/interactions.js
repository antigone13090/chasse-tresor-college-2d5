(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  function nearbyCells(player) {
    var cells = [];
    var px = Math.floor(player.x);
    var py = Math.floor(player.y);
    for (var y = py - 1; y <= py + 1; y += 1) {
      for (var x = px - 1; x <= px + 1; x += 1) {
        cells.push({ x: x, y: y });
      }
    }
    return cells;
  }

  function distanceToCellCenter(player, x, y) {
    return Math.hypot(x + 0.5 - player.x, y + 0.5 - player.y);
  }

  function findInteraction(state, player) {
    var config = window.TreasureGame.Config;
    var cells = nearbyCells(player);
    var best = null;

    cells.forEach(function (cell) {
      if (!window.TreasureGame.MapData.isInside(cell.x, cell.y)) {
        return;
      }
      var token = state.grid[cell.y][cell.x];
      if (["D", "F", "T"].indexOf(token) === -1 && !window.TreasureGame.MapData.isClueToken(token)) {
        return;
      }
      var distance = distanceToCellCenter(player, cell.x, cell.y);
      if (distance <= config.interactionDistance && (!best || distance < best.distance)) {
        best = { token: token, x: cell.x, y: cell.y, distance: distance };
      }
    });

    return best;
  }

  function interactWithClue(state, interaction) {
    var clue = window.TreasureGame.MapData.clues[interaction.token];
    if (!clue) {
      return;
    }

    if (clue.order !== state.foundClues + 1) {
      window.TreasureGame.GameState.setMessage(state, "Tu dois d'abord trouver l'indice " + (state.foundClues + 1) + ".", 3);
      return;
    }

    state.foundClues += 1;
    state.collected[interaction.token] = true;
    state.grid[interaction.y][interaction.x] = "0";
    state.objective = clue.objective;
    if (window.TreasureGame.Audio) {
      window.TreasureGame.Audio.playClueSound();
    }
    window.TreasureGame.GameState.setMessage(state, clue.title + " : " + clue.text, 6);
  }

  function interactWithDoor(state, interaction) {
    if (interaction.token === "F" && state.foundClues < window.TreasureGame.Config.clueTotal) {
      window.TreasureGame.GameState.setMessage(state, "Cette porte reste fermée : trouve les 6 indices avant d'entrer.", 3.5);
      return;
    }

    state.grid[interaction.y][interaction.x] = "0";
    window.TreasureGame.GameState.setMessage(state, "La porte s'ouvre.", 1.8);
  }

  function interactWithTreasure(state, interaction) {
    if (state.foundClues < window.TreasureGame.Config.clueTotal) {
      window.TreasureGame.GameState.setMessage(state, "Le trésor est verrouillé par l'énigme : trouve tous les indices.", 3);
      return;
    }

    state.treasureFound = true;
    state.grid[interaction.y][interaction.x] = "0";
    state.objective = "Victoire : tu as terminé la chasse au trésor.";
    if (window.TreasureGame.Audio) {
      window.TreasureGame.Audio.playTreasureSound();
      window.TreasureGame.Audio.stopAmbientLoop();
    }
    window.TreasureGame.GameState.setMessage(state, "Victoire ! Tu as trouvé le trésor du collège.", 8);
  }

  function performInteraction(state, player) {
    var interaction = findInteraction(state, player);
    if (!interaction) {
      window.TreasureGame.GameState.setMessage(state, "Aucun objet à portée.", 1.5);
      return;
    }

    if (interaction.token === "D" || interaction.token === "F") {
      interactWithDoor(state, interaction);
    } else if (interaction.token === "T") {
      interactWithTreasure(state, interaction);
    } else {
      interactWithClue(state, interaction);
    }
  }

  window.TreasureGame.Interactions = {
    find: findInteraction,
    perform: performInteraction
  };
})();
