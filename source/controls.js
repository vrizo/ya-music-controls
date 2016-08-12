/*
Main script for Yandex Music player control.

* Author Vitalii Rizo
* http://squirrel-research.ru
* https://github.com/killbillsbor/ya-music-controls
* (c) 2016
* Yandex Music Player Control Plugin
* v.1.0.1

*/

/* Set variables: */
var playerContainer, trackCover, trackCoverURL, trackName, playerState;

/* Send message to Background Script to get the Yandex Music Tab ID: */
chrome.runtime.sendMessage({greeting: "hello"});

/* Listen to commands from buttons: */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "next") {
            document.getElementsByClassName('player-controls__btn_next')[0].click();
        }
        if (request.action === "prev") {
            document.getElementsByClassName('player-controls__btn_prev')[0].click();
        }
        if (request.action === "play") {
            if (document.getElementsByClassName('player-controls__btn_pause')[0]) {
                document.getElementsByClassName('player-controls__btn_pause')[0].click();
            } else {
                document.getElementsByClassName('player-controls__btn_play')[0].click();
            }
        }
        if (request.action === "getPlayerState") {
            getPlayerState();
            sendResponse({ playerState: playerState });
        }
    }
);

/* Get player state: */
function getPlayerState() {
    playerState = document.getElementsByTagName("body")[0].getAttribute("data-unity-supports").slice(0, -1) + ", " + document.getElementsByTagName("body")[0].getAttribute("data-unity-state").slice(1);
    playerState = JSON.parse(playerState);
}

/* After Yandex Music page is loaded create Observer for track change: */
if (window.attachEvent) {
    window.attachEvent('onload', initializeMusicControls);
} else {
    if (window.onload) {
        var curronload = window.onload;
        var newonload = function (evt) {
            curronload(evt);
            initializeMusicControls(evt);
        };
        window.onload = newonload;
    } else {
        window.onload = initializeMusicControls();
    }
}

function initializeMusicControls() {
    // MutationObserver:
    window.MutationObserver = window.MutationObserver
        || window.WebKitMutationObserver
        || window.MozMutationObserver;
    // Find the body element
    var target = document.querySelector("body"),
        // Create an observer instance
        observer = new MutationObserver(function (mutation) {
            /* If changes caused by track then: */
            if (mutation[0].attributeName === "data-unity-state") {
                getPlayerState();
                chrome.runtime.sendMessage({ playerState: playerState });
            }
        }),
        // Configuration of the observer:
        config = {
            attributes: true
        };
    observer.observe(target, config);
}