const { Vec3 } = require('vec3')
const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)
  const groundY = bot.test.groundY

  // Place a solid block at a known position to act as the surface
  const solidPos = new Vec3(2, groundY, 2)
  const waterPos = new Vec3(2, groundY + 1, 2)

  await bot.test.setBlock({ x: solidPos.x, y: solidPos.y, z: solidPos.z, blockName: 'stone' })
  // Make sure the block above is air
  await bot.test.setBlock({ x: waterPos.x, y: waterPos.y, z: waterPos.z, blockName: 'air' })

  // Fly to a position near the target so we can look at it
  await bot.test.fly(new Vec3(2, 2, 0))

  // Give the bot a water bucket
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.water_bucket.id, 1, 0))
  bot.setQuickBarSlot(0)

  // Look at the top face of the solid block (water will be placed on top)
  await bot.lookAt(solidPos.offset(0.5, 1, 0.5), true)

  // Listen for the block update at the water position before activating
  const blockUpdatePromise = onceWithCleanup(bot.world, `blockUpdate:(${waterPos.x}, ${waterPos.y}, ${waterPos.z})`, { timeout: 5000 })

  // Use the water bucket
  bot.activateItem()

  // Wait for the server to acknowledge the block change
  await blockUpdatePromise

  // Verify water was placed
  const block = bot.blockAt(waterPos)
  assert.ok(
    block.name === 'water' || block.name === 'flowing_water',
    `Expected water at ${waterPos}, but got ${block.name}`
  )

  bot.test.sayEverywhere('bucket test: pass')

  // Clean up
  await bot.test.setBlock({ x: waterPos.x, y: waterPos.y, z: waterPos.z, blockName: 'air' })
  await bot.test.setBlock({ x: solidPos.x, y: solidPos.y, z: solidPos.z, blockName: 'air' })
}
