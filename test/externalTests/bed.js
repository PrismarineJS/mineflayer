const assert = require('assert')

module.exports = () => (bot, done) => {
  const mcData = require('minecraft-data')(bot.version)

  const midnight = 18000
  const bedItem = mcData.itemsArray.find(item => item.name.endsWith('bed'))
  const bedPos1 = bot.entity.position.offset(2, 0, 0).floored()
  const bedPos2 = bedPos1.offset(0, 0, 1)

  assert(bedItem)

  bot.test.callbackChain([
    (cb) => { // Put the bed
      bot.chat(`/time set ${midnight}`)
      if (bot.supportFeature('setBlockUsesMetadataNumber', bot.version)) {
        bot.chat(`/setblock ${bedPos1.toArray().join(' ')} ${bedItem.name} 0`) // Footer
        bot.chat(`/setblock ${bedPos2.toArray().join(' ')} ${bedItem.name} 8`) // Head
      } else {
        bot.chat(`/setblock ${bedPos1.toArray().join(' ')} ${bedItem.name}[part=foot]`)
        bot.chat(`/setblock ${bedPos2.toArray().join(' ')} ${bedItem.name}[part=head]`)
      }
      setTimeout(cb, 1000) // Enough time for the game-time and the block to be updated
    },
    (cb) => { // Sleep
      assert(!bot.isSleeping)
      bot.sleep(bot.blockAt(bedPos1), (err) => {
        assert.ifError(err)
        setTimeout(cb, 500) // Enough time for bot.isSleeping to be updated
      })
    },
    (cb) => { // Wake
      assert(bot.isSleeping)
      bot.wake((err) => {
        assert.ifError(err)
        setTimeout(cb, 500) // Enough time for bot.isSleeping to be updated
      })
    },
    (cb) => {
      assert(!bot.isSleeping)
      cb()
    }
  ], done)
}
