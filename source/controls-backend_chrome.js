/**
 * Listen for clicks in the popup.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/killbillsbor/ya-music-controls
 * (c) 2016-2017
 * Yandex Music Player Control Plugin
 * v.1.2
 */

const bg = chrome.extension.getBackgroundPage();
let yandexTabID;

/* Listen to clicks in the popup: */
document.addEventListener("click", e => {
  // yandexTabID = bg.yandexTabID.slice(-1)[0];
  yandexTabID = bg.yandexTabID[0];
  if (!e.target.classList.contains("button")) {
    return;
  }
  const action = e.target.id;
  if (action === "open") {
    chrome.tabs.create({ url: "https://music.yandex.ru" });
    window.close();
  } else {
    chrome.tabs.sendMessage(yandexTabID, { action });
  }
});

/* Get Music state if possible: */
const checkMusicState = () => {
  yandexTabID = bg.yandexTabID[0];

  if (typeof yandexTabID === "undefined") {
    updatePopUp(); // call the update with undefined response
  } else {
    // Check if tab still exists?
    chrome.tabs.get(yandexTabID, tab => {
      if (!tab) {
        updatePopUp(); // call the update with undefined response
      } else {
        chrome.tabs.sendMessage(yandexTabID, { action: "GET_PLAYER_STATE" });
      }
    });
  }
};

/* Update data in the popup: */
var updatePopUp = response => {
  if (typeof response !== "undefined") {
    document.getElementById("play").setAttribute("class", "button " + (response.isPlaying ? "pause" : ""));

    // Artists list
    let artists = "";
    response.artists.forEach(artist => {
      artists =
        artists +
        '<a href="https://' +
        response.hostname +
        artist.link +
        '" target="_blank">' +
        artist.title +
        "</a>, ";
    });
    artists = artists.slice(0, -2);

    // Album art
    albumArtURL = "https://" + response.cover.slice(0, -2) + "100x100";
    document.getElementById("trackCover").setAttribute("src", albumArtURL);
    document.getElementById("trackLink").setAttribute("href", "https://" + response.hostname + response.link);
    document.getElementById("trackCover").setAttribute("alt", "Album title - " + response.title);

    // Track details
    document.getElementById("trackName").innerHTML = response.title;
    document.getElementById("artistName").innerHTML = artists;
    document.getElementById("liked").className = "button liked-" + response.liked;
    document.getElementById("disliked").className = "button disliked-" + response.disliked;
  } else {
    // If no response, then try another Tab ID if exists:
    if (bg.yandexTabID.length > 0) {
      // Remove the first Tab ID because it's unavailable anymore:
      bg.yandexTabID.shift();
      checkMusicState();
      return;
    }
    // If there is no more Tab ID, then show Not loaded message:
    document.getElementById("notLoaded").setAttribute("style", "display: block;");
    document.getElementById("playerControls").setAttribute("style", "display: none;");
  }
};

window.onload = () => {
  checkMusicState();
};

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  updatePopUp(request);
});
