const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

// A cooldown on the held item ends its use. Thrown in creative, an ender pearl leaves the stack as it
// was, so only the cooldown can tell the bot it stopped using the pearl.
module.exports = () => async (bot) => {
  if (bot.supportFeature('useItemWithBlockPlace')) return // 1.8 has no item cooldowns
  const Item = require('prismarine-item')(bot.registry)

  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.ender_pearl.id, 16, 0))
  bot.setQuickBarSlot(0)
  await bot.lookAt(bot.entity.position.offset(0, 10, 0), true)

  const cooldown = onceWithCleanup(bot._client, 'set_cooldown', { timeout: 5000 })
  bot.activateItem()
  assert.ok(bot.usingHeldItem)
  await cooldown
  assert.ok(!bot.usingHeldItem)
}
