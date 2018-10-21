# Yandex Music Controls web extension

<img src="/images/logo-hd.png" align="center" height="439" width="450" alt="Music Controls Logo" >

Ya.Music Controls plugin let you quickly see what’s currently playing, change the song, and pause or play music without switching a tab.
The plugin adds one icon in your browser’s toolbar. By clicking on this icon a popup box with Music controls appears.

It works perfectly with the latest Firefox browser.

It’s available in English :gb: and Russian :ru:.

## Packaged versions

* [Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/yandex-music-controls/)
* Chrome Store — not available due to required $5 payment

## How to use

1. Install the plugin
2. Go to the [Yandex Music site](https://music.yandex.ru/) and click the Ya.Music control icon. Or click on the icon and press the button "Yandex Music is not opened"

*After installation you will need to refresh your Yandex Music page if it was loaded before install*

## Features

* This plugin provides Music control buttons (Play/Pause, Next, Previous, Like/Unlike) :musical_note:
* and Player information (track and artist name, album art)

## Development usage

1. Run `yarn install` to install all necessary packages
2. Add `sources/manifest.json` as a temporary plugin in `about:debugging`

Do not forget to remove `__MACOSX` and `.DS_Store` from the archive:

```bash
$ zip -d yandex_music_controls-*.zip "*/*.DS_Store"
$ zip -d yandex_music_controls-*.zip "__MACOSX/*"
```

## Todo

* Get rid of unsafe assignment to innerHTML
* Add :mute: Mute button
* Auto packager

## Having any troubles or ideas?

Please contact [me by email](mailto:kb@kernel-it.ru).

*Права на отдельные компоненты, составляющие дизайн настоящей программы для ЭВМ "Yandex Music Controls", принадлежат ООО «ЯНДЕКС».*

## Changelog

### 1.5.1
* Hotfix: add `music.yandex.com` to manifest

### 1.5
* Add localization — now it supports English language
* Add like/dislike hotkeys

### 1.4

* Add Options page. Now you can set your own hotkeys combinations
* Better interface according to [Firefox Photon Design System](https://design.firefox.com/photon/welcome.html)
* Add loader animation when it… loads
* Code improvements

### 1.3

* Added Hotkeys! The collapsible list is available in the popup
* Volume control!
* Improved accessibility: focus styling for buttons and links
* ESLint added, LOTS of code refactoring

### 1.2

* New features: like/dislike buttons, share buttons (don't forget to share with your friends!), multiple tabs support
* Improved UI
* It supports not only Russian but also Ukrainian and Belarusian website versions now!
* Also, it uses Yandex Music API in a new version for better performance and stability
* Code improvements

### 1.0.3

* Small bug fixes

### 1.0

* Initial release