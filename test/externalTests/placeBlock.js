const assert = require('assert')
const { Vec3 } = require('vec3')
const { once } = require('../../lib/promise_utils')

module.exports = () => {
  const tests = []

  function addTest (name, f) {
    tests[name] = f
  }

  // the block the tests place, one block east of the bot's spawn point
  const target = bot => new Vec3(1, bot.test.groundY, 0)

  async function holdDirt (bot) {
    const Item = require('prismarine-item')(bot.registry)
    await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.dirt.id, 1, 0))
  }

  async function expectRefusal (bot, placement, item) {
    const start = Date.now()
    await assert.rejects(placement, new RegExp(`^Error: Server refused to place ${item} at \\(\\d+, -?\\d+, \\d+\\): the block is still air$`))
    assert(Date.now() - start < 2000, `refused placement took ${Date.now() - start}ms to surface`)
  }

  addTest('emits blockPlaced with the old and new block', async (bot) => {
    await holdDirt(bot)
    const placed = once(bot, 'blockPlaced')
    await bot.test.placeBlock(36, target(bot))
    const [oldBlock, newBlock] = await placed
    assert.strictEqual(oldBlock.name, 'air')
    assert.strictEqual(newBlock.name, 'dirt')
    assert(newBlock.position.equals(target(bot)))
    await bot.test.setBlock({ ...target(bot), blockName: 'air' })
  })

  addTest('rejects when an entity is in the way, then works once it is gone', async (bot) => {
    await holdDirt(bot)
    const name = bot.supportFeature('entityNameUpperCaseNoUnderscore') ? 'ArmorStand' : 'armor_stand'
    const { x, y, z } = target(bot)
    const spawned = once(bot, 'entitySpawn')
    bot.chat(`/summon ${name} ${x + 0.5} ${y} ${z + 0.5}`)
    await spawned

    // only the server knows the block is occupied, so the client sends the
    // placement and the refusal has to come from the server's reply
    await expectRefusal(bot, bot.test.placeBlock(36, target(bot)), 'dirt')
    assert.strictEqual(bot.blockAt(target(bot)).name, 'air')

    const gone = once(bot, 'entityGone')
    bot.chat(`/kill @e[type=${name}]`)
    await gone
    await bot.test.placeBlock(36, target(bot))
    assert.strictEqual(bot.blockAt(target(bot)).name, 'dirt')
    await bot.test.setBlock({ ...target(bot), blockName: 'air' })
  })

  addTest('rejects when the held item cannot be placed', async (bot) => {
    const Item = require('prismarine-item')(bot.registry)
    await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.stick.id, 1, 0))
    await expectRefusal(bot, bot.test.placeBlock(36, target(bot)), 'stick')
    assert.strictEqual(bot.blockAt(target(bot)).name, 'air')
  })

  addTest('rejects each refused placement in a row', async (bot) => {
    await holdDirt(bot)
    // the bot cannot place into its own hitbox; a refusal must leave nothing
    // behind that would mis-attribute the next reply
    for (let i = 0; i < 3; i++) {
      await expectRefusal(bot, bot.test.placeBlock(36, bot.entity.position.floored()), 'dirt')
    }
    await bot.test.placeBlock(36, target(bot))
    assert.strictEqual(bot.blockAt(target(bot)).name, 'dirt')
    await bot.test.setBlock({ ...target(bot), blockName: 'air' })
  })

  return tests
}
