const assert = require('assert')

module.exports = () => async (bot) => {
  // don't continue unless this version supports elytra
  if (!bot.supportFeature('hasElytraFlying')) return
  const supportsFireworkRockets = bot.supportFeature('fireworkNamePlural') || bot.supportFeature('fireworkNameSingular')

  const Item = require('prismarine-item')(bot.registry)

  await bot.test.setInventorySlot(6, new Item(bot.registry.itemsByName.elytra.id, 1))
  if (supportsFireworkRockets) {
    const fireworkItem = bot.registry.itemsArray.find(item => item.displayName === 'Firework Rocket')
    assert.ok(fireworkItem !== undefined)
    await bot.test.setInventorySlot(36, new Item(fireworkItem.id, 64))
  }
  await bot.test.teleport(bot.entity.position.offset(0, 100, 0))
  await bot.test.becomeSurvival()
  await bot.creative.stopFlying()

  await bot.look(bot.entity.yaw, 0)
  await bot.waitForTicks(5)
  await assert.doesNotReject(bot.elytraFly())
  await bot.waitForTicks(20) // wait for server to accept
  assert.ok(bot.entity.elytraFlying)

  if (!supportsFireworkRockets) return

  // use rocket
  await bot.look(bot.entity.yaw, 30 * Math.PI / 180)
  const activationTicks = 20
  for (let i = 0; i < 20; i++) {
    bot.activateItem()
    assert.ok(bot.entity.elytraFlying)
    await bot.waitForTicks(1)
  }
  await bot.waitForTicks(3)
  let lateActivations = 0
  assert.ok(bot.fireworkRocketDuration > 0)
  for (let i = bot.fireworkRocketDuration; i > 0; --i) {
    await bot.waitForTicks(1)
    assert.ok(bot.entity.elytraFlying)
    if (bot.fireworkRocketDuration > i) {
      i = bot.fireworkRocketDuration
      ++lateActivations
    }
    assert.ok(lateActivations <= activationTicks)
  }
  assert.ok(bot.fireworkRocketDuration === 0)
}
