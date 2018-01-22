/**
 * Listen for clicks in the popup.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/killbillsbor/ya-music-controls
 * (c) 2016-2018
 * Yandex Music Player Control Plugin
 * v.1.3
 */

'use strict'

const isMac = navigator.platform.indexOf('Mac') > -1
const ctrl = isMac ? 'Cmd' : 'Ctrl'
const bg = chrome.extension.getBackgroundPage()
let yandexTabID
let shareState = {}

/* Listen to clicks in the popup: */
document.addEventListener('click', e => {
  yandexTabID = bg.yandexTabID[0]
  if (!e.target.classList.contains('button')) {
    return
  }
  const action = e.target.id
  if (action === 'open') {
    chrome.tabs.create({ url: 'https://music.yandex.ru' })
    window.close()
  } else {
    chrome.tabs.sendMessage(yandexTabID, { action })
  }
  e.currentTarget.blur()
})

chrome.runtime.onMessage.addListener(response => {
  updatePopup(response)
})

/* Get Music state if possible: */
const checkMusicState = () => {
  yandexTabID = bg.yandexTabID[0]

  if (typeof yandexTabID === 'undefined') {
    updatePopup() // call the update with undefined response
  } else {
    // Check if tab still exists?
    chrome.tabs.get(yandexTabID, tab => {
      if (!tab) {
        updatePopup() // call the update with undefined response
      } else {
        chrome.tabs.sendMessage(yandexTabID, { action: 'GET_PLAYER_STATE' })
      }
    })
  }
}

/* Update data in the popup: */
const updatePopup = response => {
  const playerControls = document.getElementById('playerControls')
  const messagesBlock = document.getElementById('messages')
  const trackCover = document.getElementById('trackCover')
  const artistName = document.getElementById('artistName')
  const shareBlock = document.getElementById('share')
  const trackName = document.getElementById('trackName')
  const notLoaded = document.getElementById('notLoaded')
  const dislike = document.getElementById('disliked')
  const link = document.getElementById('trackLink')
  const like = document.getElementById('liked')
  const play = document.getElementById('play')

  if (typeof response !== 'undefined') {
    response = response.state

    play.setAttribute('class', 'button ' + (response.isPlaying ? 'pause' : ''))
    play.setAttribute('title', response.isPlaying
      ? `Пауза [${ ctrl } + Shift + Пробел]`
      : `Играть [${ ctrl } + Shift + Пробел]`)

    if (typeof response.title !== 'undefined') {
      // Artists list
      let artists = ''
      response.artists.forEach(artist => {
        artists +=
          `<a href="https://${ response.hostname + artist.link }"
           target="_blank">${ artist.title }</a>, `
      })

      // Album art
      const albumArtURL = 'https://' + response.cover.slice(0, -2) + '100x100'

      trackCover.setAttribute('src', albumArtURL)
      trackCover.setAttribute('alt', 'Album title — ' + response.title)
      link.setAttribute('href', 'https://' + response.hostname + response.link)

      // Track details
      trackName.textContent = response.title
      artistName.innerHTML = artists.slice(0, -2)
      dislike.className = 'button disliked-' + response.disliked
      like.className = 'button liked-' + response.liked

      // Such error, many tabs
      messagesBlock.textContent = bg.yandexTabID.length > 1
        ? 'Открыто несколько вкладок с Яндекс.Музыкой. ' +
          'Рекомендуется использовать только одну.'
        : ''

      // Sharer block
      shareBlock.style.display = shareState.isShown ? 'block' : 'none'
    } else {
      // If music is not started, but Yandex Music is opened:
      trackCover.setAttribute('alt', 'Выберите плейлист в Яндекс.Музыке')
      trackName.textContent = 'Выберите плейлист в Яндекс.Музыке'
    }
  } else {
    // If no response, then try another Tab ID if exists:
    if (bg.yandexTabID.length > 0) {
      // Remove the first Tab ID because it's unavailable anymore:
      bg.yandexTabID.shift()
      checkMusicState()
      return
    }
    // If there is no more Tab ID, then show Not loaded message:
    notLoaded.setAttribute('style', 'display: block;')
    playerControls.setAttribute('style', 'display: none;')
  }
}

window.onload = () => {
  checkMusicState()

  /* Update state of the share block: */
  const gettingShareInfo = browser.storage.local.get('shareBlock')
  gettingShareInfo.then(popupShareBlock)
}

/* Share block state update functio
   (counts how much the popup was opened, changes isShown property) */
const popupShareBlock = storage => {
  let counter
  let isShown

  /* Counter: */
  if (typeof storage.shareBlock === 'undefined') {
    // First start:
    counter = 0
    isShown = false
  } else {
    counter = storage.shareBlock.counter + 1
    isShown = (counter > 5 && counter < 30) || (counter > 65 && counter < 100)
  }

  /* Prepare new object (keeping an existing values just in case): */
  shareState = Object.assign({}, storage.shareBlock, { counter, isShown })

  /* Set new info about the share block */
  browser.storage.local.set({ shareBlock: shareState })
}
