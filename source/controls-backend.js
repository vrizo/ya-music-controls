/**
 * Listen for clicks in the popup.
 * Author Vitalii Rizo
 * https://github.com/vrizo/ya-music-controls
 * (c) 2016–2021
 * Yandex Music Player Control Plugin
 * v.1.9
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
let isMac = navigator.platform.includes('Mac')
let ctrl = isMac ? 'Cmd' : 'Ctrl'
let bg = chrome.extension.getBackgroundPage()

let t = (code, substitution) => {
  return browser.i18n.getMessage(code, substitution)
}

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
    chrome.tabs.sendMessage(state.yandexTabID, { action, isPopupAction: true })
  }
  e.target.blur()
})

/* Listen to keypresses in the popup like in the player tab: */
document.addEventListener('keydown', e => {
  let action

  if (e.altKey || e.ctrlKey || e.metaKey) return

  if (e.key === '+') {
    action = 'volumeUp'
  } else if (e.key === '-') {
    action = 'volumeDown'
  } else {
    if (e.repeat || e.shiftKey) return

    if (e.code === 'Space' || e.code === 'KeyP') {
      action = 'play'
    } else if (e.code === 'KeyL') {
      action = 'next'
    } else if (e.code === 'KeyK') {
      action = 'prev'
    } else if (e.code === 'KeyF') {
      action = 'liked'
    } else if (e.code === 'KeyD') {
      action = 'disliked'
    }
  }

  if (action) {
    chrome.tabs.sendMessage(state.yandexTabID, { action, isPopupAction: true })
  }
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
          isPopupAction: true,
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
  let trackName = document.getElementById('trackName')
  let notLoaded = document.getElementById('notLoaded')
  let dislike = document.getElementById('disliked')
  let link = document.getElementById('trackLink')
  let like = document.getElementById('liked')
  let play = document.getElementById('play')
  let next = document.getElementById('next')
  let prev = document.getElementById('prev')
  let open = document.getElementById('open')

  if (typeof response !== 'undefined') {
    response = response.state
    state.isPlaying = response.isPlaying
    state.isRadio = response.prev === null

    play.setAttribute(
      'class',
      'button button-ghost ' + (state.isPlaying ? 'pause' : '')
    )
    response.next || state.isRadio
      ? next.removeAttribute('disabled')
      : next.setAttribute('disabled', 'disabled')
    response.prev
      ? prev.removeAttribute('disabled')
      : prev.setAttribute('disabled', 'disabled')

    if (typeof response.title !== 'undefined') {
      /* Artists list */
      let artists = document.createElement('div')

      response.artists.forEach((a, index) => {
        let artistLink = document.createElement('a')
        let separator = document.createTextNode(', ')

        artistLink.setAttribute('href', 'https://' + response.hostname + a.link)
        artistLink.setAttribute('target', '_blank')
        artistLink.textContent = a.title
        artists.appendChild(artistLink)

        if (index + 1 < response.artists.length) {
          artists.appendChild(separator)
        }
      })

      /* Album art */
      let albumArtURL = 'https://' + response.cover.slice(0, -2) + '100x100'

      trackCover.setAttribute('src', albumArtURL)
      trackCover.setAttribute('alt', t('controlsCover') + response.title)
      trackCover.setAttribute('title', t('controlsCover') + response.title)
      link.setAttribute('href', 'https://' + response.hostname + response.link)

      /* Track details */
      trackName.textContent = response.title
      while (artistName.firstChild) artistName.firstChild.remove()
      artistName.appendChild(artists)
      dislike.className = 'button button-ghost enabled-' + response.disliked
      like.className = 'button button-ghost enabled-' + response.liked
    } else {
      /* If music is not started, but Yandex Music is opened */
      trackCover.setAttribute('alt', t('controlsChoosePlaylist'))
      trackName.textContent = t('controlsChoosePlaylist')
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
    open.appendChild(document.createTextNode(t('controlsOpen')))
  }

  renderHotkeys()
}

window.onload = () => {
  let gettingSettings = browser.storage.local.get()

  gettingSettings.then(storage => {
    state.notificationsBarDismissed = storage.notificationsBarDismissed
    state.hotkeysBarDismissed = storage.hotkeysBarDismissed
    state.seekBarDismissed = storage.seekBarDismissed
    state.tabsBarDismissed = storage.tabsBarDismissed
    state.isShareShown = storage.isShareShown
    state.yandexTabID = storage.yandexTabID || state.yandexTabID
    state.pluginCount = storage.pluginCount ? storage.pluginCount + 1 : 1

    if (storage.pluginCount % 5 === 0) {
      state.tabsBarDismissed = false
    }
    if (storage.pluginCount % 200 === 0) {
      state.hotkeysBarDismissed = false
    }

    renderMessageBar()
    checkMusicState()
    renderShare()

    saveSettings()
  })
}

let loaderTimer

let showLoader = () => {
  loaderTimer = setTimeout(() => {
    let loader = document.getElementById('loader')
    loader.style.opacity = 1
  }, 200)
}

let hideLoader = () => {
  clearTimeout(loaderTimer)
  let loader = document.getElementById('loader')
  loader.style.opacity = 0
}

let renderShare = () => {
  let shareBlockRu = document.getElementById('share__ru')
  let shareBlockEn = document.getElementById('share__en')
  let counter = state.pluginCount
  let lang = browser.i18n.getUILanguage().substr(0, 2)

  state.isShareShown =
    (counter > 15 && counter < 25) ||
    (counter > 85 && counter < 90) ||
    (counter > 165 && counter < 170)

  if (lang === 'ru' || lang === 'uk' || lang === 'be') {
    shareBlockRu.style.display = state.isShareShown ? 'block' : 'none'
  } else {
    shareBlockEn.style.display = state.isShareShown ? 'block' : 'none'
  }
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

    dislike.setAttribute('title', t('controlsDisliked', format(cmds.disliked)))
    like.setAttribute('title', t('controlsLiked', format(cmds.liked)))
    play.setAttribute(
      'title',
      state.isPlaying
        ? t('controlsPause', format(cmds.play))
        : t('controlsPlay', format(cmds.play))
    )
    open.setAttribute('title', t('controlsOpen') + ` [${format(cmds.play)}]`)
    prev.setAttribute('title', t('controlsPrev', format(cmds.prev)))
    next.setAttribute('title', t('controlsNext', format(cmds.next)))
  })
}

