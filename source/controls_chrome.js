/**
 * Main script for Yandex Music player control.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/killbillsbor/ya-music-controls
 * (c) 2016-2017
 * Yandex Music Player Control Plugin
 * v.1.2
 */

(function() {
  "use strict";
  /* Set variables: */
  let evt;

  /* Send message to Background Script to get the Yandex Music Tab ID: */
  chrome.runtime.sendMessage({ greeting: "hello" });

  /* Send request to Yandex Music API: */
  const requestAPI = request => {
    console.log(request);
    // Create custom event:
    const event = new CustomEvent("actionRequest", {
      detail: { action: request, extensionID: chrome.runtime.id }
    });

    // Trigger the event:
    document.dispatchEvent(event);
  };

  const initializeMusicControls = () => {
    // Inject script:
    const injectCode = `
        var sendPlayerState = (e) => {
            var currentState = Object.assign( {}, { isPlaying: externalAPI.isPlaying(), hostname: window.location.hostname }, externalAPI.getCurrentTrack() );
            chrome.runtime.sendMessage(e.detail.extensionID, currentState);
        }
        document.addEventListener('actionRequest', e => {
            switch (e.detail.action) {
                case "next":
                    externalAPI.next();
                    break;
                case "prev":
                    externalAPI.prev();
                    break;
                case "play":
                    externalAPI.togglePause();
                    break;
                case "liked":
                    externalAPI.toggleLike();
                    sendPlayerState(e);
                    break;
                case "disliked":
                    externalAPI.toggleDislike();
                    sendPlayerState(e);
                    break;
                case "GET_PLAYER_STATE":
                    sendPlayerState(e);
                    break;
                default:
                    break;
            }
        });`;
    const script = document.createElement("script");
    script.textContent = injectCode;
    (document.head || document.documentElement).appendChild(script);
    script.remove();

    // MutationObserver:
    window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    // Find the body element
    const target = document.querySelector("body");
    // Create an observer instance
    const observer = new MutationObserver(mutation => {
      /* If changes caused by track then: */
      if (mutation[0].attributeName === "data-unity-state") {
        requestAPI("GET_PLAYER_STATE");
      }
    });
    // Configuration of the observer:
    const config = {
      attributes: true
    };
    observer.observe(target, config);
  };

  /* After Yandex Music page is loaded create Observer for track change: */
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
