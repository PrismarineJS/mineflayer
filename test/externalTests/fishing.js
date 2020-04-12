const assert = require('assert')

module.exports = () => (bot, done) => {
  if (bot.majorVersion === '1.13') {
    done()
    return
  }

  const Item = require('prismarine-item')(bot.version)
  const mcData = require('minecraft-data')(bot.version)

  let grassName = 'grass'
  if (bot.majorVersion === '1.13') {
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

  bot.on('playerCollect', (collector, collected) => {
    if (collected.kind === 'Drops') {
      done()
    }
  })
}
