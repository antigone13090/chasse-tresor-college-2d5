(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  var context = null;
  var enabled = true;

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
      context.resume();
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
    gain.gain.exponentialRampToValueAtTime(volume || 0.05, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.03);
  }

  function unlock() {
    ensureContext();
  }

  function button() {
    tone(520, 0.07, "square", 0.025);
  }

  function startGame() {
    tone(392, 0.12, "sine", 0.04, 0);
    tone(523, 0.12, "sine", 0.04, 0.10);
    tone(659, 0.18, "sine", 0.045, 0.20);
  }

  function clue() {
    tone(660, 0.10, "triangle", 0.045, 0);
    tone(880, 0.18, "triangle", 0.05, 0.09);
  }

  function door() {
    tone(180, 0.16, "sawtooth", 0.025, 0);
    tone(120, 0.20, "sawtooth", 0.02, 0.10);
  }

  function denied() {
    tone(180, 0.11, "square", 0.03, 0);
    tone(145, 0.14, "square", 0.025, 0.12);
  }

  function treasure() {
    [523, 659, 784, 1047].forEach(function (frequency, index) {
      tone(frequency, 0.22, "triangle", 0.055, index * 0.11);
    });
  }

  function setEnabled(value) {
    enabled = Boolean(value);
    if (enabled) {
      unlock();
      button();
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
    toggle: toggle,
    setEnabled: setEnabled,
    isEnabled: isEnabled
  };
})();