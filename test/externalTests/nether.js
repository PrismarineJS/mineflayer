const assert = require('assert')
const { onceWithCleanup, sleep } = require('../../lib/promise_utils')
const { Vec3 } = require('vec3')

module.exports = (version) => {
  async function runTest (bot, testFunction) {
    await testFunction(bot)
  }

  const tests = []

  function addTest (name, f) {
    tests[name] = bot => runTest(bot, f)
  }

  addTest('spawn event on death and nether sign', async (bot) => {
    // Test spawn event on death
    const Item = require('prismarine-item')(bot.registry)

    let signItem = null
    for (const name in bot.registry.itemsByName) {
      if (name.includes('sign') && !name.includes('hanging')) signItem = bot.registry.itemsByName[name]
    }
    assert.notStrictEqual(signItem, null, 'Could not find sign item')

    await bot.waitForChunksToLoad()
    bot.test.sayEverywhere('/setblock ~2 ~ ~ nether_portal')
    bot.test.sayEverywhere('/setblock ~2 ~ ~ portal')
    bot.test.sayEverywhere('/tp ~2 ~ ~')
    await onceWithCleanup(bot, 'spawn')

    await bot.test.resetNetherRoofToBedrock()
    bot.test.sayEverywhere('/tp ~ 128 ~')
    await onceWithCleanup(bot, 'forcedMove')
    await bot.waitForChunksToLoad()

    const lowerBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0))
    await bot.lookAt(lowerBlock.position.offset(0.5, 0.5, 0.5), true)

    await bot.test.setInventorySlot(36, new Item(signItem.id, 1, 0))
    bot.placeBlock(lowerBlock, new Vec3(0, 1, 0)).catch(err => assert.rejects(err))

    const [packet] = await onceWithCleanup(bot._client, 'open_sign_entity')

    console.log('[test/nether] Open Sign Packet', packet)
    const sign = bot.blockAt(new Vec3(packet.location.x, packet.location.y, packet.location.z))
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

    // Get back to the overworld
    bot.test.sayEverywhere('/tp ~ 128 ~')
    await onceWithCleanup(bot, 'forcedMove')
    await sleep(1000)
    bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
    bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
    await onceWithCleanup(bot, 'spawn')
    await sleep(1000)
  })

  addTest('nether dimension change event', async (bot) => {
    // Test dimension change event
    const DimensionChangeTimeout = 10000
    bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
    bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
    // Start listening for dimension change event
    const dimensionChange = onceWithCleanup(bot, 'dimensionChange', { timeout: DimensionChangeTimeout })
    await onceWithCleanup(bot, 'spawn')

    const [dimensionName] = await dimensionChange
    assert.equal(dimensionName, 'the_nether')

    // Get back to the overworld
    await bot.test.resetNetherRoofToBedrock()
    bot.test.sayEverywhere('/tp ~ 128 ~')
    await onceWithCleanup(bot, 'forcedMove')
    await sleep(1000)
    bot.test.sayEverywhere('/setblock ~ ~ ~ portal')
    bot.test.sayEverywhere('/setblock ~ ~ ~ nether_portal')
    // Check that the dimension change event is fired again
    const [dimensionName2] = await onceWithCleanup(bot, 'dimensionChange', { timeout: DimensionChangeTimeout })
    assert.equal(dimensionName2, 'overworld')
    await sleep(1000)
  })

  return tests
}
