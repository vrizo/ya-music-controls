/**
 * Main script for Yandex Music player control.
 * Author Vitalii Rizo
 * https://github.com/vrizo/ya-music-controls
 * (c) 2016–2020
 * Yandex Music Player Control Plugin
 * v.1.8
 */

'use strict'

let isPopupAction = false
let state

/* Send message to Background Script to get
   or remove the Yandex Music Tab ID: */
chrome.runtime.sendMessage({ greeting: 'hello' })

window.onbeforeunload = () => {
  chrome.runtime.sendMessage({ greeting: 'bye' })
}

/* Send request to Yandex Music API: */
let sendPlayerState = () => {
  let api = window.wrappedJSObject.externalAPI
  state = {
    ...api.getCurrentTrack(),
    ...api.getControls(),
    isPopupAction: !!isPopupAction,
    isPlaying: api.isPlaying(),
    hostname: window.location.hostname,
    volume: api.getVolume() || 0
  }

  chrome.runtime.sendMessage({ state })
  isPopupAction = false
}

/* Listen to commands from buttons: */
chrome.runtime.onMessage.addListener(request => {
  if (request) {
    let api = window.wrappedJSObject.externalAPI
    isPopupAction = request.isPopupAction

    switch (request.action) {
      case 'next':
        api.next()
        break
      case 'prev':
        api.prev()
        break
      case 'forward':
        api.setPosition(api.getProgress().position + 10)
        break
      case 'backward':
        api.setPosition(api.getProgress().position - 10)
        break
      case 'play':
        api.togglePause()
        break
      case 'liked':
        api.toggleLike()
        sendPlayerState() // toggleLike can't be detected by observer
        break
      case 'disliked':
        api.toggleDislike()
        sendPlayerState() // toggleDislike can't be detected by observer
        break
      case 'volumeUp':
        api.setVolume(state.volume + 0.1 > 1 ? 1 : state.volume + 0.1)
        sendPlayerState()
        break
      case 'volumeDown':
        api.setVolume(state.volume - 0.1 < 0 ? 0 : state.volume - 0.1)
        sendPlayerState()
        break
      case 'GET_PLAYER_STATE':
        sendPlayerState()
        break
      default:
        break
    }
  }
})

let initializeMusicControls = () => {
  window.MutationObserver = window.MutationObserver ||
  window.WebKitMutationObserver ||
  window.MozMutationObserver
  /* Find the body element */
  let target = document.querySelector('body')
  /* Create an observer instance */
  let observer = new MutationObserver(mutation => {
    /* If changes caused by track then: */
    if (mutation[0].attributeName === 'data-unity-state' ||
        mutation[0].attributeName === 'data-unity-supports') {
      sendPlayerState()
    }
  })
  /* Configuration of the observer: */
  let config = {
    attributes: true
  }
  observer.observe(target, config)
}

/* After Yandex Music page is loaded create Observer to detect track changes: */
if (window.attachEvent) {
  window.attachEvent('onload', initializeMusicControls)
} else if (window.onload) {
  let curronload = window.onload
  let newonload = function (evt) {
    curronload(evt)
    initializeMusicControls(evt)
  }
  window.onload = newonload
} else {
  window.onload = initializeMusicControls()
}
