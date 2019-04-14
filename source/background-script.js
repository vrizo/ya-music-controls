/**
 * Listen for messages from Controls.js.
 * The aim is to get Tab ID of Yandex Music.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/vrizo/ya-music-controls
 * (c) 2016–2019
 * Yandex Music Player Control Plugin
 * v.1.7
 */

'use strict'

var isNotificationsEnabled = false // eslint-disable-line
let prevTrackName
var yandexTabID = [] // eslint-disable-line
let currStatus = 'play'
let settings = browser.storage.local.get()

chrome.runtime.onMessage.addListener((response, sender) => {
  if (response.greeting === 'hello') {
    /* Add Tab ID to the end of IDs array */
    yandexTabID.push(sender.tab.id)
  } else if (response.greeting === 'bye') {
    yandexTabID = yandexTabID.filter(item => item !== sender.tab.id)
  } else if (!prevTrackName && response.state) {
    prevTrackName = response.state.title
  } else if (
    response.state &&
    isNotificationsEnabled &&
    response.state.isPlaying &&
    !response.state.isPopupAction &&
    prevTrackName !== response.state.title
  ) {
    browser.notifications.create('ya-music-notification', {
      message: response.state.artists.map(artist => artist.title).join(', '),
      iconUrl: 'https://' + response.state.cover.slice(0, -2) + '100x100',
      title: response.state.title,
      type: 'basic'
    })
    prevTrackName = response.state.title
  }

  /* Update panel icon */
  if (response.state) {
    let status
    status = response.state.isPlaying ? 'play' : 'pause'
    status += response.state.liked ? '-like' : ''

    if (currStatus !== status) {
      currStatus = status
      browser.browserAction.setIcon({
        path: 'icon-48-panel-' + status + '.png'
      })
    }
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

/* Load settings: */
settings.then(storage => {
  isNotificationsEnabled = storage.notifications || false
})
