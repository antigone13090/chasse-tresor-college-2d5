(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  var STORAGE_KEY = "treasureGameAudioSettings";
  var context = null;
  var masterGain = null;
  var ambientGain = null;
  var ambientFilter = null;
  var ambientTimer = null;
  var ambientPlaying = false;
  var ambientStep = 0;
  var activeAmbientOscillators = [];
  var initialized = false;
  var settings = loadSettings();

  var AMBIENT_CHORDS = [
    [196, 246.94, 329.63],
    [174.61, 220, 293.66],
    [164.81, 246.94, 311.13],
    [185, 233.08, 293.66]
  ];
  var AMBIENT_NOTES = [392, 329.63, 440, 369.99, 493.88, 415.3];

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function loadSettings() {
    var defaults = {
      muted: false,
      volume: 0.45,
      ambientEnabled: true,
      effectsEnabled: true
    };

    try {
      var stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored) {
        return defaults;
      }
      return {
        muted: Boolean(stored.muted),
        volume: typeof stored.volume === "number" ? clamp(stored.volume, 0, 1) : defaults.volume,
        ambientEnabled: stored.ambientEnabled !== false,
        effectsEnabled: stored.effectsEnabled !== false
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

  function initAudio() {
    if (initialized) {
      return Boolean(context);
    }

    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return false;
    }

    context = new AudioContext();
    masterGain = context.createGain();
    ambientGain = context.createGain();
    ambientFilter = context.createBiquadFilter();

    masterGain.gain.value = settings.muted ? 0 : settings.volume;
    ambientGain.gain.value = 0.12;
    ambientFilter.type = "lowpass";
    ambientFilter.frequency.value = 1450;
    ambientFilter.Q.value = 0.45;

    ambientGain.connect(ambientFilter);
    ambientFilter.connect(masterGain);
    masterGain.connect(context.destination);
    initialized = true;
    return true;
  }

  function resumeAudio() {
    if (!initAudio()) {
      return false;
    }
    if (context.state === "suspended") {
      context.resume();
    }
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

  function tone(frequency, start, duration, type, peak, destination, options) {
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    var detune = options && options.detune ? options.detune : 0;
    var ambientTone = destination === ambientGain;

    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.detune.setValueAtTime(detune, start);
    setEnvelope(
      gain,
      start,
      options && options.attack !== undefined ? options.attack : 0.012,
      options && options.decay !== undefined ? options.decay : Math.max(0.03, duration - 0.012),
      peak,
      options && options.sustain !== undefined ? options.sustain : 0.0001
    );
    oscillator.connect(gain);
    gain.connect(destination || masterGain);
    if (ambientTone) {
      activeAmbientOscillators.push(oscillator);
      oscillator.onended = function () {
        var index = activeAmbientOscillators.indexOf(oscillator);
        if (index !== -1) {
          activeAmbientOscillators.splice(index, 1);
        }
      };
    }
    oscillator.start(start);
    oscillator.stop(start + duration + 0.08);
  }

  function playSequence(notes) {
    if (!resumeAudio() || settings.muted || !settings.effectsEnabled) {
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
        note.destination,
        note.options
      );
    });
  }

  function playClickSound() {
    playSequence([
      { frequency: 520, duration: 0.045, type: "square", peak: 0.055 },
      { frequency: 760, delay: 0.035, duration: 0.055, type: "triangle", peak: 0.04 }
    ]);
  }

  function playPanelSound() {
    playSequence([
      { frequency: 330, duration: 0.08, type: "triangle", peak: 0.055 },
      { frequency: 440, delay: 0.06, duration: 0.1, type: "sine", peak: 0.045 }
    ]);
  }

  function playClueSound() {
    playSequence([
      { frequency: 523.25, duration: 0.12, type: "sine", peak: 0.075 },
      { frequency: 659.25, delay: 0.1, duration: 0.14, type: "sine", peak: 0.07 },
      { frequency: 783.99, delay: 0.22, duration: 0.18, type: "triangle", peak: 0.06 }
    ]);
  }

  function duckAmbient(duration) {
    if (!ambientGain || !ambientPlaying) {
      return;
    }
    var start = now();
    ambientGain.gain.cancelScheduledValues(start);
    ambientGain.gain.setTargetAtTime(0.035, start, 0.08);
    ambientGain.gain.setTargetAtTime(0.12, start + duration, 0.9);
  }

  function playTreasureSound() {
    duckAmbient(2.2);
    playSequence([
      { frequency: 392, duration: 0.13, type: "triangle", peak: 0.08 },
      { frequency: 523.25, delay: 0.1, duration: 0.16, type: "sine", peak: 0.085 },
      { frequency: 659.25, delay: 0.22, duration: 0.2, type: "sine", peak: 0.08 },
      { frequency: 1046.5, delay: 0.4, duration: 0.28, type: "triangle", peak: 0.055 },
      { frequency: 783.99, delay: 0.68, duration: 0.42, type: "sine", peak: 0.045 }
    ]);
  }

  function scheduleAmbientPhrase() {
    if (!context || settings.muted || !settings.ambientEnabled || !ambientPlaying) {
      return;
    }

    var start = now() + 0.04;
    var chord = AMBIENT_CHORDS[ambientStep % AMBIENT_CHORDS.length];
    var accent = AMBIENT_NOTES[(ambientStep * 2 + 1) % AMBIENT_NOTES.length];
    var shimmer = AMBIENT_NOTES[(ambientStep * 3 + 4) % AMBIENT_NOTES.length];

    chord.forEach(function (frequency, index) {
      tone(frequency, start + index * 0.09, 6.2, "sine", 0.017 - index * 0.002, ambientGain, {
        attack: 1.1,
        decay: 4.8,
        detune: (index - 1) * 3
      });
      tone(frequency * 2, start + 0.35 + index * 0.08, 4.3, "triangle", 0.005, ambientGain, {
        attack: 1.6,
        decay: 3.2,
        detune: 2 - index * 2
      });
    });

    tone(accent, start + 2.15, 1.45, "sine", 0.012, ambientGain, {
      attack: 0.18,
      decay: 1.1
    });
    tone(shimmer, start + 5.15, 1.2, "triangle", 0.009, ambientGain, {
      attack: 0.22,
      decay: 0.9
    });

    ambientStep += 1;
  }

  function startAmbientMusic() {
    if (!resumeAudio() || settings.muted || !settings.ambientEnabled || ambientPlaying) {
      return;
    }

    ambientPlaying = true;
    ambientGain.gain.cancelScheduledValues(now());
    ambientGain.gain.setTargetAtTime(0.12, now(), 0.35);
    scheduleAmbientPhrase();
    ambientTimer = window.setInterval(scheduleAmbientPhrase, 7200);
  }

  function stopAmbientMusic() {
    ambientPlaying = false;
    if (ambientTimer) {
      window.clearInterval(ambientTimer);
      ambientTimer = null;
    }
    activeAmbientOscillators.forEach(function (oscillator) {
      try {
        oscillator.stop();
      } catch (error) {
        // The oscillator may already have ended; stopping is best effort.
      }
    });
    activeAmbientOscillators = [];
    if (ambientGain && context) {
      ambientGain.gain.cancelScheduledValues(now());
      ambientGain.gain.setTargetAtTime(0.0001, now(), 0.08);
    }
  }

  function setMuted(value) {
    settings.muted = Boolean(value);
    if (initAudio()) {
      masterGain.gain.setTargetAtTime(settings.muted ? 0 : settings.volume, now(), 0.02);
    }
    if (settings.muted) {
      stopAmbientMusic();
    }
    saveSettings();
  }

  function setVolume(value) {
    settings.volume = clamp(value, 0, 1);
    if (initAudio() && !settings.muted) {
      masterGain.gain.setTargetAtTime(settings.volume, now(), 0.02);
    }
    saveSettings();
  }

  function setAmbientEnabled(value) {
    settings.ambientEnabled = Boolean(value);
    if (!settings.ambientEnabled || settings.muted) {
      stopAmbientMusic();
    }
    saveSettings();
  }

  function setEffectsEnabled(value) {
    settings.effectsEnabled = Boolean(value);
    saveSettings();
  }

  function getAudioSettings() {
    return {
      muted: settings.muted,
      volume: settings.volume,
      ambientEnabled: settings.ambientEnabled,
      effectsEnabled: settings.effectsEnabled,
      ambientPlaying: ambientPlaying
    };
  }

  window.TreasureGame.Audio = {
    initAudio: initAudio,
    resumeAudio: resumeAudio,
    playClickSound: playClickSound,
    playPanelSound: playPanelSound,
    playClueSound: playClueSound,
    playTreasureSound: playTreasureSound,
    startAmbientMusic: startAmbientMusic,
    stopAmbientMusic: stopAmbientMusic,
    setAmbientEnabled: setAmbientEnabled,
    setMuted: setMuted,
    setVolume: setVolume,
    setEffectsEnabled: setEffectsEnabled,
    getAudioSettings: getAudioSettings,

    init: initAudio,
    startAmbientLoop: startAmbientMusic,
    stopAmbientLoop: stopAmbientMusic,
    getSettings: getAudioSettings
  };
})();
