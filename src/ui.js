(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  function byId(id) {
    return document.getElementById(id);
  }

  function soundButton() {
    if (window.TreasureGame.Audio) {
      window.TreasureGame.Audio.unlock();
      window.TreasureGame.Audio.button();
    }
  }

  function setScreen(id) {
    ["main-menu", "rules-screen", "pause-screen"].forEach(function (screenId) {
      byId(screenId).classList.toggle("active", screenId === id);
    });
  }

  function quitOrReturn() {
    soundButton();

    if (document.pointerLockElement && document.exitPointerLock) {
      document.exitPointerLock();
    }

    // Tente d'abord de fermer l'onglet lorsqu'il a été ouvert depuis Moodle.
    // Si le navigateur refuse window.close(), on revient à la page précédente
    // ou, à défaut, à l'accueil du site.
    window.close();

    window.setTimeout(function () {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "/";
      }
    }, 180);
  }

  function bindMenus(game) {
    byId("play-button").addEventListener("click", function () {
      soundButton();
      game.start();
    });

    byId("rules-button").addEventListener("click", function () {
      soundButton();
      setScreen("rules-screen");
    });

    byId("rules-back-button").addEventListener("click", function () {
      soundButton();
      setScreen("main-menu");
    });

    byId("sound-button").addEventListener("click", function () {
      var enabled = window.TreasureGame.Audio.toggle();
      byId("sound-button").textContent = enabled ? "Son : activé" : "Son : coupé";
    });

    byId("quit-button").addEventListener("click", quitOrReturn);

    byId("resume-button").addEventListener("click", function () {
      soundButton();
      game.resume();
    });

    byId("pause-menu-button").addEventListener("click", function () {
      soundButton();
      game.backToMenu();
    });
  }

  function updateHud(state, player) {
    var hud = byId("hud");
    var prompt = byId("interaction-prompt");
    var message = byId("message");
    var debug = byId("debug-panel");
    var cellX = Math.floor(player.x);
    var cellY = Math.floor(player.y);

    hud.classList.toggle("hidden", state.mode !== "playing" && state.mode !== "paused");
    byId("objective-text").textContent = state.objective;
    byId("clue-count").textContent = state.foundClues + " / " + window.TreasureGame.Config.clueTotal;
    byId("zone-text").textContent = window.TreasureGame.MapData.zoneAt(cellX, cellY);

    prompt.classList.toggle("hidden", state.mode !== "playing" || !state.currentInteraction);

    message.textContent = state.temporaryMessage;
    message.classList.toggle("hidden", !state.temporaryMessage);

    debug.classList.toggle("hidden", !state.showDebug);
    if (state.showDebug) {
      debug.textContent = [
        "Mode professeur",
        "Position : " + player.x.toFixed(2) + ", " + player.y.toFixed(2),
        "Case : " + cellX + ", " + cellY,
        "Zone : " + window.TreasureGame.MapData.zoneAt(cellX, cellY),
        "Direction : " + player.angle.toFixed(2) + " rad",
        "FPS : " + state.fps.toFixed(0),
        "Indice actuel : " + Math.min(state.foundClues + 1, window.TreasureGame.Config.clueTotal)
      ].join("\n");
    }
  }

  window.TreasureGame.UI = {
    bindMenus: bindMenus,
    setScreen: setScreen,
    updateHud: updateHud
  };
})();