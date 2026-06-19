(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  window.TreasureGame.Config = {
    canvasWidth: 960,
    canvasHeight: 540,
    fov: Math.PI / 3,
    rayCount: 320,
    maxDepth: 28,
    moveSpeed: 3.2,
    rotationSpeed: 2.3,
    mouseSensitivity: 0.002,
    interactionDistance: 1.15,
    minimapScale: 5,
    textureSize: 64,
    clueTotal: 6
  };
})();
