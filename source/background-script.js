/**
 * Listen for messages from Controls.js. The task is to get Tab ID of Yandex Music.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/killbillsbor/ya-music-controls
 * (c) 2016-2018
 * Yandex Music Player Control Plugin
 * v.1.3
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

/* Listen to hot keys commands: */
browser.commands.onCommand.addListener(function(command) {
  chrome.tabs.sendMessage(yandexTabID[0], { action: command });
});