const assert = require('assert')

// A click sent from a stale model is rejected (pre-1.17) or corrected
// (1.17.1+), and either way the server's reply carries the cursor. The model
// must take it, or every later click sends the wrong cursor.
module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)
  const stoneId = bot.registry.itemsByName.stone.id
  await bot.test.setInventorySlot(36, new Item(stoneId, 1))
  await bot.clickWindow(36, 0, 0)
  assert.strictEqual(bot.inventory.selectedItem?.type, stoneId, 'stone should be on the cursor')

  // Pretend slot 30 holds a dirt the server never gave us, so the click
  // predicts a swap the server does not perform.
  bot.inventory.updateSlot(30, new Item(bot.registry.itemsByName.dirt.id, 1))
  // Pre-1.17 servers report the mismatch as a rejection, which throws.
  await bot.clickWindow(30, 0, 0).catch(() => {})
  // The server's corrections precede the reply to anything sent after the click.
  await bot.test.awaitCommandsProcessed('cursor-synced')

  assert.strictEqual(bot.inventory.selectedItem, null, 'the cursor should be empty like the server\'s')
  assert.strictEqual(bot.inventory.slots[30]?.type, stoneId)
  await bot.moveSlotItem(30, 36)
  assert.strictEqual(bot.inventory.slots[36]?.type, stoneId)
  assert.strictEqual(bot.inventory.slots[30], null)
}
