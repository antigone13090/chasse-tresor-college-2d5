(function () {
  "use strict";

  var canvas = document.getElementById("game-canvas");
  var renderer = window.TreasureGame.Renderer.create(canvas);
  var input = window.TreasureGame.Input.create(canvas);
  var state = window.TreasureGame.GameState.create();
  var player = window.TreasureGame.Player.create();
  var lastTime = performance.now();

  function resetGame() {
    state = window.TreasureGame.GameState.create();
    player = window.TreasureGame.Player.create();
  }

  function requestGamePointerLock() {
    if (canvas.requestPointerLock && document.pointerLockElement !== canvas) {
      try {
        canvas.requestPointerLock();
      } catch (error) {
        // Le clavier reste utilisable si le navigateur refuse le pointer lock.
      }
    }
  }

  function start() {
    resetGame();
    state.mode = "playing";
    window.TreasureGame.UI.setScreen("");
    window.TreasureGame.Audio.unlock();
    window.TreasureGame.Audio.startGame();\n    window.TreasureGame.Audio.startMusic();
    window.TreasureGame.GameState.setMessage(state, "Explore l'entrée centrale et trouve la Vie scolaire.", 3);
    requestGamePointerLock();
  }

  function resume() {
    state.mode = "playing";
    window.TreasureGame.UI.setScreen("");
    requestGamePointerLock();
  }

  function pause() {
    state.mode = "paused";
    window.TreasureGame.UI.setScreen("pause-screen");
    if (document.pointerLockElement === canvas && document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  function backToMenu() {
    state.mode = "menu";
    window.TreasureGame.UI.setScreen("main-menu");
    if (document.pointerLockElement === canvas && document.exitPointerLock) {
      document.exitPointerLock();
    }
  }

  function handleShortcuts() {
    if (input.consume("Escape")) {
      if (state.mode === "playing") {
        pause();
      } else if (state.mode === "paused") {
        resume();
      }
    }

    if (input.consume("KeyM")) {
      state.showMinimap = !state.showMinimap;
    }

    if (input.consume("F1")) {
      state.showDebug = !state.showDebug;
    }

    if (state.mode === "playing" && input.consume("KeyE")) {
      window.TreasureGame.Interactions.perform(state, player);
    }
  }

  function frame(now) {
    var deltaTime = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    state.fps = deltaTime > 0 ? 1 / deltaTime : 0;

    handleShortcuts();

    if (state.mode === "playing") {
      window.TreasureGame.Player.update(state, player, input, deltaTime);
      state.currentInteraction = window.TreasureGame.Interactions.find(state, player);
      window.TreasureGame.GameState.updateTimers(state, deltaTime);
    }

    window.TreasureGame.Renderer.render(renderer, state, player);
    window.TreasureGame.UI.updateHud(state, player);
    input.endFrame();
    requestAnimationFrame(frame);
  }

  window.TreasureGame.UI.bindMenus({
    start: start,
    resume: resume,
    backToMenu: backToMenu
  });

  requestAnimationFrame(frame);
})();