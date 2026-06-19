(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  function isSolidForRay(state, x, y) {
    if (!window.TreasureGame.MapData.isInside(x, y)) {
      return true;
    }
    var token = state.grid[y][x];
    return window.TreasureGame.MapData.isBlockingToken(token);
  }

  function castSingleRay(state, player, angle) {
    var config = window.TreasureGame.Config;
    var rayDirX = Math.cos(angle);
    var rayDirY = Math.sin(angle);
    var mapX = Math.floor(player.x);
    var mapY = Math.floor(player.y);
    var deltaDistX = Math.abs(1 / (rayDirX || 0.00001));
    var deltaDistY = Math.abs(1 / (rayDirY || 0.00001));
    var stepX;
    var stepY;
    var sideDistX;
    var sideDistY;
    var side = 0;
    var distance = config.maxDepth;
    var hitToken = "1";

    if (rayDirX < 0) {
      stepX = -1;
      sideDistX = (player.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1 - player.x) * deltaDistX;
    }

    if (rayDirY < 0) {
      stepY = -1;
      sideDistY = (player.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1 - player.y) * deltaDistY;
    }

    while (distance < config.maxDepth + 1) {
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
      }

      if (isSolidForRay(state, mapX, mapY)) {
        if (side === 0) {
          distance = (mapX - player.x + (1 - stepX) / 2) / (rayDirX || 0.00001);
        } else {
          distance = (mapY - player.y + (1 - stepY) / 2) / (rayDirY || 0.00001);
        }
        hitToken = window.TreasureGame.MapData.isInside(mapX, mapY) ? state.grid[mapY][mapX] : "1";
        break;
      }

      if (Math.max(Math.abs(mapX - player.x), Math.abs(mapY - player.y)) > config.maxDepth) {
        break;
      }
    }

    var hitX = player.x + rayDirX * distance;
    var hitY = player.y + rayDirY * distance;
    var textureOffset = side === 0 ? hitY - Math.floor(hitY) : hitX - Math.floor(hitX);

    return {
      angle: angle,
      distance: Math.max(distance, 0.0001),
      correctedDistance: Math.max(distance * Math.cos(angle - player.angle), 0.0001),
      side: side,
      token: hitToken,
      mapX: mapX,
      mapY: mapY,
      textureOffset: textureOffset
    };
  }

  function castRays(state, player) {
    var config = window.TreasureGame.Config;
    var rays = [];
    var startAngle = player.angle - config.fov / 2;

    for (var i = 0; i < config.rayCount; i += 1) {
      var ratio = i / (config.rayCount - 1);
      var angle = startAngle + ratio * config.fov;
      rays.push(castSingleRay(state, player, angle));
    }

    return rays;
  }

  window.TreasureGame.Raycaster = {
    castRays: castRays
  };
})();
