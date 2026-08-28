const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  await bot.test.becomeCreative()
  await bot.test.clearInventory()
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.snowball.id, 16, 0))
  await bot.test.becomeSurvival()
  await bot.test.wait(250)

  // Throw a snowball and return the velocity the server spawned it with.
  async function throwTowards (yaw) {
    await bot.look(yaw, 0, true)
    await bot.test.wait(250)
    const spawned = onceWithCleanup(bot, 'entitySpawn', { checkCondition: e => /snowball/i.test(e.name), timeout: 5000 })
    bot.activateItem()
    const [snowball] = await spawned
    // The velocity can arrive in its own packet right after the spawn.
    for (let i = 0; i < 40 && snowball.velocity.norm() === 0; i++) await bot.test.wait(50)
    return snowball.velocity
  }

  // yaw PI is notchian 0 (south, +z): the direction a server uses if rotation is dropped.
  const south = await throwTowards(Math.PI)
  assert(south.z > 0 && Math.abs(south.x) < Math.abs(south.z), `expected a southward throw, got ${south}`)

  // yaw 3PI/2 is notchian -90 (east, +x), so this only passes if the bot's rotation reached the server.
  const east = await throwTowards(Math.PI * 3 / 2)
  assert(east.x > 0 && Math.abs(east.z) < Math.abs(east.x), `expected an eastward throw, got ${east}`)

  await bot.test.becomeCreative()
  await bot.test.clearInventory()
}
