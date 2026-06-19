(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  function loadTexture(path) {
    var image = new Image();
    image.src = path;
    return image;
  }

  function createRenderer(canvas) {
    var ctx = canvas.getContext("2d");
    var config = window.TreasureGame.Config;
    canvas.width = config.canvasWidth;
    canvas.height = config.canvasHeight;

    return {
      ctx: ctx,
      canvas: canvas,
      textures: {
        wall: loadTexture("assets/textures/wall.png"),
        door: loadTexture("assets/textures/door.png"),
        floor: loadTexture("assets/textures/floor.png"),
        ceiling: loadTexture("assets/textures/ceiling.png"),
        clue: loadTexture("assets/textures/clue.png"),
        treasure: loadTexture("assets/textures/treasure.png")
      }
    };
  }

  function drawBackground(renderer) {
    var ctx = renderer.ctx;
    var width = renderer.canvas.width;
    var height = renderer.canvas.height;
    var ceiling = ctx.createLinearGradient(0, 0, 0, height / 2);
    var floor = ctx.createLinearGradient(0, height / 2, 0, height);

    ceiling.addColorStop(0, "#2d3943");
    ceiling.addColorStop(1, "#72818b");
    floor.addColorStop(0, "#d8d0ba");
    floor.addColorStop(1, "#8c907b");

    ctx.fillStyle = ceiling;
    ctx.fillRect(0, 0, width, height / 2);
    ctx.fillStyle = floor;
    ctx.fillRect(0, height / 2, width, height / 2);
  }

  function drawWallColumn(renderer, ray, index) {
    var ctx = renderer.ctx;
    var config = window.TreasureGame.Config;
    var width = renderer.canvas.width;
    var height = renderer.canvas.height;
    var columnWidth = width / config.rayCount + 1;
    var wallHeight = Math.min(height * 2, height / ray.correctedDistance);
    var x = index * width / config.rayCount;
    var y = (height - wallHeight) / 2;
    var shade = Math.max(0.25, 1 - ray.correctedDistance / config.maxDepth);
    var texture = ray.token === "D" || ray.token === "F" ? renderer.textures.door : renderer.textures.wall;
    var wallColor = window.TreasureGame.MapData.tileColor(ray.token);

    if (texture.complete && texture.naturalWidth > 0) {
      var sourceX = Math.floor(ray.textureOffset * texture.naturalWidth);
      ctx.globalAlpha = 1;
      ctx.drawImage(texture, sourceX, 0, 1, texture.naturalHeight, x, y, columnWidth, wallHeight);
      // Floor-level colors from the plan tint the reused retro wall texture.
      ctx.fillStyle = wallColor;
      ctx.globalAlpha = ray.token === "D" || ray.token === "F" ? 0.12 : 0.28;
      ctx.fillRect(x, y, columnWidth, wallHeight);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0, 0, 0, " + (1 - shade) * (ray.side ? 0.65 : 0.5) + ")";
      ctx.fillRect(x, y, columnWidth, wallHeight);
    } else {
      ctx.fillStyle = wallColor;
      ctx.globalAlpha = shade;
      ctx.fillRect(x, y, columnWidth, wallHeight);
      ctx.globalAlpha = 1;
    }
  }

  function collectSprites(state) {
    var sprites = [];
    for (var y = 0; y < state.grid.length; y += 1) {
      for (var x = 0; x < state.grid[y].length; x += 1) {
        var token = state.grid[y][x];
        if (window.TreasureGame.MapData.isClueToken(token) || token === "T") {
          sprites.push({ token: token, x: x + 0.5, y: y + 0.5 });
        }
      }
    }
    return sprites;
  }

  function drawSprites(renderer, state, player) {
    var ctx = renderer.ctx;
    var config = window.TreasureGame.Config;
    var width = renderer.canvas.width;
    var height = renderer.canvas.height;
    var sprites = collectSprites(state);

    sprites.sort(function (a, b) {
      var da = Math.hypot(a.x - player.x, a.y - player.y);
      var db = Math.hypot(b.x - player.x, b.y - player.y);
      return db - da;
    });

    sprites.forEach(function (sprite) {
      var dx = sprite.x - player.x;
      var dy = sprite.y - player.y;
      var distance = Math.hypot(dx, dy);
      var angleToSprite = Math.atan2(dy, dx) - player.angle;

      while (angleToSprite < -Math.PI) {
        angleToSprite += Math.PI * 2;
      }
      while (angleToSprite > Math.PI) {
        angleToSprite -= Math.PI * 2;
      }

      if (Math.abs(angleToSprite) > config.fov / 1.25 || distance < 0.2) {
        return;
      }

      var screenX = (0.5 + angleToSprite / config.fov) * width;
      var spriteSize = Math.min(height, height / distance * 0.55);
      var x = screenX - spriteSize / 2;
      var y = height / 2 - spriteSize / 2;
      var image = sprite.token === "T" ? renderer.textures.treasure : renderer.textures.clue;

      if (image.complete && image.naturalWidth > 0) {
        ctx.drawImage(image, x, y, spriteSize, spriteSize);
      } else {
        ctx.fillStyle = sprite.token === "T" ? "#f1c94d" : "#4ac0ad";
        ctx.fillRect(x, y, spriteSize, spriteSize);
      }
    });
  }

  function drawMinimap(renderer, state, player) {
    if (!state.showMinimap) {
      return;
    }

    var ctx = renderer.ctx;
    var scale = window.TreasureGame.Config.minimapScale;
    var mapData = window.TreasureGame.MapData;
    var mapWidth = state.grid[0].length * scale;
    var originX = renderer.canvas.width - mapWidth - 12;
    var originY = 12;

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "#0b1016";
    ctx.fillRect(originX - 4, originY - 4, mapWidth + 8, state.grid.length * scale + 8);

    for (var y = 0; y < state.grid.length; y += 1) {
      for (var x = 0; x < state.grid[y].length; x += 1) {
        var token = state.grid[y][x];
        ctx.fillStyle = mapData.tileColor(token);
        ctx.fillRect(originX + x * scale, originY + y * scale, scale - 1, scale - 1);
      }
    }

    // Labels are drawn after tiles so the plan remains recognizable at a glance.
    ctx.globalAlpha = 1;
    ctx.font = "7px ui-monospace, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    mapData.buildings.forEach(function (building) {
      // Tiny utility labels add clutter; their color blocks remain visible.
      if (building.width < 3 || building.height < 2 || building.floor === "STAIRS" || building.id === "cour" || building.id === "passage-bleu") {
        return;
      }
      ctx.fillStyle = building.floor === "R+2" ? "#24160d" : "#14202a";
      ctx.fillText(
        building.label,
        originX + (building.x + building.width / 2) * scale,
        originY + (building.y + building.height / 2) * scale,
        Math.max(18, building.width * scale - 2)
      );
    });

    ctx.font = "8px ui-monospace, Consolas, monospace";
    mapData.landmarks.forEach(function (landmark) {
      ctx.fillStyle = "#f4f1df";
      ctx.fillText(landmark.label, originX + landmark.x * scale, originY + landmark.y * scale, 64);
    });

    ctx.fillStyle = "#f4f1df";
    ctx.beginPath();
    ctx.arc(originX + player.x * scale, originY + player.y * scale, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f4f1df";
    ctx.beginPath();
    ctx.moveTo(originX + player.x * scale, originY + player.y * scale);
    ctx.lineTo(originX + (player.x + Math.cos(player.angle) * 1.5) * scale, originY + (player.y + Math.sin(player.angle) * 1.5) * scale);
    ctx.stroke();

    drawLegend(ctx, renderer.canvas.width, originY + state.grid.length * scale + 12, mapData.legend);
    ctx.restore();
  }

  function drawLegend(ctx, canvasWidth, y, legend) {
    var itemWidth = 72;
    var width = itemWidth * legend.length;
    var x = canvasWidth - width - 12;

    ctx.fillStyle = "rgba(11, 16, 22, 0.88)";
    ctx.fillRect(x - 4, y - 4, width + 8, 18);
    ctx.font = "8px ui-monospace, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    legend.forEach(function (item, index) {
      var itemX = x + index * itemWidth;
      ctx.fillStyle = item.color;
      ctx.fillRect(itemX, y, 9, 9);
      ctx.fillStyle = "#f4f1df";
      ctx.fillText(item.label, itemX + 12, y + 5);
    });
  }

  function render(renderer, state, player) {
    var rays = window.TreasureGame.Raycaster.castRays(state, player);
    drawBackground(renderer);

    for (var i = 0; i < rays.length; i += 1) {
      drawWallColumn(renderer, rays[i], i);
    }

    drawSprites(renderer, state, player);
    drawMinimap(renderer, state, player);
  }

  window.TreasureGame.Renderer = {
    create: createRenderer,
    render: render
  };
})();
