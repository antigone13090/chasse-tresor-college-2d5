(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  function createPlayer() {
    var start = window.TreasureGame.MapData.start;
    return {
      x: start.x,
      y: start.y,
      angle: start.angle,
      radius: 0.2
    };
  }

  function normalizeAngle(angle) {
    var twoPi = Math.PI * 2;
    while (angle < 0) {
      angle += twoPi;
    }
    while (angle >= twoPi) {
      angle -= twoPi;
    }
    return angle;
  }

  function isBlockingCell(state, x, y) {
    var mapData = window.TreasureGame.MapData;
    var cellX = Math.floor(x);
    var cellY = Math.floor(y);

    if (!mapData.isInside(cellX, cellY)) {
      return true;
    }

    var token = state.grid[cellY][cellX];
    return mapData.isBlockingToken(token);
  }

  function tryMove(state, player, nextX, nextY) {
    // Movement is resolved axis by axis so the player can slide along walls.
    if (!isBlockingCell(state, nextX, player.y)) {
      player.x = nextX;
    }
    if (!isBlockingCell(state, player.x, nextY)) {
      player.y = nextY;
    }
  }

  function updatePlayer(state, player, input, deltaTime) {
    var config = window.TreasureGame.Config;
    var moveStep = config.moveSpeed * deltaTime;
    var turnStep = config.rotationSpeed * deltaTime;
    var forward = 0;
    var strafe = 0;

    if (input.isDown("KeyW") || input.isDown("KeyZ") || input.isDown("ArrowUp")) {
      forward += 1;
    }
    if (input.isDown("KeyS") || input.isDown("ArrowDown")) {
      forward -= 1;
    }
    if (input.isDown("KeyA") || input.isDown("KeyQ")) {
      strafe -= 1;
    }
    if (input.isDown("KeyD")) {
      strafe += 1;
    }
    if (input.isDown("ArrowLeft")) {
      player.angle -= turnStep;
    }
    if (input.isDown("ArrowRight")) {
      player.angle += turnStep;
    }

    if (input.mouseDeltaX !== 0) {
      player.angle += input.mouseDeltaX * config.mouseSensitivity;
      input.mouseDeltaX = 0;
    }

    player.angle = normalizeAngle(player.angle);

    var cos = Math.cos(player.angle);
    var sin = Math.sin(player.angle);
    var nextX = player.x + (cos * forward + Math.cos(player.angle + Math.PI / 2) * strafe) * moveStep;
    var nextY = player.y + (sin * forward + Math.sin(player.angle + Math.PI / 2) * strafe) * moveStep;

    tryMove(state, player, nextX, nextY);
  }

  window.TreasureGame.Player = {
    create: createPlayer,
    update: updatePlayer,
    normalizeAngle: normalizeAngle,
    isBlockingCell: isBlockingCell
  };
})();
