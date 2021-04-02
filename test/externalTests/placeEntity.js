const assert = require('assert')
const { once } = require('events')
const { Vec3 } = require('vec3')

module.exports = (version) => {
  const mcData = require('minecraft-data')(version)
  async function runTest (bot, testFunction) {
    await testFunction(bot)
  }

  const tests = []

  function addTest (name, f) {
    tests[name] = bot => runTest(bot, f)
  }

  addTest('place crystal', async (bot) => {
    if (!mcData?.itemsByName?.end_crystal?.id) return // unsupported

    bot.chat('/setblock ~ ~ ~1 minecraft:obsidian')
    const p = once(bot.inventory, 'updateSlot')
    bot.chat(`/give ${bot.username} end_crystal`)
    await p // await getting the end crystal
    const crystal = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, 0, 1)), new Vec3(0, 1, 0))
    assert(crystal !== null)
    let crystalName = 'EnderCrystal'
    if (bot.supportFeature('enderCrystalNameEndsInEr')) {
      crystalName = 'ender_crystal'
    } else if (bot.supportFeature('enderCrystalNameNoCapsNoUnderscore')) {
      crystalName = 'endercrystal'
    } else if (bot.supportFeature('enderCrystalNameNoCapsWithUnderscore')) {
      crystalName = 'end_crystal'
    }
    const entity = bot.nearestEntity(o => o.name === crystalName)
    assert(entity?.name === crystalName)
  })

  //   addTest('place boat', async (bot) => {
  //     // far 3 blocks
  //     bot.chat('/setblock ~-1 ~-1 ~-2 water')
  //     bot.chat('/setblock ~ ~-1 ~-2 water')
  //     bot.chat('/setblock ~1 ~-1 ~-2 water')
  //     // close 3 blocks
  //     bot.chat('/setblock ~-1 ~-1 ~-1 water')
  //     bot.chat('/setblock ~ ~-1 ~-1 water')
  //     bot.chat('/setblock ~1 ~-1 ~-1 water')

  //     const p = once(bot.inventory, 'updateSlot')
  //     bot.chat(`/give ${bot.username} ${mcData?.itemsByName?.oak_boat ? 'oak_boat' : 'boat'}`)
  //     await p // await getting the end crystal
  //     const boat = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, -1, -2)), new Vec3(0, 1, 0))
  //     assert(boat !== null)

  //     const entity = bot.nearestEntity(o => o.name === 'boat')
  //     assert(entity?.name === 'boat')
  //   })

  return tests
}
