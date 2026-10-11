const assert = require('assert')
const { once, onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  const boatName = ['oak_boat', 'boat', 'Boat'].find(name => bot.registry.entitiesByName[name])
  const spawned = onceWithCleanup(bot, 'entitySpawn', { timeout: 5000, checkCondition: (e) => e.name === boatName })
  bot.chat(`/summon ${boatName} ~ ~ ~1`)
  const [boat] = await spawned

  const mounted = once(bot, 'mount')
  bot.mount(boat)
  await mounted
  assert.strictEqual(bot.vehicle, boat)

  const dismounted = onceWithCleanup(bot, 'dismount', { timeout: 5000 })
  await bot.dismount()
  await dismounted
  assert.strictEqual(bot.vehicle, null)
  assert.strictEqual(bot.getControlState('sneak'), false)

  await bot.test.killEntity(boat)
}
