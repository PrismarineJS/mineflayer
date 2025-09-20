const assert = require('assert')

module.exports = () => async (bot) => {
  // Test that activateItem works without throwing errors
  // This reproduces the issue where activateItem fails on 1.21+ due to packet format changes

  const Item = require('prismarine-item')(bot.registry)

  // Set up an item that can be activated
  await bot.test.setInventorySlot(36, new Item(bot.registry.itemsByName.bread.id, 1, 0))
  await bot.test.becomeSurvival()

  // Test that activateItem works and doesn't throw errors
  assert.ok(!bot.usingHeldItem, 'Should not be using item initially')

  // This should work on all versions including 1.21+
  await assert.doesNotReject(async () => {
    bot.activateItem()
    await bot.test.wait(100)
  }, 'activateItem should not throw errors')

  // Verify the item activation state was set correctly
  assert.ok(bot.usingHeldItem, 'Should be using item after activateItem')
}
