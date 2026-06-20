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

  function setToggleLabel(input, enabledText, disabledText) {
    var label = input.parentElement.querySelector("span");
    if (label) {
      label.textContent = input.checked ? enabledText : disabledText;
    }
  }

  function loadInstructionsVisible() {
    try {
      var stored = localStorage.getItem("treasureGameShowInstructions");
      return stored === null ? true : stored === "true";
    } catch (error) {
      return true;
    }
  }

  function saveInstructionsVisible(visible) {
    try {
      localStorage.setItem("treasureGameShowInstructions", String(visible));
    } catch (error) {
      // Local storage can be unavailable; the current game session still updates.
    }
  }

  function syncAudioControls() {
    var audio = window.TreasureGame.Audio;
    var settings = audio ? audio.getAudioSettings() : { muted: true, volume: 0.45, ambientEnabled: false, effectsEnabled: false };
    var soundToggle = byId("sound-toggle");
    var ambientToggle = byId("ambient-toggle");
    var effectsToggle = byId("effects-toggle");
    var volumeSlider = byId("volume-slider");

    soundToggle.checked = !settings.muted;
    ambientToggle.checked = settings.ambientEnabled;
    effectsToggle.checked = settings.effectsEnabled;
    volumeSlider.value = Math.round(settings.volume * 100);
    byId("volume-value").textContent = volumeSlider.value;
    setToggleLabel(soundToggle, "Son : activé", "Son : désactivé");
    setToggleLabel(ambientToggle, "Musique d’ambiance : activée", "Musique d’ambiance : désactivée");
    setToggleLabel(effectsToggle, "Effets sonores : activés", "Effets sonores : désactivés");
  }

  function initMenusFromStorage() {
    var instructionsToggle = byId("instructions-toggle");
    instructionsToggle.checked = loadInstructionsVisible();
    setToggleLabel(instructionsToggle, "Afficher les consignes : activé", "Afficher les consignes : désactivé");
    syncAudioControls();
  }

  function bindMenus(game) {
    var instructionsToggle = byId("instructions-toggle");
    var soundToggle = byId("sound-toggle");
    var ambientToggle = byId("ambient-toggle");
    var effectsToggle = byId("effects-toggle");
    var volumeSlider = byId("volume-slider");
    var audio = window.TreasureGame.Audio;

    initMenusFromStorage();

    byId("play-button").addEventListener("click", function () {
      if (audio) {
        audio.initAudio();
        audio.playClickSound();
      }
      game.start();
    });
    byId("discover-button").addEventListener("click", function () {
      if (audio) {
        audio.initAudio();
        audio.playPanelSound();
      }
      setScreen("discover-screen");
    });
    byId("discover-back-button").addEventListener("click", function () {
      if (audio) {
        audio.playClickSound();
      }
      setScreen("main-menu");
    });
    byId("settings-button").addEventListener("click", function () {
      if (audio) {
        audio.initAudio();
        audio.playPanelSound();
      }
      setScreen("settings-screen");
    });
    byId("settings-back-button").addEventListener("click", function () {
      if (audio) {
        audio.playClickSound();
      }
      setScreen("main-menu");
    });
    byId("credits-button").addEventListener("click", function () {
      if (audio) {
        audio.initAudio();
        audio.playPanelSound();
      }
      setScreen("credits-screen");
    });
    byId("credits-back-button").addEventListener("click", function () {
      if (audio) {
        audio.playClickSound();
      }
      setScreen("main-menu");
    });
    soundToggle.addEventListener("change", function () {
      if (audio) {
        audio.initAudio();
        audio.setMuted(!soundToggle.checked);
        if (soundToggle.checked) {
          audio.playPanelSound();
          if (game.isPlaying && game.isPlaying()) {
            audio.startAmbientMusic();
          }
        }
      }
      setToggleLabel(soundToggle, "Son : activé", "Son : désactivé");
    });
    ambientToggle.addEventListener("change", function () {
      if (audio) {
        audio.initAudio();
        audio.setAmbientEnabled(ambientToggle.checked);
        audio.playPanelSound();
        if (ambientToggle.checked && game.isPlaying && game.isPlaying()) {
          audio.startAmbientMusic();
        } else {
          audio.stopAmbientMusic();
        }
      }
      setToggleLabel(ambientToggle, "Musique d’ambiance : activée", "Musique d’ambiance : désactivée");
    });
    effectsToggle.addEventListener("change", function () {
      if (audio) {
        audio.initAudio();
        audio.setEffectsEnabled(effectsToggle.checked);
        audio.playPanelSound();
      }
      setToggleLabel(effectsToggle, "Effets sonores : activés", "Effets sonores : désactivés");
    });
    volumeSlider.addEventListener("input", function () {
      byId("volume-value").textContent = volumeSlider.value;
      if (audio) {
        audio.setVolume(Number(volumeSlider.value) / 100);
      }
    });
    volumeSlider.addEventListener("change", function () {
      if (audio) {
        audio.playPanelSound();
      }
    });
    instructionsToggle.addEventListener("change", function () {
      if (audio) {
        audio.playPanelSound();
      }
      setToggleLabel(instructionsToggle, "Afficher les consignes : activé", "Afficher les consignes : désactivé");
      saveInstructionsVisible(instructionsToggle.checked);
      game.setInstructionsVisible(instructionsToggle.checked);
    });
    byId("resume-button").addEventListener("click", function () {
      if (audio) {
        audio.playClickSound();
      }
      game.resume();
    });
    byId("pause-menu-button").addEventListener("click", function () {
      if (audio) {
        audio.playClickSound();
        audio.stopAmbientMusic();
      }
      game.backToMenu();
    });
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
