const assert = require('assert')

module.exports = inject

const chatToBits = {
  enabled: 0,
  commandsOnly: 1,
  disabled: 2
}

const viewDistanceToBits = {
  far: 12,
  normal: 10,
  short: 8,
  tiny: 6
}

function inject (bot, options) {
  function setSettings (settings) {
    extend(bot.settings, settings)
    const chatBits = chatToBits[bot.settings.chat]
    assert.ok(chatBits != null, `invalid chat setting: ${bot.settings.chat}`)
    const viewDistanceBits = viewDistanceToBits[bot.settings.viewDistance]
    assert.ok(viewDistanceBits != null, `invalid view distance setting: ${bot.settings.viewDistance}`)
    bot.settings.showCape = !!bot.settings.showCape
    const skinParts = bot.settings.showCape << 0 |
          bot.settings.showJacket << 1 |
          bot.settings.showLeftSleeve << 2 |
          bot.settings.showRightSleeve << 3 |
          bot.settings.showLeftPants << 4 |
          bot.settings.showRightPants << 5 |
          bot.settings.showHat << 6
    bot._client.write('settings', {
      locale: bot.settings.locale || 'en_US',
      viewDistance: viewDistanceBits,
      chatFlags: chatBits,
      chatColors: bot.settings.colorsEnabled,
      skinParts: skinParts
    })
  }

  bot.settings = {
    chat: options.chat || 'enabled',
    colorsEnabled: options.colorsEnabled == null ? true : options.colorsEnabled,
    viewDistance: options.viewDistance || 'far',
    difficulty: options.difficulty == null ? 2 : options.difficulty,
    showCape: options.showCape == null ? true : !!options.showCape,
    showJacket: options.showJacket == null ? true : !!options.showJacket,
    showLeftSleeve: options.showLeftSleeve == null ? true : !!options.showLeftSleeve,
    showRightSleeve: options.showRightSleeve == null ? true : !!options.showRightSleeve,
    showLeftPants: options.showLeftPants == null ? true : !!options.showLeftPants,
    showRightPants: options.showRightPants == null ? true : !!options.showRightPants,
    showHat: options.showHat == null ? true : !!options.showHat
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
