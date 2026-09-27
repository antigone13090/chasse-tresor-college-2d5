(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  var context = null;
  var enabled = true;
  var musicWanted = false;
  var musicTimer = null;
  var musicStep = 0;

  function ensureContext() {
    if (!enabled) {
      return null;
    }

    if (!context) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        return null;
      }
      context = new AudioContextClass();
    }

    if (context.state === "suspended") {
      context.resume().catch(function () {
        // Le prochain clic utilisateur relancera le contexte audio.
      });
    }

    return context;
  }

  function tone(frequency, duration, type, volume, delay) {
    var ctx = ensureContext();
    if (!ctx) {
      return;
    }

    var oscillator = ctx.createOscillator();
    var gain = ctx.createGain();
    var startAt = ctx.currentTime + (delay || 0);

    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume || 0.06, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.03);
  }

  function unlock() {
    return ensureContext();
  }

  function button() {
    tone(540, 0.08, "square", 0.05);
  }

  function startGame() {
    tone(392, 0.12, "sine", 0.08, 0);
    tone(523, 0.12, "sine", 0.08, 0.10);
    tone(659, 0.20, "sine", 0.09, 0.20);
  }

  function clue() {
    tone(660, 0.11, "triangle", 0.09, 0);
    tone(880, 0.20, "triangle", 0.10, 0.10);
  }

  function door() {
    tone(185, 0.18, "sawtooth", 0.055, 0);
    tone(125, 0.22, "sawtooth", 0.05, 0.11);
  }

  function denied() {
    tone(190, 0.12, "square", 0.065, 0);
    tone(145, 0.15, "square", 0.06, 0.13);
  }

  function treasure() {
    [523, 659, 784, 1047].forEach(function (frequency, index) {
      tone(frequency, 0.24, "triangle", 0.105, index * 0.12);
    });
  }

  function musicTick() {
    if (!enabled || !musicWanted) {
      return;
    }

    var melody = [220, 262, 294, 262, 330, 294, 262, 196];
    var frequency = melody[musicStep % melody.length];

    tone(frequency, 0.32, "triangle", 0.018, 0);
    tone(frequency * 1.5, 0.18, "sine", 0.008, 0.16);
    musicStep += 1;
  }

  function startMusic() {
    musicWanted = true;
    if (!enabled || musicTimer) {
      return;
    }

    unlock();
    musicTick();
    musicTimer = window.setInterval(musicTick, 1250);
  }

  function stopMusic() {
    musicWanted = false;
    if (musicTimer) {
      window.clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  function setEnabled(value) {
    enabled = Boolean(value);

    if (!enabled && musicTimer) {
      window.clearInterval(musicTimer);
      musicTimer = null;
    }

    if (enabled) {
      unlock();
      button();
      if (musicWanted && !musicTimer) {
        musicTick();
        musicTimer = window.setInterval(musicTick, 1250);
      }
    }

    return enabled;
  }

  function toggle() {
    return setEnabled(!enabled);
  }

  function isEnabled() {
    return enabled;
  }

  window.TreasureGame.Audio = {
    unlock: unlock,
    button: button,
    startGame: startGame,
    clue: clue,
    door: door,
    denied: denied,
    treasure: treasure,
    startMusic: startMusic,
    stopMusic: stopMusic,
    toggle: toggle,
    setEnabled: setEnabled,
    isEnabled: isEnabled
  };
})();