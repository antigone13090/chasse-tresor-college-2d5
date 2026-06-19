(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  function createInput(canvas) {
    var input = {
      keys: {},
      pressed: {},
      mouseDeltaX: 0,
      isDown: function (code) {
        return Boolean(this.keys[code]);
      },
      consume: function (code) {
        if (this.pressed[code]) {
          this.pressed[code] = false;
          return true;
        }
        return false;
      },
      endFrame: function () {
        this.pressed = {};
      }
    };

    window.addEventListener("keydown", function (event) {
      var code = event.code;
      if (!input.keys[code]) {
        input.pressed[code] = true;
      }
      input.keys[code] = true;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "F1"].indexOf(code) !== -1) {
        event.preventDefault();
      }
    });

    window.addEventListener("keyup", function (event) {
      input.keys[event.code] = false;
    });

    canvas.addEventListener("click", function () {
      if (document.pointerLockElement !== canvas && canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    });

    window.addEventListener("mousemove", function (event) {
      if (document.pointerLockElement === canvas) {
        input.mouseDeltaX += event.movementX;
      }
    });

    return input;
  }

  window.TreasureGame.Input = {
    create: createInput
  };
})();
