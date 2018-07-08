/**
 * Listen for clicks in the popup.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/killbillsbor/ya-music-controls
 * (c) 2016-2018
 * Yandex Music Player Control Plugin
 * v.1.4
 */

'use strict'

const state = {
  isHotkeysShown: false,
  isShareShown: false,
  yandexTabID: undefined,
  popupCount: 0
}
const isMac = navigator.platform.indexOf('Mac') > -1
const ctrl = isMac ? 'Cmd' : 'Ctrl'
const bg = chrome.extension.getBackgroundPage()

/* Listen to clicks in the popup: */
document.addEventListener('click', e => {
  const action = e.target.id

  if (bg && bg.yandexTabID) state.yandexTabID = bg.yandexTabID[0]
  if (!e.target.classList.contains('button')) return

  if (action === 'open') {
    chrome.tabs.create({ url: 'https://music.yandex.ru' })
    window.close()
  } else if (action === 'toggleHotkeys') {
    toggleHotkeys()
  } else {
    chrome.tabs.sendMessage(state.yandexTabID, { action })
  }
  e.target.blur()
})

chrome.runtime.onMessage.addListener(response => {
  updatePopup(response)
})

/* Get Music state if possible: */
const checkMusicState = () => {
  if (bg && bg.yandexTabID && bg.yandexTabID.length > 0) {
    state.yandexTabID = bg.yandexTabID[0]
  } else if (bg && bg.yandexTabID.length === 0 && state.yandexTabID) {
    bg.yandexTabID.push(state.yandexTabID)
  }

  if (typeof state.yandexTabID === 'undefined') {
    updatePopup()
  } else {
    /* Check if tab still exists? */
    chrome.tabs.get(state.yandexTabID, tab => {
      if (!tab) {
        updatePopup() // call the update with undefined response
        state.yandexTabID = undefined
      } else {
        chrome.tabs.sendMessage(state.yandexTabID, {
          action: 'GET_PLAYER_STATE'
        })
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
      ? `Пауза [${ ctrl } + Shift + O]`
      : `Играть [${ ctrl } + Shift + O]`)

    if (typeof response.title !== 'undefined') {
      /* Artists list */
      let artists = ''
      response.artists.forEach(artist => {
        artists +=
          `<a href="https://${ response.hostname + artist.link }"
           target="_blank">${ artist.title }</a>, `
      })

      /* Album art */
      const albumArtURL = 'https://' + response.cover.slice(0, -2) + '100x100'

      trackCover.setAttribute('src', albumArtURL)
      trackCover.setAttribute('alt', 'Обложка альбома — ' + response.title)
      link.setAttribute('href', 'https://' + response.hostname + response.link)

      /* Track details */
      trackName.textContent = response.title
      artistName.innerHTML = artists.slice(0, -2)
      dislike.className = 'button disliked-' + response.disliked
      like.className = 'button liked-' + response.liked

      /* Such error, many tabs */
      messagesBlock.textContent = bg.yandexTabID.length > 1
        ? 'Открыто несколько вкладок с Яндекс.Музыкой. ' +
          'Рекомендуется использовать только одну.'
        : ''

      /* Sharer blocks */
      shareBlock.style.display = state.isShareShown ? 'block' : 'none'
    } else {
      /* If music is not started, but Yandex Music is opened */
      trackCover.setAttribute('alt', 'Выберите плейлист в Яндекс.Музыке')
      trackName.textContent = 'Выберите плейлист в Яндекс.Музыке'
    }
  } else {
    /* If no response, then try another Tab ID if exists */
    if (bg.yandexTabID && bg.yandexTabID.length > 0) {
      /* Remove the first Tab ID because it's unavailable anymore */
      state.yandexTabID = undefined
      bg.yandexTabID.shift()
      checkMusicState()
      return
    }
    /* If there is no more Tab ID, then show Not loaded message */
    notLoaded.setAttribute('style', 'display: block;')
    playerControls.setAttribute('style', 'display: none;')
  }
}

window.onload = () => {
  const gettingSettings = browser.storage.local.get()
  gettingSettings.then(storage => {
    state.isHotkeysShown = typeof storage.isHotkeysShown === 'undefined'
      ? true
      : storage.isHotkeysShown
    state.isShareShown = storage.isShareShown
    state.yandexTabID = storage.yandexTabID || state.yandexTabID
    state.popupCount = storage.popupCount ? storage.popupCount + 1 : 1

    checkMusicState()
    renderHotkeys()
    renderShare()

    saveSettings()
  })
}

/* Share block state update function */
const renderShare = () => {
  const share = document.getElementById('share')
  const counter = state.popupCount

  state.isShareShown = (counter > 5 && counter < 30) ||
    (counter > 65 && counter < 100)

  share.style.display = state.isShareShown ? 'block' : 'none'
}

const renderHotkeys = () => {
  const hotkeys = document.getElementById('hotkeys')
  const ctrls = document.querySelectorAll('.hotkeys_ctrl')
  const open = document.getElementById('open')
  const prev = document.getElementById('prev')
  const next = document.getElementById('next')

  open.setAttribute('title', `Открыть Я.Музыку [${ ctrl } + Shift + O]`)
  prev.setAttribute('title', `Предыдущий трек [${ ctrl } + Shift + K]`)
  next.setAttribute('title', `Следующий трек [${ ctrl } + Shift + L]`)
  ctrls.forEach(elem => {
    elem.textContent = ctrl
  })

  hotkeys.className = state.isHotkeysShown
    ? 'hotkeys'
    : 'hotkeys hotkeys-collapsed'
}

const saveSettings = () => {
  const settings = {
    ...state
  }
  browser.storage.local.set(settings)
}

const toggleHotkeys = () => {
  state.isHotkeysShown = !state.isHotkeysShown
  renderHotkeys()
  saveSettings()
}
