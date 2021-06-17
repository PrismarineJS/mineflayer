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

    bot.chat('/setblock ~ ~ ~1 obsidian')
    const p = once(bot.inventory, 'updateSlot')
    bot.chat(`/give ${bot.username} end_crystal`)
    await p // await getting the end crystal
    const crystal = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, 0, 1)), new Vec3(0, 1, 0))
    assert(crystal !== null)
    let name = 'EnderCrystal'
    if (bot.supportFeature('enderCrystalNameEndsInErNoCaps')) {
      name = 'ender_crystal'
    } else if (bot.supportFeature('enderCrystalNameNoCapsNoUnderscore')) {
      name = 'endercrystal'
    } else if (bot.supportFeature('enderCrystalNameNoCapsWithUnderscore')) {
      name = 'end_crystal'
    }
    const entity = bot.nearestEntity(o => o.name === name)
    assert(entity?.name === name)

    bot.chat(`kill @e[type=!player]`)
    bot.chat('/setblock ~ ~ ~1 air')
  })

  addTest('place boat', async (bot) => {
    /* Block Placement (o = water)
      ooo
      obo (b = water where we place the boat)
      ooo
    */
    for (let z = -1; z >= -3; z--) {
      const y = -1
      for (let x = -1; x <= 1; x++) {
        bot.chat(`/setblock ~${x} ~${y} ~${z} water`)
      }
    }
    const p = once(bot.inventory, 'updateSlot')
    bot.chat(`/give ${bot.username} ${mcData?.itemsByName?.oak_boat ? 'oak_boat' : 'boat'}`)
    await p // await getting the boat
    const boat = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, -1, -2)), new Vec3(0, -1, 0))
    assert(boat !== null)
    let boatName = 'boat'
    if (bot.supportFeature('boatNameIsCaps')) {
      boatName = 'Boat'
    }
    const entity = bot.nearestEntity(o => o.name === boatName)
    assert(entity?.name === boatName)
    bot.chat(`kill @e[type=!player]`)
  })

  // addTest('place summon egg', async (bot) => {
  //   let command
  //   if (mcData.isOlderThan('1.9')) {
  //     command = '/give @p spawn_egg 1 54' // 1.8
  //   } else if (mcData.isOlderThan('1.11')) {
  //     command = '/give @p spawn_egg 1 0 {EntityTag:{id:Zombie}}' // 1.9 / 1.10
  //   } else if (mcData.isOlderThan('1.12')) {
  //     command = '/give @p spawn_egg 1 0 {EntityTag:{id:minecraft:zombie}}' // 1.11
  //   } else if (mcData.isOlderThan('1.13')) {
  //     command = '/give @p spawn_egg 1 0 {EntityTag:{id:zombie}}' // 1.12
  //   } else {
  //     command = '/give @p zombie_spawn_egg 1' // >1.12
  //   }
  //   const p = once(bot.inventory, 'updateSlot')
  //   bot.chat(command)
  //   await p // await getting the spawn egg
  //   const zombie = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, 0, 1)), new Vec3(0, 1, 0))
  //   assert(zombie !== null)
  //   const name = mcData.isNewerOrEqualTo('1.11') ? 'zombie' : 'Zombie'
  //   const entity = bot.nearestEntity(o => o.name === name)
  //   assert(entity?.name === name)
  //   bot.chat(`kill @e[type=!player]`)
  // })

  // addTest('place armor stand', async (bot) => {

  // })

  return tests
}
