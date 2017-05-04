/**
 * Listen for messages from Controls.js. The task is to get Tab ID of Yandex Music.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/killbillsbor/ya-music-controls
 * (c) 2016-2017
 * Yandex Music Player Control Plugin
 * v.1.2
 */

var yandexTabID = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === "hello") {
    // Add Tab ID to the end of IDs array.
    yandexTabID.push(sender.tab.id);
  } else if (request.greeting === "bye") {
    yandexTabID = yandexTabID.filter(item => item !== sender.tab.id);
  }
});
