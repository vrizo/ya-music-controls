/*
Listen for messages from Controls.js. The task is to get Tab ID of Yandex Music.

* Author Vitalii Rizo
* http://squirrel-research.ru
* https://github.com/killbillsbor/ya-music-controls
* (c) 2016
* Yandex Music Player Control Plugin
* v.1.0

*/

var yandexTabID;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.greeting === "hello") {
            yandexTabID = sender.tab.id;
            sendResponse({farewell: "Yandex Music tab ID is " + sender.tab.id });
        }
    }
);

