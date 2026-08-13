(function () {
  "use strict";

  var rendererApi = window.TreasureGame.Renderer;
  var originalRender = rendererApi.render;

  function drawClueGlow(renderer, state, player) {
    if (state.mode !== "playing") {
      return;
    }

    var ctx = renderer.ctx;
    var config = window.TreasureGame.Config;
    var width = renderer.canvas.width;
    var height = renderer.canvas.height;
    var pulse = 0.5 + 0.5 * Math.sin(performance.now() / 180);

    ctx.save();

    for (var y = 0; y < state.grid.length; y += 1) {
      for (var x = 0; x < state.grid[y].length; x += 1) {
        var token = state.grid[y][x];
        if (!window.TreasureGame.MapData.isClueToken(token)) {
          continue;
        }

        var dx = x + 0.5 - player.x;
        var dy = y + 0.5 - player.y;
        var distance = Math.hypot(dx, dy);
        var angle = Math.atan2(dy, dx) - player.angle;

        while (angle < -Math.PI) angle += Math.PI * 2;
        while (angle > Math.PI) angle -= Math.PI * 2;

        if (Math.abs(angle) > config.fov / 1.25 || distance < 0.2) {
          continue;
        }

        var screenX = (0.5 + angle / config.fov) * width;
        var spriteSize = Math.min(height, height / distance * 0.55);
        var centerY = height / 2;
        var radius = Math.max(12, spriteSize * (0.55 + pulse * 0.08));

        ctx.strokeStyle = "rgba(74, 192, 173, " + (0.45 + pulse * 0.35) + ")";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  rendererApi.render = function (renderer, state, player) {
    originalRender(renderer, state, player);
    drawClueGlow(renderer, state, player);
  };
})();
