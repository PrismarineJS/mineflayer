const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // The bed is placed relative to the bot; blockAt cannot see it until the
  // surrounding chunks are loaded.
  await bot.waitForChunksToLoad()
  const midnight = 18000
  const bedItem = bot.registry.itemsArray.find(item => item.name.endsWith('bed'))
  const bedPos1 = bot.entity.position.offset(2, 0, 0).floored()
  const bedPos2 = bedPos1.offset(0, 0, 1)

  assert(bedItem)

  // Put the bed
  if (bot.supportFeature('setBlockUsesMetadataNumber', bot.version)) {
    bot.chat(`/setblock ${bedPos1.toArray().join(' ')} ${bedItem.name} 0`) // Footer
    bot.chat(`/setblock ${bedPos2.toArray().join(' ')} ${bedItem.name} 8`) // Head
  } else {
    bot.chat(`/setblock ${bedPos1.toArray().join(' ')} ${bedItem.name}[part=foot,facing=south]`)
    bot.chat(`/setblock ${bedPos2.toArray().join(' ')} ${bedItem.name}[part=head,facing=south]`)
  }
  bot.chat(`/time set ${midnight}`)
  await once(bot, 'time')
  await bot.test.wait(1000)

  console.log(bot.time.timeOfDay, bot.blockAt(bedPos1).name, bot.blockAt(bedPos2).name)
  const blockAtBed1 = bot.blockAt(bedPos1)
  const blockAtBed2 = bot.blockAt(bedPos2)
  assert(bot.time.timeOfDay >= midnight)
  assert(blockAtBed1?.name?.endsWith('bed'), `Expected ${bedPos1} to be bed, got ${JSON.stringify(blockAtBed1)}`)
  assert(blockAtBed2?.name?.endsWith('bed'), `Expected ${bedPos2} to be bed, got ${JSON.stringify(blockAtBed2)}`)

  // Sleep
  assert(!bot.isSleeping)
  const wakePromise = once(bot, 'wake')
  await bot.sleep(bot.blockAt(bedPos1))

  // Wake
  assert(bot.isSleeping)
  await bot.wake()
  await wakePromise
  assert(!bot.isSleeping)
  // A lone sleeper on a vanilla server skips the night after ~100 ticks and
  // is woken BY THE SERVER — which is what happened on 1.21.11+ before
  // wake() sent the right action, and it made this test pass anyway. A real
  // wake leaves the clock where it was; a night skip resets it to morning.
  await once(bot, 'time')
  assert(bot.time.timeOfDay >= midnight, `bot was woken by the night ending (time ${bot.time.timeOfDay}), not by wake()`)
}
