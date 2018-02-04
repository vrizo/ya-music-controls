# Yandex Music Controls web extension

<img src="/images/logo-hd.png" align="center" height="439" width="450" alt="Music Controls Logo" >

Maintained by [me](https://www.upwork.com/freelancers/~019842b9db9697a094).

Ya.Music Controls plugin let you quickly see what’s currently playing, change the song, and pause or play music without changing a tab.
The plugin adds one icon in your browser's toolbar. By clicking on this icon a pop up box with Music controls appears.

It works perfectly with the latest Firefox and Chrome browsers. 

It is only available in Russian currently :ru:.

## Packaged versions

* [Mozilla Addons](https://addons.mozilla.org/en-US/firefox/addon/yandex-music-controls/)
* Chrome Store - not available due to required $5 payment

## How to use

1. Install the plugin
2. Go to the [Yandex Music site](https://music.yandex.ru/) and click the Ya.Music control icon. Or just click on the icon and press the button "Yandex Music is not opened"

*After installation you will need to refresh your Yandex Music page if it was loaded before install*

## Features

* This plugin provides Music control buttons (Play/Pause, Next, Previous, Like/Unlike buttons) :musical_note:
* and Player information (track and artist name, album art)

## Development usage

1. Run `yarn install` to install all necessary packages
2. Add `sources/manifest.json` as a temporary plugin in `about:debugging`

## Todo

* Add :mute: Mute button
* Auto packager
* Loading indicator

## Having any troubles or ideas?

Please contact [me by email](mailto:kb@kernel-it.ru).

*Права на отдельные компоненты, составляющие дизайн настоящей программы для ЭВМ "Yandex Music Controls", принадлежат ООО «ЯНДЕКС».*

## Changelog

### 1.2

* New features: like, dislike buttons, share buttons (don't forget to share with your friends!), multiple tabs support
* Improved UI
* It supports not only Russian, but also Ukrainian and Belarusian website versions now!
* Also, it uses Yandex Music API in a new version for better performance and stability
* Code improvements

### 1.0.3

* Small bug fixes

### 1.0

* Initial release