const assert = require('assert')

module.exports = () => (bot, done) => {
  const Item = require('prismarine-item')(bot.version)
  const mcData = require('minecraft-data')(bot.version)

  let grassName

  if (bot.supportFeature('oneBlockForSeveralVariations')) {
    grassName = 'grass'
  } else if (bot.supportFeature('blockSchemeIsFlat')) {
    grassName = 'grass_block'
  }

  bot.test.sayEverywhere('/weather thunder')
  bot.test.sayEverywhere('/fill ~-5 ~-1 ~-5 ~5 ~-1 ~5 water')
  bot.test.setInventorySlot(36, new Item(mcData.itemsByName.fishing_rod.id, 1, 0), (err) => {
    assert.ifError(err)
    bot.lookAt(bot.entity.position, true, () => {
      bot.fish((err) => {
        setTimeout(() => {
          bot.test.sayEverywhere('/fill ~-5 ~-1 ~-5 ~5 ~-1 ~5 ' + grassName)
          assert.strictEqual(err, undefined)
        }, 100)
      })
    })
  })

  function onPlayerCollect (collector, collected) {
    if (collected.type === 'object') {
      bot.test.sayEverywhere('I caught: ' + collected.displayName)
      bot.removeListener('playerCollect', onPlayerCollect)
      done()
    }
  }
  bot.on('playerCollect', onPlayerCollect)
}
