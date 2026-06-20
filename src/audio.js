(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  var STORAGE_KEY = "treasureGameAudioSettings";
  var context = null;
  var masterGain = null;
  var ambientGain = null;
  var ambientTimer = null;
  var initialized = false;
  var settings = loadSettings();

  function loadSettings() {
    var defaults = {
      muted: false,
      volume: 0.45,
      ambientEnabled: true
    };

    try {
      var stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored) {
        return defaults;
      }
      return {
        muted: Boolean(stored.muted),
        volume: typeof stored.volume === "number" ? clamp(stored.volume, 0, 1) : defaults.volume,
        ambientEnabled: stored.ambientEnabled !== false
      };
    } catch (error) {
      return defaults;
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      // Local storage can be unavailable in restricted contexts; audio still works.
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function ensureContext() {
    if (initialized) {
      if (context && context.state === "suspended") {
        context.resume();
      }
      return Boolean(context);
    }

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return false;
    }

    context = new AudioContext();
    masterGain = context.createGain();
    ambientGain = context.createGain();
    masterGain.gain.value = settings.muted ? 0 : settings.volume;
    ambientGain.gain.value = 0.12;
    ambientGain.connect(masterGain);
    masterGain.connect(context.destination);
    initialized = true;
    return true;
  }

  function now() {
    return context ? context.currentTime : 0;
  }

  function setEnvelope(gain, start, attack, decay, peak, sustain) {
    gain.gain.cancelScheduledValues(start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), start + attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain), start + attack + decay);
  }

  function tone(frequency, start, duration, type, peak, destination) {
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    setEnvelope(gain, start, 0.012, Math.max(0.03, duration - 0.012), peak, 0.0001);
    oscillator.connect(gain);
    gain.connect(destination || masterGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function playSequence(notes) {
    if (!ensureContext() || settings.muted) {
      return;
    }
    var start = now();
    notes.forEach(function (note) {
      tone(
        note.frequency,
        start + (note.delay || 0),
        note.duration || 0.12,
        note.type || "sine",
        note.peak || 0.12,
        note.destination
      );
    });
  }

  function playClickSound() {
    playSequence([
      { frequency: 520, duration: 0.045, type: "square", peak: 0.07 },
      { frequency: 760, delay: 0.035, duration: 0.055, type: "triangle", peak: 0.045 }
    ]);
  }

  function playPanelSound() {
    playSequence([
      { frequency: 330, duration: 0.08, type: "triangle", peak: 0.06 },
      { frequency: 440, delay: 0.06, duration: 0.1, type: "sine", peak: 0.05 }
    ]);
  }

  function playClueSound() {
    playSequence([
      { frequency: 523.25, duration: 0.12, type: "sine", peak: 0.08 },
      { frequency: 659.25, delay: 0.1, duration: 0.14, type: "sine", peak: 0.075 },
      { frequency: 783.99, delay: 0.22, duration: 0.18, type: "triangle", peak: 0.07 }
    ]);
  }

  function playTreasureSound() {
    playSequence([
      { frequency: 392, duration: 0.13, type: "triangle", peak: 0.08 },
      { frequency: 523.25, delay: 0.1, duration: 0.16, type: "sine", peak: 0.085 },
      { frequency: 659.25, delay: 0.22, duration: 0.2, type: "sine", peak: 0.08 },
      { frequency: 1046.5, delay: 0.4, duration: 0.28, type: "triangle", peak: 0.06 }
    ]);
  }

  function playAmbientPulse() {
    if (!context || settings.muted || !settings.ambientEnabled || !ambientTimer) {
      return;
    }

    var start = now();
    tone(196, start, 1.8, "sine", 0.035, ambientGain);
    tone(246.94, start + 0.9, 1.4, "sine", 0.025, ambientGain);
    tone(329.63, start + 1.8, 1.2, "triangle", 0.018, ambientGain);
  }

  function startAmbientLoop() {
    if (!ensureContext() || settings.muted || !settings.ambientEnabled || ambientTimer) {
      return;
    }
    playAmbientPulse();
    ambientTimer = window.setInterval(playAmbientPulse, 4200);
  }

  function stopAmbientLoop() {
    if (ambientTimer) {
      window.clearInterval(ambientTimer);
      ambientTimer = null;
    }
  }

  function setMuted(value) {
    settings.muted = Boolean(value);
    if (ensureContext()) {
      masterGain.gain.setTargetAtTime(settings.muted ? 0 : settings.volume, now(), 0.02);
    }
    if (settings.muted) {
      stopAmbientLoop();
    }
    saveSettings();
  }

  function setVolume(value) {
    settings.volume = clamp(value, 0, 1);
    if (ensureContext() && !settings.muted) {
      masterGain.gain.setTargetAtTime(settings.volume, now(), 0.02);
    }
    saveSettings();
  }

  function setAmbientEnabled(value) {
    settings.ambientEnabled = Boolean(value);
    if (!settings.ambientEnabled) {
      stopAmbientLoop();
    }
    saveSettings();
  }

  function getSettings() {
    return {
      muted: settings.muted,
      volume: settings.volume,
      ambientEnabled: settings.ambientEnabled
    };
  }

  window.TreasureGame.Audio = {
    init: ensureContext,
    playClickSound: playClickSound,
    playClueSound: playClueSound,
    playTreasureSound: playTreasureSound,
    playPanelSound: playPanelSound,
    startAmbientLoop: startAmbientLoop,
    stopAmbientLoop: stopAmbientLoop,
    setMuted: setMuted,
    setVolume: setVolume,
    setAmbientEnabled: setAmbientEnabled,
    getSettings: getSettings
  };
})();