let renderMessageBar = () => {
  let messageBar = document.getElementById('message-bar')
  let content = {}

  if (!state.tabsBarDismissed && bg.yandexTabID.length > 1) {
    /* Such error, many tabs */
    content = {
      text: t('messagesManyTabs'),
      action: null
    }
    state.barType = 'tabs'
  } else if (!state.hotkeysBarDismissed) {
    content = {
      width: 145,
      text: t('messagesHotKeys'),
      action: t('messagesConfigure')
    }
    state.onMessageBarAction = () => browser.runtime.openOptionsPage()
    state.barType = 'hotkeys'
  } else if (!state.notificationsBarDismissed) {
    content = {
      width: 145,
      text: t('messagesNotifications'),
      action: t('messagesConfigure')
    }
    state.onMessageBarAction = () => browser.runtime.openOptionsPage()
    state.barType = 'notifications'
  } else if (!state.seekBarDismissed && state.pluginCount > 30) {
    content = {
      width: 145,
      text: t('messagesSeek'),
      action: t('messagesConfigure')
    }
    state.onMessageBarAction = () => browser.runtime.openOptionsPage()
    state.barType = 'seek'
  }

  let output = `
    <div class="message-bar__icon">
      <object type="image/svg+xml" data="icons/info.svg" tabindex="-1"></object>
    </div>
    <div class="message-bar__text"
         style="width: ${content.width ? content.width : 'auto'}"
    >
      ${content.text}
  `

  if (content.action) {
    output += `
      <div class="message-bar__action">
        <button class="button button-micro" id="message-bar__action">
          ${content.action}
        </button>
      </div>
    `
  }

  output += `
    </div>
    <div class="message-bar__dismiss">
      <button class="button button-micro button-ghost"
              title="${t('messagesDismiss')}"
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
    let parser = new DOMParser()
    let parsed = parser.parseFromString(output, 'text/html')
    let tags = parsed.getElementsByTagName('body')[0].childNodes

    while (messageBar.firstChild) {
      messageBar.firstChild.remove()
    }

    for (let tag of tags) {
      messageBar.appendChild(tag)
    }

    messageBar.classList.add('is-shown')
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
