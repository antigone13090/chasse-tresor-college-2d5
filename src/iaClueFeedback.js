(function () {
  "use strict";

  var interactions = window.TreasureGame.Interactions;
  var rendererApi = window.TreasureGame.Renderer;
  var originalPerform = interactions.perform;
  var originalRender = rendererApi.render;

  interactions.perform = function (state, player) {
    var before = state.foundClues;
    originalPerform(state, player);

    if (state.foundClues > before) {
      state.iaClueFeedbackUntil = performance.now() + 750;
    }
  };

  rendererApi.render = function (renderer, state, player) {
    originalRender(renderer, state, player);

    var remaining = (state.iaClueFeedbackUntil || 0) - performance.now();
    if (remaining <= 0) {
      return;
    }

    var ctx = renderer.ctx;
    var progress = 1 - remaining / 750;
    var alpha = Math.max(0, 1 - progress);
    var cx = renderer.canvas.width / 2;
    var cy = renderer.canvas.height / 2;

    ctx.save();
    ctx.strokeStyle = "rgba(74, 192, 173, " + alpha + ")";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, 35 + progress * 90, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "rgba(244, 241, 223, " + alpha + ")";
    ctx.font = "bold 24px ui-monospace, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText("+1 INDICE", cx, cy - 70);
    ctx.restore();
  };
})();
