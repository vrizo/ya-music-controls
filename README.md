# Yandex Music Controls Web Extension

<img src="/images/logo-hd.png" align="center" height="439" width="450" alt="Music Controls Logo" >

Yandex Music Controls plugin let you quickly see what’s currently playing, change the song, and pause or play music without switching a tab.
The plugin adds one icon in your browser’s toolbar. By clicking on this icon a popup box with Music controls appears.

It works perfectly with the latest Firefox browser.

It’s available in English :gb: and Russian :ru:.

## Packaged Versions

* [Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/yandex-music-controls/)
* Chrome Store — not available due to required $5 payment

## How to Use

1. Install the plugin
2. Go to the [Yandex Music site](https://music.yandex.ru/) and click the Yandex Music Controls icon. Or click on the icon and press the button "Open Yandex.Music"

*After installation you will need to refresh your Yandex Music page if it was loaded before install*

## Features

* This plugin provides Music control buttons (Play/Pause, Next, Previous, Like/Unlike) :musical_note:
* and Player information (track and artist name, album art)
* It includes Keyboard Shortcuts
* Integration with OS-level multimedia controls. Which also allows you to use a multimedia keyboard

## Development Usage

1. Run `yarn install` to install all necessary packages
2. Add `sources/manifest.json` as a temporary plugin in `about:debugging`

Do not forget to remove `__MACOSX` and `.DS_Store` from the archive:

```bash
$ zip -d yandex_music_controls-*.zip "*/*.DS_Store"
$ zip -d yandex_music_controls-*.zip "__MACOSX/*"
```

## Translations Testing

1. Go to `about:config`
2. Add `intl.locale.requested` with `en` or `ru` values
3. Restart the browser

## Todo

* Add 'Skip' button to Notifications when [Firefox add this feature](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/notifications/NotificationOptions)
* Reduce Notifications life time when Firefox add this feature
* Add :mute: Mute button
* Auto packager
* Album, Track and Author links — redesign according to the [Photon](https://design.firefox.com/photon/components/links.html)

## Having any troubles or ideas?

Please create an Issue or contact [me by email](mailto:kb@kernel-it.ru).

*Права на отдельные компоненты, составляющие дизайн настоящей программы для ЭВМ «Yandex Music Controls», принадлежат ООО «ЯНДЕКС».*

## Special thanks

* :octocat: [Alexander Marfitsin @marfitsin](http://marfitsin.com) — Text Refactoring
* :octocat: [@idashevskii](https://github.com/idashevskii)
* :octocat: [@PeterMinin](https://github.com/PeterMinin)

## Changelog

### 1.9
* Integration with operating system multimedia controls (global hotkeys!)
  Thanks to [@idashevskii](https://github.com/idashevskii)
* Homepage update
* Upgrade dependencies
* Lint the code and use Github Actions for tests
### 1.8
* Added shortcut to open the plugin (Alt + Z ⊞/ Ctrl + Z )
* Added shortcuts in the plugin window: K, L, P, F, D, +, -
  Thanks to [@PeterMinin](https://github.com/PeterMinin)
* Loader won’t show if you have fast internet connect
* Added Dark theme. Turns on automatically by OS
* Grand Text Refactoring
* Minor code fixes

### 1.7
* Media keys support in Windows and Linux
* Added seeking by hotkeys feature
* Fixed clickable area of control buttons (FF 66+)

### 1.6
* Add optional notifications with track info
* Panel icon indicates player state and like badge now
* Unavailable Next button in Radio bug fix

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
* New features: like/dislike buttons, share buttons (don’t forget to share with your friends!), multiple tabs support
* Improved UI
* It supports not only Russian but also Ukrainian and Belarusian website versions now!
* Also, it uses Yandex Music API in a new version for better performance and stability
* Code improvements

### 1.0.3
* Small bug fixes

### 1.0
* Initial release