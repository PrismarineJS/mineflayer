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
      if (bot.supportFeature('setBlockUsesMetadataNumber', bot.version)) {
        bot.chat(`/setblock ${bedPos1.toArray().join(' ')} ${bedItem.name} 0`) // Footer
        bot.chat(`/setblock ${bedPos2.toArray().join(' ')} ${bedItem.name} 8`) // Head
      } else {
        bot.chat(`/setblock ${bedPos1.toArray().join(' ')} ${bedItem.name}[part=foot]`)
        bot.chat(`/setblock ${bedPos2.toArray().join(' ')} ${bedItem.name}[part=head]`)
      }
      bot.chat(`/time set ${midnight}`)
      function shoudlCb () {
        console.log(bot.time.timeOfDay)
        const isNight = bot.time.timeOfDay >= midnight
        const pos1IsBed = bot.blockAt(bedPos1).name.endsWith('bed')
        const pos2IsBed = bot.blockAt(bedPos2).name.endsWith('bed')
        if (isNight && pos1IsBed && pos2IsBed) {
          bot.removeListener('time', shoudlCb)
          cb()
        }
      }
      bot.on('time', shoudlCb)
    },
    (cb) => { // Sleep
      assert(!bot.isSleeping)
      bot.once('sleep', cb)
      bot.sleep(bot.blockAt(bedPos1), (err) => {
        assert.ifError(err)
      })
    },
    (cb) => { // Wake
      assert(bot.isSleeping)
      bot.once('wake', cb)
      bot.wake((err) => {
        assert.ifError(err)
      })
    },
    (cb) => {
      assert(!bot.isSleeping)
      cb()
    }
  ], done)
}
