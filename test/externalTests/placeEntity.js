const assert = require('assert')
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
    await bot.test.setBlock({ z: 1, relative: true, blockName: 'obsidian' })
    await bot.test.awaitItemRecieved(`/give ${bot.username} end_crystal`)
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
    bot.attack(entity)
    await bot.test.setBlock({ z: 1, blockName: 'air', relative: true })
  })

  addTest('place boat', async (bot) => {
    async function placeBlocksForTest (blockName) {
      for (let z = -1; z >= -3; z--) {
        const y = -1
        for (let x = -1; x <= 1; x++) {
          await bot.test.setBlock({ x, y, z, blockName, relative: true })
        }
      }
    }

    await placeBlocksForTest('water')
    await bot.test.awaitItemRecieved(`/give ${bot.username} ${mcData?.itemsByName?.oak_boat ? 'oak_boat' : 'boat'}`)
    const boat = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, -1, -2)), new Vec3(0, -1, 0))
    assert(boat !== null)
    const name = bot.supportFeature('entityNameUpperCaseNoUnderscore') ? 'Boat' : 'boat'
    const entity = bot.nearestEntity(o => o.name === name)
    assert(entity?.name === name)
    await placeBlocksForTest('air')
    bot.attack(entity)
  })

  addTest('place summon egg', async (bot) => {
    let command
    if (mcData.isOlderThan('1.9')) {
      command = '/give @p spawn_egg 1 54' // 1.8
    } else if (mcData.isOlderThan('1.11')) {
      command = '/give @p spawn_egg 1 0 {EntityTag:{id:Zombie}}' // 1.9 / 1.10
    } else if (mcData.isOlderThan('1.12')) {
      command = '/give @p spawn_egg 1 0 {EntityTag:{id:minecraft:zombie}}' // 1.11
    } else if (mcData.isOlderThan('1.13')) {
      command = '/give @p spawn_egg 1 0 {EntityTag:{id:zombie}}' // 1.12
    } else {
      command = '/give @p zombie_spawn_egg 1' // >1.12
    }
    await bot.test.awaitItemRecieved(command)
    const zombie = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, 0, 1)), new Vec3(0, 1, 0))
    assert(zombie !== null)
    const name = bot.supportFeature('entityNameUpperCaseNoUnderscore') ? 'Zombie' : 'zombie'
    const entity = bot.nearestEntity(o => o.name === name)
    assert(entity?.name === name)
    bot.chat(`/kill @e[type=${name}]`) // use /kill instead of bot.attack() because it takes more than one hit to kill
  })

  addTest('place armor stand', async (bot) => {
    await bot.test.awaitItemRecieved(`/give ${bot.username} armor_stand`)
    const zombie = await bot.placeEntity(bot.blockAt(bot.entity.position.offset(0, 0, 1)), new Vec3(0, 1, 0))
    assert(zombie !== null)
    const name = bot.supportFeature('entityNameUpperCaseNoUnderscore') ? 'ArmorStand' : 'armor_stand'
    const entity = bot.nearestEntity(o => o.name === name)
    assert(entity?.name === name)
    bot.chat(`/kill @e[type=${name}]`) // use /kill instead of bot.attack() because it takes more than one hit to kill
  })

  return tests
}
