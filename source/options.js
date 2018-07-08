/**
 * Options script for Yandex Music player control.
 * Author Vitalii Rizo
 * http://squirrel-research.ru
 * https://github.com/killbillsbor/ya-music-controls
 * (c) 2016-2018
 * Yandex Music Player Control Plugin
 * v.1.4
 */

'use strict'

const isMac = navigator.platform.indexOf('Mac') > -1
const ctrl = isMac ? 'Cmd' : 'Ctrl'

const format = combination => {
  let output = combination.replace(/\+/g, ' + ')
  if (isMac) output = output.replace('MacCtrl', 'Control')
  output = output.replace('Ctrl', ctrl)
  if (isMac) output = output.replace('Control', 'Ctrl')

  return output
}

const deformat = combination => {
  let output = combination.replace(/ +\+ +/g, '+')
  if (isMac) output = output.replace('Ctrl', 'MacCtrl')
  return output.replace(ctrl, 'Ctrl')
}

const validate = evt => {
  const combination = deformat(evt.target.value)
  const rule1 = new RegExp('^\\s*(Alt|Ctrl|Command|MacCtrl)\\s*\\+' +
    '\\s*(Shift\\s*\\+\\s*)?([A-Z0-9]|Comma|Period|Home|End|PageUp|' +
    'PageDown|Space|Insert|Delete|Up|Down|Left|Right)\\s*$')
  const rule2 = new RegExp('^\\s*((Alt|Ctrl|Command|MacCtrl)\\s*\\+' +
    '\\s*)?(Shift\\s*\\+\\s*)?(F[1-9]|F1[0-2])\\s*$')

  if (rule1.test(combination) || rule2.test(combination)) {
    evt.target.classList.remove('option__input-error')
  } else {
    evt.target.classList.add('option__input-error')
  }
}

const init = () => {
  if (isMac) {
    const cmds = document.querySelectorAll('.mac-only')
    cmds.forEach(elem => {
      elem.style = 'display: inline;'
    })
  }

  updateUI()
}

const updateUI = async function () {
  const commands = await browser.commands.getAll()
  commands.forEach(command => {
    const input = document.getElementById(command.name)
    input.value = format(command.shortcut)
    input.placeholder = format(input.placeholder)
    input.addEventListener('keyup', evt => validate(evt))
  })
}

const updateShortcut = async function () {
  const commands = await browser.commands.getAll()
  commands.forEach(command => {
    const input = document.getElementById(command.name)
    browser.commands.update({
      name: command.name,
      shortcut: deformat(input.value)
    })
  })
}

const resetShortcut = async function () {
  if (confirm('Сбросить настройки горячих клавиш?')) {
    const commands = await browser.commands.getAll()
    commands.forEach(command => {
      browser.commands.reset(command.name)
    })
    updateUI()
  }
}

document.addEventListener('DOMContentLoaded', init)
document.querySelector('#update').addEventListener('click', updateShortcut)
document.querySelector('#reset').addEventListener('click', resetShortcut)
