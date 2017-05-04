/**
 * Listen for clicks in the popup.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/killbillsbor/ya-music-controls
 * (c) 2016-2017
 * Yandex Music Player Control Plugin
 * v.1.2
 */

var bg = chrome.extension.getBackgroundPage();
let yandexTabID;
let shareState = {};

/* Listen to clicks in the popup: */
document.addEventListener("click", e => {
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

chrome.runtime.onMessage.addListener(response => {
  updatePopUp(response);
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
    response = response.currentState;

    document.getElementById("play").setAttribute("class", "button " + (response.isPlaying ? "pause" : ""));

    if (typeof response.title !== "undefined") {
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
      document.getElementById("trackName").textContent = response.title;
      document.getElementById("artistName").innerHTML = artists;
      document.getElementById("liked").className = "button liked-" + response.liked;
      document.getElementById("disliked").className = "button disliked-" + response.disliked;

      // Such error, many tabs
      if (bg.yandexTabID.length > 1)
        document.getElementById("messages").textContent =
          "Открыто несколько вкладок с Яндекс.Музыкой. Рекомендуется использовать только одну.";
      else document.getElementById("messages").textContent = "";

      // Sharer block
      document.getElementById("share").style.display = shareState.is_shown ? "block" : "none";
    } else {
      // If music is not started, but Yandex Music is opened:
      document.getElementById("trackCover").setAttribute("alt", "");
      document.getElementById("trackName").textContent = "Выберите плейлист в Яндекс.Музыке";
    }
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

  // Update state of the share block:
  let gettingShareInfo = browser.storage.local.get("share_block");
  gettingShareInfo.then(popupShareBlock);
};

/* Share block state update function (counts how much the popup was opened, changes is_shown property) */
var popupShareBlock = storage => {
  let counter;
  let is_shown;

  // Counter:
  if (typeof storage.share_block === "undefined") {
    // First start:
    counter = 0;
    is_shown = false;
  } else {
    counter = storage.share_block.counter + 1;
    is_shown = (counter > 10 && counter < 20) || (counter > 60 && counter < 75);
  }

  // Prepare new object (keeping an existing values just in case):
  shareState = Object.assign({}, storage.share_block, { counter, is_shown });

  // Set new info about the share block
  browser.storage.local.set({ share_block: shareState });
};
