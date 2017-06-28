const assert = require('assert')

module.exports = inject

const chatToBits = {
  enabled: 0,
  commandsOnly: 1,
  disabled: 2
}

const viewDistanceToBits = {
  'far': 12,
  'normal': 10,
  'short': 8,
  'tiny': 6
}

function inject (bot, options) {
  function setSettings (settings) {
    extend(bot.settings, settings)
    const chatBits = chatToBits[bot.settings.chat]
    assert.ok(chatBits != null, `invalid chat setting: ${bot.settings.chat}`)
    const viewDistanceBits = viewDistanceToBits[bot.settings.viewDistance]
    assert.ok(viewDistanceBits != null, `invalid view distance setting: ${bot.settings.viewDistance}`)
    bot.settings.showCape = !!bot.settings.showCape
    bot._client.write('settings', {
      locale: bot.settings.locale || 'en_US',
      viewDistance: viewDistanceBits,
      chatFlags: chatBits,
      chatColors: bot.settings.colorsEnabled,
      skinParts: 255
    })
  }

  bot.settings = {
    chat: options.chat || 'enabled',
    colorsEnabled: options.colorsEnabled == null ? true : options.colorsEnabled,
    viewDistance: options.viewDistance || 'far',
    difficulty: options.difficulty == null ? 2 : options.difficulty,
    showCape: options.showCape == null ? true : !!options.showCape
  }

  bot._client.once('login', () => {
    setSettings({})
  })

  bot.setSettings = setSettings
}

const hasOwn = {}.hasOwnProperty
function extend (obj, src) {
  for (const key in src) {
    if (hasOwn.call(src, key)) obj[key] = src[key]
  }
  return obj
}
