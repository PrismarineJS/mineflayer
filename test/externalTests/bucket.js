const { Vec3 } = require('vec3')
const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  // Fly up a bit so we have room to place water below
  await bot.test.fly(new Vec3(0, 4, 0))

  // Clear the target block to make sure it's air
  const targetPos = bot.entity.position.floored().offset(0, -1, 0)
  await bot.test.setBlock({ x: targetPos.x, y: targetPos.y, z: targetPos.z, blockName: 'air' })

  // Give the bot a water bucket in the hotbar (slot 36 = first hotbar slot)
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.water_bucket.id, 1, 0))
  bot.setQuickBarSlot(0)

  // Look down at the block below us
  await bot.lookAt(targetPos.offset(0.5, 0.5, 0.5), true)

  // Use the water bucket — this triggers activateItem which should send
  // the bot's actual rotation so the server places water where we look
  bot.activateItem()

  // Wait for the block update
  await bot.test.wait(1000)

  // Verify water was placed at the target position
  const block = bot.blockAt(targetPos)
  assert.ok(
    block.name === 'water' || block.name === 'flowing_water',
    `Expected water at ${targetPos}, but got ${block.name}`
  )

  bot.test.sayEverywhere('bucket test: pass')

  // Clean up — replace water with air
  await bot.test.setBlock({ x: targetPos.x, y: targetPos.y, z: targetPos.z, blockName: 'air' })
}
