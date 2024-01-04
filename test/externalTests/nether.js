const assert = require('assert')
const { once } = require('events')
const { onceWithCleanup, sleep } = require('../../lib/promise_utils')
const Vec3Parser = require('vec3')
const { Vec3 } = require('vec3')

module.exports = (version) => {
  async function runTest (bot, testFunction) {
    await testFunction(bot)
  }

  const tests = []

  function addTest (name, f) {
    tests[name] = bot => runTest(bot, f)
  }

  const netherPortalLocation = { x: 2, y: 128, z: 0 }

  addTest('spawn event on death and nether sign', async (bot) => {
    // Test spawn event on death
    const Item = require('prismarine-item')(bot.registry)

    let signItem = null
    for (const name in bot.registry.itemsByName) {
      if (name.includes('sign') && !name.includes('hanging')) signItem = bot.registry.itemsByName[name]
    }
    assert.notStrictEqual(signItem, null, 'Could not find sign item')

    await bot.waitForChunksToLoad()
    await sleep(1000)
    bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
    bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
    const forcedMoved = onceWithCleanup(bot, 'forcedMove', { timeout: 5000 })
    await once(bot, 'spawn')
    bot.test.sayEverywhere('/tp 0 128 0')

    await forcedMoved
    await bot.waitForChunksToLoad()
    await sleep(1000)

    const lowerBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
    await bot.lookAt(lowerBlock.position.offset(0.5, 0.5, 0.5), true)

    await bot.test.setInventorySlot(36, new Item(signItem.id, 1, 0))
    await bot.placeBlock(lowerBlock, new Vec3(0, 1, 0))

    const [packet] = await onceWithCleanup(bot._client, 'open_sign_entity')

    const sign = bot.blockAt(Vec3Parser(packet.location))
    bot.updateSign(sign, '1\n2\n3\n')

    await sleep(500)
    // Get updated sign
    const newSign = bot.blockAt(bot.entity.position)

    assert.strictEqual(newSign.signText.trimEnd(), '1\n2\n3')

    if (newSign.blockEntity) {
      // Check block update
      bot.activateBlock(newSign)
      assert.notStrictEqual(newSign.blockEntity, undefined)
    }

    bot.test.sayEverywhere(`/tp ${netherPortalLocation.x} ${netherPortalLocation.y} ${netherPortalLocation.z}`)
    bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
    bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
    await onceWithCleanup(bot, 'spawn')
    await sleep(1000)
  })

  addTest('dimension change event', async (bot) => {
    // Test dimension change event
    const DimensionChangeTimeout = 10000
    bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
    bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
    // Start listening for dimension change event
    const dimensionChange = onceWithCleanup(bot, 'dimensionChange', { timeout: DimensionChangeTimeout })
    await once(bot, 'spawn')
    bot.test.sayEverywhere('/tp 0 129 0')

    const [dimensionName] = await dimensionChange
    assert.equal(dimensionName, 'the_nether')
    await bot.waitForChunksToLoad()

    await sleep(1000)

    bot.test.sayEverywhere(`/tp ${netherPortalLocation.x} ${netherPortalLocation.y} ${netherPortalLocation.z}`)
    bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
    bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
    // Check that the dimension change event is fired again
    const [dimensionName2] = await onceWithCleanup(bot, 'dimensionChange', { timeout: DimensionChangeTimeout })
    assert.equal(dimensionName2, 'overworld')
    await sleep(1000)
  })

  return tests
}
