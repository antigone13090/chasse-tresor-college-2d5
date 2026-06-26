(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  function byId(id) {
    return document.getElementById(id);
  }

  function setScreen(id) {
    ["main-menu", "discover-screen", "future-project-screen", "settings-screen", "credits-screen", "pause-screen"].forEach(function (screenId) {
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
    var settings = audio ? audio.getAudioSettings() : {
      muted: true,
      volume: 0.35,
      ambientEnabled: false,
      effectsEnabled: false,
      ambientPlaying: false,
      audioContextState: "non initialisé"
    };
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
    updateAudioIndicator(settings);
  }

  function updateAudioIndicator(settings) {
    var audioStatus = byId("audio-status");
    var settingsStatus = byId("settings-audio-status");
    var enabled = settings && !settings.muted && settings.ambientEnabled;
    var playing = enabled && settings.ambientPlaying;
    var text = "Musique : " + (playing ? "ON" : "OFF");
    var contextState = settings && settings.audioContextState ? settings.audioContextState : "non initialisé";

    if (audioStatus) {
      audioStatus.textContent = text;
    }
    if (settingsStatus) {
      settingsStatus.innerHTML = "État audio : " + contextState + "<br>Musique : " + (playing ? "active" : "inactive");
    }
  }

  function initMenusFromStorage() {
    var instructionsToggle = byId("instructions-toggle");
    instructionsToggle.checked = loadInstructionsVisible();
    setToggleLabel(instructionsToggle, "Afficher les consignes : activé", "Afficher les consignes : désactivé");
    populateFutureProjectPanel();
    syncAudioControls();
  }

  function populateFutureProjectPanel() {
    var vision = window.TreasureGame.ProjectVision;
    if (!vision) {
      return;
    }

    byId("future-project-title").textContent = vision.title;
    byId("future-project-summary").textContent = vision.summary;
    byId("future-current-prototype").textContent = vision.currentPrototype;
    byId("future-goal").textContent = vision.futureGoal;
    byId("future-engine").textContent = vision.possibleEngine;
    byId("future-contribution").textContent = vision.studentContribution;
    byId("future-next-step").textContent = vision.nextSteps.join(", ") + ".";
  }

  function bindMenus(game) {
    var instructionsToggle = byId("instructions-toggle");
    var soundToggle = byId("sound-toggle");
    var ambientToggle = byId("ambient-toggle");
    var effectsToggle = byId("effects-toggle");
    var volumeSlider = byId("volume-slider");
    var resetAudioButton = byId("reset-audio-button");
    var audio = window.TreasureGame.Audio;
    var settingsReturnScreen = "main-menu";

    initMenusFromStorage();

    byId("play-button").addEventListener("click", async function () {
      if (audio) {
        audio.initAudio();
        await audio.resumeAudio();
        audio.playClickSound();
        audio.startAmbientMusic();
      }
      game.start();
      if (audio) {
        updateAudioIndicator(audio.getAudioSettings());
      }
    });
    byId("discover-button").addEventListener("click", function () {
      if (audio) {
        audio.initAudio();
        audio.resumeAudio();
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
    byId("future-project-button").addEventListener("click", function () {
      if (audio) {
        audio.initAudio();
        audio.resumeAudio();
        audio.playPanelSound();
      }
      setScreen("future-project-screen");
    });
    byId("future-project-back-button").addEventListener("click", function () {
      if (audio) {
        audio.playClickSound();
      }
      setScreen("main-menu");
    });
    byId("settings-button").addEventListener("click", function () {
      if (audio) {
        audio.initAudio();
        audio.resumeAudio();
        audio.playPanelSound();
      }
      settingsReturnScreen = "main-menu";
      setScreen("settings-screen");
    });
    byId("settings-back-button").addEventListener("click", function () {
      if (audio) {
        audio.playClickSound();
      }
      setScreen(settingsReturnScreen);
    });
    byId("credits-button").addEventListener("click", function () {
      if (audio) {
        audio.initAudio();
        audio.resumeAudio();
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
        audio.resumeAudio();
        audio.setMuted(!soundToggle.checked);
        if (soundToggle.checked) {
          audio.playPanelSound();
          if (game.isInGame && game.isInGame()) {
            audio.startAmbientMusic();
          }
        }
        updateAudioIndicator(audio.getAudioSettings());
      }
      setToggleLabel(soundToggle, "Son : activé", "Son : désactivé");
      syncAudioControls();
    });
    ambientToggle.addEventListener("change", function () {
      if (audio) {
        audio.initAudio();
        audio.resumeAudio();
        audio.setAmbientEnabled(ambientToggle.checked);
        audio.playPanelSound();
        if (ambientToggle.checked && game.isInGame && game.isInGame()) {
          audio.startAmbientMusic();
        } else {
          audio.stopAmbientMusic();
        }
        updateAudioIndicator(audio.getAudioSettings());
      }
      setToggleLabel(ambientToggle, "Musique d’ambiance : activée", "Musique d’ambiance : désactivée");
      syncAudioControls();
    });
    effectsToggle.addEventListener("change", function () {
      if (audio) {
        audio.initAudio();
        audio.resumeAudio();
        audio.setEffectsEnabled(effectsToggle.checked);
        audio.playPanelSound();
        updateAudioIndicator(audio.getAudioSettings());
      }
      setToggleLabel(effectsToggle, "Effets sonores : activés", "Effets sonores : désactivés");
      syncAudioControls();
    });
    volumeSlider.addEventListener("input", function () {
      byId("volume-value").textContent = volumeSlider.value;
      if (audio) {
        audio.setVolume(Number(volumeSlider.value) / 100);
        updateAudioIndicator(audio.getAudioSettings());
      }
    });
    volumeSlider.addEventListener("change", function () {
      if (audio) {
        audio.playPanelSound();
      }
    });
    resetAudioButton.addEventListener("click", function () {
      if (audio) {
        audio.initAudio();
        audio.resumeAudio().then(function () {
          audio.resetAudioSettings();
          audio.playPanelSound();
          if (game.isInGame && game.isInGame()) {
            audio.startAmbientMusic();
          }
          syncAudioControls();
        });
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
        audio.resumeAudio();
        audio.playClickSound();
      }
      game.resume();
    });
    byId("pause-settings-button").addEventListener("click", function () {
      if (audio) {
        audio.resumeAudio();
        audio.playPanelSound();
      }
      settingsReturnScreen = "pause-screen";
      setScreen("settings-screen");
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
    if (window.TreasureGame.Audio) {
      updateAudioIndicator(window.TreasureGame.Audio.getAudioSettings());
    }

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
