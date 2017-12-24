/**
 * Main script for Yandex Music player control.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/killbillsbor/ya-music-controls
 * (c) 2016-2018
 * Yandex Music Player Control Plugin
 * v.1.3
 */

var currentState

(function() {
  "use strict";
  /* Send message to Background Script to get or remove the Yandex Music Tab ID: */
  chrome.runtime.sendMessage({ greeting: "hello" });

  window.onbeforeunload = () => {
    chrome.runtime.sendMessage({ greeting: "bye" });
  };

  /* Send request to Yandex Music API: */
  const sendPlayerState = () => {
    // Prepare object with state:
    currentState = Object.assign(
      {},
      { isPlaying: window.wrappedJSObject.externalAPI.isPlaying(),
        hostname: window.location.hostname,
        volume: window.wrappedJSObject.externalAPI.getVolume() || 0 },
      window.wrappedJSObject.externalAPI.getCurrentTrack()
    );
    // Send a state:
    chrome.runtime.sendMessage({ currentState });
  };

  /* Listen to commands from buttons: */
  chrome.runtime.onMessage.addListener(request => {
    console.log("ACTION: ", request.action)
    if (request) {
      switch (request.action) {
        case "next":
          window.wrappedJSObject.externalAPI.next();
          break;
        case "prev":
          window.wrappedJSObject.externalAPI.prev();
          break;
        case "play":
          window.wrappedJSObject.externalAPI.togglePause();
          break;
        case "liked":
          window.wrappedJSObject.externalAPI.toggleLike();
          sendPlayerState(); // toggleLike can't be detected by observer
          break;
        case "disliked":
          window.wrappedJSObject.externalAPI.toggleDislike();
          sendPlayerState(); // toggleDislike can't be detected by observer sometimes
          break;
        case "volumeUp":
          console.log(currentState)
          window.wrappedJSObject.externalAPI.setVolume(currentState.volume + 0.1 > 1 ? 1 : currentState.volume + 0.1);
          sendPlayerState();
          break;
        case "volumeDown":
          window.wrappedJSObject.externalAPI.setVolume(currentState.volume - 0.1 < 0 ? 0 : currentState.volume - 0.1);
          sendPlayerState();
          break;
        case "GET_PLAYER_STATE":
          sendPlayerState();
          break;
        default:
          break;
      }
    }
  });

  const initializeMusicControls = () => {
    // MutationObserver:
    window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    // Find the body element
    const target = document.querySelector("body");
    // Create an observer instance
    const observer = new MutationObserver(mutation => {
      /* If changes caused by track then: */
      if (mutation[0].attributeName === "data-unity-state") {
        sendPlayerState();
      }
    });
    // Configuration of the observer:
    const config = {
      attributes: true
    };
    observer.observe(target, config);
  };

  /* After Yandex Music page is loaded create Observer to detect track changes: */
  if (window.attachEvent) {
    window.attachEvent("onload", initializeMusicControls);
  } else {
    if (window.onload) {
      const curronload = window.onload;
      const newonload = function(evt) {
        curronload(evt);
        initializeMusicControls(evt);
      };
      window.onload = newonload;
    } else {
      window.onload = initializeMusicControls();
    }
  }
})();
