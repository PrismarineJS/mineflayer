const { Vec3 } = require('vec3')
const { once, onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  // Place a dirt block for the bot to dig
  await bot.test.becomeCreative()
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.dirt.id, 1, 0))
  await bot.test.fly(new Vec3(0, 2, 0))
  await bot.test.placeBlock(36, bot.entity.position.plus(new Vec3(0, -2, 0)))
  await bot.test.clearInventory()

  // Give the bot a wooden pickaxe so digging takes long enough to interrupt
  const pickName = bot.registry.itemsByName.wooden_pickaxe ? 'wooden_pickaxe' : 'wood_pickaxe'
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName[pickName].id, 1, 0))

  // Switch to survival and fall to the ground
  await bot.creative.stopFlying()
  await onceWithCleanup(bot, 'move', {
    timeout: 5000,
    checkCondition: () => bot.entity.onGround
  })
  await bot.test.becomeSurvival()

  // Start digging the dirt block beneath us (don't await -- we want to interrupt it)
  const blockPos = bot.entity.position.floored().plus(new Vec3(0, -1, 0))
  const block = bot.blockAt(blockPos)
  const digPromise = bot.dig(block).catch(() => {
    // Digging will fail because we die mid-dig; that's expected
  })

  // Wait a tick so digging actually starts, then kill the bot
  await bot.test.wait(50)

  const deathPromise = onceWithCleanup(bot, 'death', { timeout: 10000 })
  bot.test.selfKill()

  // Verify death event fires (the bug would crash before reaching here)
  await deathPromise

  // Wait for the dig promise to settle
  await digPromise

  // Respawn and verify the bot is alive
  await once(bot, 'spawn')

  bot.test.sayEverywhere('digging death test: pass')
}
