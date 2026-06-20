(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  var STORAGE_KEY = "treasureGameAudioSettings";
  var audioContext = null;
  var masterGain = null;
  var ambientGain = null;
  var ambientFilter = null;
  var ambientTimer = null;
  var ambientPlaying = false;
  var muted = false;
  var ambientEnabled = true;
  var effectsEnabled = true;
  var volume = 0.35;
  var gameActive = false;
  var activeAmbientNodes = [];
  var ambientStep = 0;

  var AMBIENT_NOTES = [
    { name: "A3", frequency: 220 },
    { name: "C4", frequency: 261.63 },
    { name: "E4", frequency: 329.63 },
    { name: "G4", frequency: 392 },
    { name: "E4", frequency: 329.63 },
    { name: "C4", frequency: 261.63 }
  ];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function loadSettings() {
    try {
      var stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored) {
        return;
      }
      muted = Boolean(stored.muted);
      ambientEnabled = stored.ambientEnabled !== false;
      effectsEnabled = stored.effectsEnabled !== false;
      volume = typeof stored.volume === "number" ? clamp(stored.volume, 0, 1) : 0.35;
    } catch (error) {
      muted = false;
      ambientEnabled = true;
      effectsEnabled = true;
      volume = 0.35;
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        muted: muted,
        ambientEnabled: ambientEnabled,
        effectsEnabled: effectsEnabled,
        volume: volume
      }));
    } catch (error) {
      // Audio still works if localStorage is blocked.
    }
  }

  function currentTime() {
    return audioContext ? audioContext.currentTime : 0;
  }

  function applyMasterVolume() {
    if (!masterGain || !audioContext) {
      return;
    }
    masterGain.gain.cancelScheduledValues(currentTime());
    masterGain.gain.setTargetAtTime(muted ? 0 : volume, currentTime(), 0.02);
  }

  function initAudio() {
    loadSettings();

    if (!audioContext) {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.log("[Audio] init unavailable");
        return false;
      }

      audioContext = new AudioContext();
      masterGain = audioContext.createGain();
      ambientGain = audioContext.createGain();
      ambientFilter = audioContext.createBiquadFilter();

      ambientGain.gain.value = 0.16;
      ambientFilter.type = "lowpass";
      ambientFilter.frequency.value = 1500;
      ambientFilter.Q.value = 0.55;

      ambientGain.connect(ambientFilter);
      ambientFilter.connect(masterGain);
      masterGain.connect(audioContext.destination);
    }

    applyMasterVolume();
    console.log("[Audio] init");
    console.log("[Audio] settings", getAudioSettings());
    return true;
  }

  function resumeAudio() {
    if (!initAudio()) {
      return Promise.resolve(false);
    }

    if (audioContext.state === "suspended") {
      return audioContext.resume().then(function () {
        console.log("[Audio] resumed", audioContext.state);
        return true;
      });
    }

    console.log("[Audio] resumed", audioContext.state);
    return Promise.resolve(true);
  }

  function envelope(gainNode, start, attack, hold, release, peak) {
    gainNode.gain.cancelScheduledValues(start);
    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.linearRampToValueAtTime(peak, start + attack);
    gainNode.gain.setValueAtTime(peak, start + attack + hold);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + attack + hold + release);
  }

  function playTone(frequency, start, duration, type, peak, destination, options) {
    var oscillator = audioContext.createOscillator();
    var gainNode = audioContext.createGain();
    var attack = options && options.attack !== undefined ? options.attack : 0.01;
    var release = options && options.release !== undefined ? options.release : 0.04;
    var hold = Math.max(0.01, duration - attack - release);

    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    if (options && options.detune) {
      oscillator.detune.setValueAtTime(options.detune, start);
    }

    envelope(gainNode, start, attack, hold, release, peak);
    oscillator.connect(gainNode);
    gainNode.connect(destination || masterGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);

    if (destination === ambientGain) {
      activeAmbientNodes.push(oscillator);
      oscillator.onended = function () {
        var index = activeAmbientNodes.indexOf(oscillator);
        if (index !== -1) {
          activeAmbientNodes.splice(index, 1);
        }
      };
    }
  }

  function canPlayEffects() {
    return initAudio() && !muted && effectsEnabled && volume > 0;
  }

  function playClickSound() {
    if (!canPlayEffects()) {
      return;
    }

    var start = currentTime();
    playTone(420, start, 0.04, "triangle", 0.18, masterGain, { attack: 0.004, release: 0.018 });
    playTone(650, start + 0.04, 0.04, "triangle", 0.15, masterGain, { attack: 0.004, release: 0.02 });
    console.log("[Audio] click");
  }

  function playPanelSound() {
    if (!canPlayEffects()) {
      return;
    }

    var start = currentTime();
    playTone(330, start, 0.11, "sine", 0.11, masterGain, { attack: 0.012, release: 0.06 });
    playTone(440, start + 0.07, 0.12, "triangle", 0.08, masterGain, { attack: 0.018, release: 0.07 });
  }

  function playClueSound() {
    if (!canPlayEffects()) {
      return;
    }

    var start = currentTime();
    playTone(523.25, start, 0.12, "sine", 0.13, masterGain, { attack: 0.01, release: 0.05 });
    playTone(659.25, start + 0.11, 0.14, "sine", 0.12, masterGain, { attack: 0.01, release: 0.06 });
    playTone(783.99, start + 0.24, 0.2, "triangle", 0.1, masterGain, { attack: 0.012, release: 0.08 });
  }

  function playTreasureSound() {
    if (!canPlayEffects()) {
      return;
    }

    var start = currentTime();
    playTone(392, start, 0.18, "triangle", 0.14, masterGain, { attack: 0.012, release: 0.07 });
    playTone(523.25, start + 0.14, 0.2, "sine", 0.14, masterGain, { attack: 0.012, release: 0.08 });
    playTone(659.25, start + 0.3, 0.24, "sine", 0.13, masterGain, { attack: 0.012, release: 0.09 });
    playTone(783.99, start + 0.5, 0.34, "triangle", 0.11, masterGain, { attack: 0.018, release: 0.12 });
    playTone(1046.5, start + 0.78, 0.5, "sine", 0.08, masterGain, { attack: 0.02, release: 0.2 });
  }

  function playAmbientPhrase() {
    if (!audioContext || muted || !ambientEnabled || !ambientPlaying || volume <= 0) {
      return;
    }

    var start = currentTime() + 0.03;
    var noteSpacing = 0.46;

    AMBIENT_NOTES.forEach(function (note, index) {
      var phraseIndex = (ambientStep + index) % AMBIENT_NOTES.length;
      var selected = AMBIENT_NOTES[phraseIndex];
      playTone(selected.frequency, start + index * noteSpacing, 0.82, "triangle", 0.085, ambientGain, {
        attack: 0.08,
        release: 0.42,
        detune: index % 2 === 0 ? -2 : 2
      });
    });

    playTone(110, start, 2.7, "sine", 0.045, ambientGain, {
      attack: 0.25,
      release: 1.25
    });

    ambientStep = (ambientStep + 1) % AMBIENT_NOTES.length;
  }

  function startAmbientMusic() {
    gameActive = true;
    if (!initAudio() || muted || !ambientEnabled || ambientPlaying) {
      return;
    }

    resumeAudio().then(function () {
      if (muted || !ambientEnabled || ambientPlaying) {
        return;
      }

      ambientPlaying = true;
      ambientGain.gain.cancelScheduledValues(currentTime());
      ambientGain.gain.setTargetAtTime(0.16, currentTime(), 0.08);
      playAmbientPhrase();
      ambientTimer = window.setInterval(playAmbientPhrase, 3600);
      console.log("[Audio] start ambient");
      console.log("[Audio] settings", getAudioSettings());
    });
  }

  function stopAmbientMusic() {
    if (ambientTimer) {
      window.clearInterval(ambientTimer);
      ambientTimer = null;
    }

    activeAmbientNodes.forEach(function (node) {
      try {
        node.stop();
      } catch (error) {
        // Already stopped.
      }
    });
    activeAmbientNodes = [];

    if (ambientGain && audioContext) {
      ambientGain.gain.cancelScheduledValues(currentTime());
      ambientGain.gain.setTargetAtTime(0.0001, currentTime(), 0.04);
    }

    ambientPlaying = false;
    console.log("[Audio] stop ambient");
    console.log("[Audio] settings", getAudioSettings());
  }

  function setMuted(value) {
    muted = Boolean(value);
    saveSettings();
    initAudio();

    if (muted) {
      stopAmbientMusic();
    } else if (gameActive && ambientEnabled) {
      startAmbientMusic();
    }
    applyMasterVolume();
  }

  function setVolume(value) {
    volume = clamp(Number(value) || 0, 0, 1);
    saveSettings();
    initAudio();
    applyMasterVolume();
    if (volume > 0 && gameActive && ambientEnabled && !muted) {
      if (ambientPlaying) {
        playAmbientPhrase();
      } else {
        startAmbientMusic();
      }
    }
  }

  function setAmbientEnabled(value) {
    ambientEnabled = Boolean(value);
    saveSettings();

    if (!ambientEnabled) {
      stopAmbientMusic();
      return;
    }

    if (gameActive && !muted) {
      startAmbientMusic();
    }
  }

  function setEffectsEnabled(value) {
    effectsEnabled = Boolean(value);
    saveSettings();
  }

  function resetAudioSettings() {
    muted = false;
    ambientEnabled = true;
    effectsEnabled = true;
    volume = 0.35;
    saveSettings();
    initAudio();
    applyMasterVolume();
    if (gameActive) {
      startAmbientMusic();
    }
  }

  function setGameActive(value) {
    gameActive = Boolean(value);
    if (!gameActive) {
      stopAmbientMusic();
    }
  }

  function getAudioSettings() {
    return {
      muted: muted,
      ambientEnabled: ambientEnabled,
      effectsEnabled: effectsEnabled,
      volume: volume,
      ambientPlaying: ambientPlaying,
      audioContextState: audioContext ? audioContext.state : "non initialisé"
    };
  }

  loadSettings();

  window.TreasureGame.Audio = {
    initAudio: initAudio,
    resumeAudio: resumeAudio,
    playClickSound: playClickSound,
    playPanelSound: playPanelSound,
    playClueSound: playClueSound,
    playTreasureSound: playTreasureSound,
    startAmbientMusic: startAmbientMusic,
    stopAmbientMusic: stopAmbientMusic,
    setMuted: setMuted,
    setVolume: setVolume,
    setAmbientEnabled: setAmbientEnabled,
    setEffectsEnabled: setEffectsEnabled,
    resetAudioSettings: resetAudioSettings,
    setGameActive: setGameActive,
    getAudioSettings: getAudioSettings,

    init: initAudio,
    startAmbientLoop: startAmbientMusic,
    stopAmbientLoop: stopAmbientMusic,
    getSettings: getAudioSettings
  };
})();
