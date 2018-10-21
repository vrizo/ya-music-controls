/**
 * Listen for clicks in the popup.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/killbillsbor/ya-music-controls
 * (c) 2016-2018
 * Yandex Music Player Control Plugin
 * v.1.5
 */

'use strict'

let state = {
  onMessageBarAction: null,
  isShareShown: false,
  yandexTabID: undefined,
  pluginCount: 0,
  isPlaying: false,
  barType: null
}
let isMac = navigator.platform.indexOf('Mac') > -1
let ctrl = isMac ? 'Cmd' : 'Ctrl'
let bg = chrome.extension.getBackgroundPage()

let format = combination => {
  if (!combination) return null
  let output = combination.replace(/\+/g, ' + ')
  if (isMac) output = output.replace('MacCtrl', 'Control')
  output = output.replace('Ctrl', ctrl)
  if (isMac) output = output.replace('Control', 'Ctrl')

  return output
}

/* Listen to clicks in the popup: */
document.addEventListener('click', e => {
  let action = e.target.id
  if (bg && bg.yandexTabID) state.yandexTabID = bg.yandexTabID[0]
  if (!e.target.classList.contains('button')) return

  if (action === 'open') {
    chrome.tabs.create({ url: 'https://music.yandex.ru' })
    window.close()
  } else if (action === 'message-bar__action') {
    if (state.onMessageBarAction) state.onMessageBarAction()
    state[state.barType + 'BarDismissed'] = true
    renderMessageBar()
    saveSettings()
  } else if (action === 'message-bar__dismiss') {
    state[state.barType + 'BarDismissed'] = true
    renderMessageBar()
    saveSettings()
  } else {
    showLoader()
    chrome.tabs.sendMessage(state.yandexTabID, { action })
  }
  e.target.blur()
})

chrome.runtime.onMessage.addListener(response => {
  hideLoader()
  updatePopup(response)
})

