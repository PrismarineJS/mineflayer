const assert = require('assert')

module.exports = () => (bot, done) => {
  const Item = require('prismarine-item')(bot.version)

  const handler = (m) => {
    if (m.translate === 'gameMode.changed') {
      bot.removeListener('message', handler)
      const hungerLoop = () => {
        bot.chat(`/effect ${bot.username} minecraft:hunger 1 255`)
        setTimeout(() => {
          if (bot.food > 0) {
            return hungerLoop()
          }

          consumeLoop()
        }, 1100)
      }

      const consumeLoop = () => {
        bot.consume((err) => {
          assert.strictEqual(err, undefined)
          setTimeout(() => {
            if (bot.food < 20) {
              return consumeLoop()
            }

            done()
          }, 100)
        })
      }

      hungerLoop()
    }
  }

  bot.test.setInventorySlot(36, new Item(297, 5, 0), () => {
    // Cannot consume if bot.food === 20
    bot.consume((err) => {
      assert.notStrictEqual(err, undefined)

      bot.chat('/gamemode survival')
      bot.on('message', handler)
    })
  })
}
