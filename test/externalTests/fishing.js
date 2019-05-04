const assert = require('assert')

module.exports = () => (bot, done) => {
  const Item = require('prismarine-item')(bot.version)

  bot.test.sayEverywhere('/weather thunder')
  bot.test.sayEverywhere('/fill ~-5 ~-1 ~-5 ~5 ~-1 ~5 water')
  bot.test.setInventorySlot(36, new Item(346, 1, 0), () => {
    bot.lookAt(bot.entity.position, true, () => {
      bot.fish((err) => {
        setTimeout(() => {
          bot.test.sayEverywhere('/fill ~-5 ~-1 ~-5 ~5 ~-1 ~5 grass')
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
