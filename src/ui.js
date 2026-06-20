(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  function byId(id) {
    return document.getElementById(id);
  }

  function setScreen(id) {
    ["main-menu", "discover-screen", "settings-screen", "credits-screen", "pause-screen"].forEach(function (screenId) {
      byId(screenId).classList.toggle("active", screenId === id);
    });
  }

  function bindMenus(game) {
    var instructionsToggle = byId("instructions-toggle");

    byId("play-button").addEventListener("click", game.start);
    byId("discover-button").addEventListener("click", function () {
      setScreen("discover-screen");
    });
    byId("discover-back-button").addEventListener("click", function () {
      setScreen("main-menu");
    });
    byId("settings-button").addEventListener("click", function () {
      setScreen("settings-screen");
    });
    byId("settings-back-button").addEventListener("click", function () {
      setScreen("main-menu");
    });
    byId("credits-button").addEventListener("click", function () {
      setScreen("credits-screen");
    });
    byId("credits-back-button").addEventListener("click", function () {
      setScreen("main-menu");
    });
    instructionsToggle.addEventListener("change", function () {
      game.setInstructionsVisible(instructionsToggle.checked);
    });
    byId("resume-button").addEventListener("click", game.resume);
    byId("pause-menu-button").addEventListener("click", game.backToMenu);
  }

  function getInstructionsVisible() {
    return byId("instructions-toggle").checked;
  }

  function updateHud(state, player) {
    var hud = byId("hud");
    var objectiveCard = byId("objective-card");
    var prompt = byId("interaction-prompt");
    var message = byId("message");
    var debug = byId("debug-panel");
    var cellX = Math.floor(player.x);
    var cellY = Math.floor(player.y);
    var zoneName = window.TreasureGame.MapData.zoneAt(cellX, cellY);

    hud.classList.toggle("hidden", state.mode !== "playing" && state.mode !== "paused");
    objectiveCard.classList.toggle("hidden", !state.showInstructions);
    byId("objective-text").textContent = state.objective;
    byId("clue-count").textContent = state.foundClues + " / " + window.TreasureGame.Config.clueTotal;
    byId("zone-text").textContent = zoneName;
    byId("place-description").textContent = window.TreasureGame.MapData.zoneDescriptionAt(cellX, cellY);

    prompt.classList.toggle("hidden", state.mode !== "playing" || !state.currentInteraction);

    message.textContent = state.temporaryMessage;
    message.classList.toggle("hidden", !state.temporaryMessage);

    debug.classList.toggle("hidden", !state.showDebug);
    if (state.showDebug) {
      debug.textContent = [
        "Mode professeur",
        "Position : " + player.x.toFixed(2) + ", " + player.y.toFixed(2),
        "Case : " + cellX + ", " + cellY,
        "Zone : " + zoneName,
        "Direction : " + player.angle.toFixed(2) + " rad",
        "FPS : " + state.fps.toFixed(0),
        "Indice actuel : " + Math.min(state.foundClues + 1, window.TreasureGame.Config.clueTotal)
      ].join("\n");
    }
  }

  window.TreasureGame.UI = {
    bindMenus: bindMenus,
    getInstructionsVisible: getInstructionsVisible,
    setScreen: setScreen,
    updateHud: updateHud
  };
})();
