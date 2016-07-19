/*
Listen for clicks in the popup.

If the click is not on one of the beasts, return early.

Otherwise, the ID of the node is the action we want.

* Author Vitalii Rizo
* http://squirrel-research.ru
* https://github.com/killbillsbor/ya-music-controls
* (c) 2016
* Yandex Music Player Control Plugin
* v.1.0

*/

var bg = chrome.extension.getBackgroundPage();
var yandexTabID;

document.addEventListener("click", function (e) {
    yandexTabID = bg.yandexTabID;
    if (!e.target.classList.contains("button")) {
        return;
    }
    var chosenAction = e.target.id;
    if (chosenAction === 'open') {
        chrome.tabs.create({url : "https://music.yandex.ru"});
        window.close();
    } else {
        chrome.tabs.sendMessage(yandexTabID, { action: chosenAction });
    }
});
                          
/* Get Music state if possible: */
function checkMusicState() {
    yandexTabID = bg.yandexTabID;
    if (typeof yandexTabID === 'undefined') {
        document.getElementById("notLoaded").setAttribute("style", "display: block;");
        document.getElementById("playerControls").setAttribute("style", "display: none;");
    } else {
        // Check if tab still exists?
        chrome.tabs.get(yandexTabID, function (tab) {
            if (!tab) {
                updatePopUp(); // call the update with undefined response
            } else {
                chrome.tabs.sendMessage(yandexTabID, { action: "getPlayerState" }, function (response) {
                    updatePopUp(response);
                });
            }
        });
    }
}

function updatePopUp(response) {
    if (typeof response !== 'undefined') {
        if (response.playerState.playing === false) {
            document.getElementById("play").setAttribute("class", "button");
        } else {
            document.getElementById("play").setAttribute("class", "button pause");
        }
        albumArtURL = response.playerState.albumArt;
        albumArtURL = "https://avatars.yandex.net/get-music-content/" + albumArtURL.split("/")[5] + "-1/50x50";
        document.getElementById("trackCover").setAttribute("src", albumArtURL);
        document.getElementById("trackCover").setAttribute("alt", response.playerState.artist + " - " + response.playerState.title);
        document.getElementById("trackName").innerHTML = response.playerState.title;
        document.getElementById("artistName").innerHTML = response.playerState.artist;
    } else {
        document.getElementById("notLoaded").setAttribute("style", "display: block;");
        document.getElementById("playerControls").setAttribute("style", "display: none;");
    }
}

window.onload = function () {
    checkMusicState();
};

chrome.runtime.onMessage.addListener(
    function (response, sender, sendResponse) {
        updatePopUp(response);
    }
);