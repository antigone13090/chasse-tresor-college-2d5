(function () {
  "use strict";

  window.TreasureGame = window.TreasureGame || {};

  function createGameState() {
    var mapData = window.TreasureGame.MapData;
    var state = {
      mode: "menu",
      grid: mapData.cloneGrid(mapData.baseGrid),
      foundClues: 0,
      collected: {},
      treasureFound: false,
      objective: "Trouve l'indice 1 à la Vie scolaire.",
      temporaryMessage: "",
      messageTime: 0,
      showMinimap: true,
      showDebug: false,
      fps: 0
    };

    return state;
  }

  function setMessage(state, text, seconds) {
    state.temporaryMessage = text;
    state.messageTime = seconds || 3;
  }

  function updateTimers(state, deltaTime) {
    if (state.messageTime > 0) {
      state.messageTime = Math.max(0, state.messageTime - deltaTime);
      if (state.messageTime === 0) {
        state.temporaryMessage = "";
      }
    }
  }

  window.TreasureGame.GameState = {
    create: createGameState,
    setMessage: setMessage,
    updateTimers: updateTimers
  };
})();
