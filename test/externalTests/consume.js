const assert = require('assert')

module.exports = () => (bot, done) => {
  const Item = require('prismarine-item')(bot.version)
  const mcData = require('minecraft-data')(bot.version)

  bot.test.setInventorySlot(36, new Item(mcData.itemsByName.bread.id, 5, 0), (err) => {
    assert.ifError(err)

    // Cannot consume if bot.food === 20
    bot.consume((err) => {
      assert.notStrictEqual(err, undefined)

      bot.test.becomeSurvival(() => {
        const hungerLoop = () => {
          if (bot.supportFeature('effectAreNotPrefixed')) bot.test.sayEverywhere('/effect give @s hunger 1 255')
          else if (bot.supportFeature('effectAreMinecraftPrefixed')) bot.test.sayEverywhere(`/effect ${bot.username} minecraft:hunger 1 255`)
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
      })
    })
  })
}
