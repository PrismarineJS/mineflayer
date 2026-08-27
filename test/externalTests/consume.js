const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.bread.id, 1, 0))
  await bot.test.becomeSurvival()
  // Cannot consume if bot.food === 20
  await assert.rejects(bot.consume, (err) => {
    if (!err) {
      // log the conditions that made this not throw
      console.log({ a: bot.game.gameMode !== 'creative', b: !['potion', 'milk_bucket', 'enchanted_golden_apple', 'golden_apple'].includes(bot.heldItem.name), c: bot.food === 20 })
    }
    assert.notStrictEqual(err, undefined)
    return true
  })

  await bot.test.becomeSurvival()

  // Drain a little hunger so consuming is legal, waiting on the food update
  // instead of polling on a fixed sleep. One bread is enough to show the
  // consume state transitions; eating back to 20 re-runs the identical path.
  while (bot.food === 20) {
    if (bot.supportFeature('effectAreNotPrefixed')) bot.test.sayEverywhere('/effect give @s hunger 1 255')
    else if (bot.supportFeature('effectAreMinecraftPrefixed')) bot.test.sayEverywhere(`/effect ${bot.username} minecraft:hunger 1 255`)
    await onceWithCleanup(bot, 'health', { timeout: 5000 })
  }

  assert.ok(!bot.usingHeldItem)
  const consume = bot.consume()
  assert.ok(bot.usingHeldItem)
  await consume
  assert.ok(!bot.usingHeldItem)
}