/* Get Music state if possible: */
let checkMusicState = () => {
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
let updatePopup = response => {
  let playerControls = document.getElementById('playerControls')
  let trackCover = document.getElementById('trackCover')
  let artistName = document.getElementById('artistName')
  let shareBlock = document.getElementById('share')
  let trackName = document.getElementById('trackName')
  let notLoaded = document.getElementById('notLoaded')
  let dislike = document.getElementById('disliked')
  let link = document.getElementById('trackLink')
  let like = document.getElementById('liked')
  let play = document.getElementById('play')
  let next = document.getElementById('next')
  let prev = document.getElementById('prev')

  if (typeof response !== 'undefined') {
    response = response.state
    state.isPlaying = response.isPlaying

    play.setAttribute('class',
      'button button-ghost ' + (state.isPlaying ? 'pause' : ''))
    response.next
      ? next.removeAttribute('disabled')
      : next.setAttribute('disabled', 'disabled')
    response.prev
      ? prev.removeAttribute('disabled')
      : prev.setAttribute('disabled', 'disabled')

    if (typeof response.title !== 'undefined') {
      /* Artists list */
      let artists = ''
      response.artists.forEach(artist => {
        artists +=
          `<a href="https://${ response.hostname + artist.link }"
           target="_blank">${ artist.title }</a>, `
      })

      /* Album art */
      let albumArtURL = 'https://' + response.cover.slice(0, -2) + '100x100'

      trackCover.setAttribute('src', albumArtURL)
      trackCover.setAttribute('alt', 'Обложка альбома — ' + response.title)
      link.setAttribute('href', 'https://' + response.hostname + response.link)

      /* Track details */
      trackName.textContent = response.title
      artistName.innerHTML = artists.slice(0, -2)
      dislike.className = 'button button-ghost enabled-' + response.disliked
      like.className = 'button button-ghost enabled-' + response.liked

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

  renderHotkeys()
}

window.onload = () => {
  let gettingSettings = browser.storage.local.get()
  gettingSettings.then(storage => {
    state.hotkeysBarDismissed = storage.hotkeysBarDismissed
    state.tabsBarDismissed = storage.tabsBarDismissed
    state.isShareShown = storage.isShareShown
    state.yandexTabID = storage.yandexTabID || state.yandexTabID
    state.pluginCount = storage.pluginCount ? storage.pluginCount + 1 : 1

    if (storage.pluginCount % 5 === 0) {
      state.tabsBarDismissed = false
    }
    if (storage.pluginCount % 250 === 0) {
      state.hotkeysBarDismissed = false
    }

    renderMessageBar()
    checkMusicState()
    renderShare()

    saveSettings()
  })
}

let showLoader = () => {
  let loader = document.getElementById('loader')
  loader.style.opacity = 1
}

let hideLoader = () => {
  let loader = document.getElementById('loader')
  loader.style.opacity = 0
}

let renderShare = () => {
  let share = document.getElementById('share')
  let counter = state.pluginCount

  state.isShareShown = (counter > 15 && counter < 25) ||
    (counter > 85 && counter < 90) ||
    (counter > 165 && counter < 170)

  share.style.display = state.isShareShown ? 'block' : 'none'
}

let renderHotkeys = () => {
  let dislike = document.getElementById('disliked')
  let like = document.getElementById('liked')
  let play = document.getElementById('play')
  let open = document.getElementById('open')
  let prev = document.getElementById('prev')
  let next = document.getElementById('next')

  browser.commands.getAll().then(list => {
    let cmds = {}
    list.forEach(i => (cmds[i.name] = i.shortcut))

    dislike.setAttribute('title', `Не нравится [${ format(cmds.disliked) }]`)
    like.setAttribute('title', `Нравится [${ format(cmds.liked) }]`)
    play.setAttribute('title', state.isPlaying
      ? `Пауза [${ format(cmds.play) }]`
      : `Играть [${ format(cmds.play) }]`)
    open.setAttribute('title', `Открыть Я.Музыку [${ format(cmds.play) }]`)
    prev.setAttribute('title', `Предыдущий трек [${ format(cmds.prev) }]`)
    next.setAttribute('title', `Следующий трек [${ format(cmds.next) }]`)
  })
}

let renderMessageBar = () => {
  let messageBar = document.getElementById('message-bar')
  let content = {}

  if (!state.tabsBarDismissed && bg.yandexTabID.length > 1) {
    /* Such error, many tabs */
    content = {
      text: 'Вы открыли несколько вкладок с Яндекс.Музыкой. Оставьте одну',
      action: null
    }
    state.barType = 'tabs'
  } else if (!state.hotkeysBarDismissed) {
    content = {
      width: 145,
      text: 'С горячими клавишами удобнее.',
      action: 'Настроить'
    }
    state.onMessageBarAction = () => browser.runtime.openOptionsPage()
    state.barType = 'hotkeys'
  }

  let output = `
    <div class="message-bar__icon">
      <object type="image/svg+xml" data="icons/info.svg" tabindex="-1"></object>
    </div>
    <div class="message-bar__text"
         style="width: ${ content.width ? content.width : 'auto' }"
    >
      ${ content.text }
  `

  if (content.action) {
    output += `
      <div class="message-bar__action">
        <button class="button button-micro" id="message-bar__action">
          ${ content.action }
        </button>
      </div>
    `
  }

  output += `
    </div>
    <div class="message-bar__dismiss">
      <button class="button button-micro button-ghost"
              title="Скрыть"
              id="message-bar__dismiss"
      >
        <object data="icons/close.svg"
                type="image/svg+xml"
                tabindex="-1"
        ></object>
      </button>
    </div>
  `

  if (content.text) {
    messageBar.classList.add('is-shown')
    messageBar.innerHTML = output
  } else {
    messageBar.classList.remove('is-shown')
  }
}

let saveSettings = () => {
  let settings = {
    ...state,
    onMessageBarAction: null
  }
  browser.storage.local.set(settings)
}
