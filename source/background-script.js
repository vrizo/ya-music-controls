/**
 * Listen for messages from Controls.js.
 * The aim is to get Tab ID of Yandex Music.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/killbillsbor/ya-music-controls
 * (c) 2016-2018
 * Yandex Music Player Control Plugin
 * v.1.3
 */

'use strict'

var yandexTabID = [] // eslint-disable-line no-var

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.greeting === 'hello') {
    /* Add Tab ID to the end of IDs array */
    yandexTabID.push(sender.tab.id)
  } else if (request.greeting === 'bye') {
    yandexTabID = yandexTabID.filter(item => item !== sender.tab.id)
  }
})

/* Listen to hot keys commands: */
browser.commands.onCommand.addListener(command => {
  if (yandexTabID.length === 0 && command === 'play') {
    chrome.tabs.create({ url: 'https://music.yandex.ru' })
    return
  }
  chrome.tabs.sendMessage(yandexTabID[0], { action: command })
})
