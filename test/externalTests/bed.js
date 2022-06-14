const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  const mcData = require('minecraft-data')(bot.version)

  const midnight = 18000
  const bedItem = mcData.itemsArray.find(item => item.name.endsWith('bed'))
  const bedPos1 = bot.entity.position.offset(2, 0, 0).floored()
  const bedPos2 = bedPos1.offset(0, 0, 1)

  assert(bedItem)

  // Put the bed
  if (bot.supportFeature('setBlockUsesMetadataNumber', bot.version)) {
    bot.chat(`/setblock ${bedPos1.toArray().join(' ')} ${bedItem.name} 0`) // Footer
    bot.chat(`/setblock ${bedPos2.toArray().join(' ')} ${bedItem.name} 8`) // Head
  } else {
    bot.chat(`/setblock ${bedPos1.toArray().join(' ')} ${bedItem.name}[part=foot]`)
    bot.chat(`/setblock ${bedPos2.toArray().join(' ')} ${bedItem.name}[part=head]`)
  }
  bot.chat(`/time set ${midnight}`)
  await once(bot, 'time')
  await bot.test.wait(1000)

  console.log(bot.time.timeOfDay, bot.blockAt(bedPos1).name, bot.blockAt(bedPos2).name)
  assert(bot.time.timeOfDay >= midnight)
  assert(bot.blockAt(bedPos1).name.endsWith('bed'))
  assert(bot.blockAt(bedPos2).name.endsWith('bed'))

  // Sleep
  assert(!bot.isSleeping)
  await bot.sleep(bot.blockAt(bedPos1))

  // Wake
  assert(bot.isSleeping)
  await bot.wake()
  await once(bot, 'wake')
  assert(!bot.isSleeping)
}
