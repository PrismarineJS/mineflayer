const assert = require('assert')
const { onceWithCleanup } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  await bot.test.becomeCreative()
  await bot.test.clearInventory()
  await bot.test.wait(100)

  // Give the bot a stone in the held slot (slot 36 = first hotbar slot)
  const stoneId = bot.registry.itemsByName.stone.id
  const diamondId = bot.registry.itemsByName.diamond.id

  // Put stone in the current held slot
  await bot.test.setInventorySlot(bot.quickBarSlot + bot.inventory.hotbarStart, new (require('prismarine-item')(bot.registry))(stoneId, 1))
  await bot.test.wait(100)
  assert.strictEqual(bot.heldItem.type, stoneId, 'should be holding stone')

  // Now change the held slot contents to diamond and verify heldItemChanged fires
  const heldItemPromise = onceWithCleanup(bot, 'heldItemChanged', {
    timeout: 5000
  })
  await bot.test.setInventorySlot(bot.quickBarSlot + bot.inventory.hotbarStart, new (require('prismarine-item')(bot.registry))(diamondId, 1))

  const [newItem] = await heldItemPromise
  assert(newItem, 'heldItemChanged should fire with the new item')
  assert.strictEqual(newItem.type, diamondId, 'new item should be diamond')
  assert.strictEqual(bot.heldItem.type, diamondId, 'bot.heldItem should reflect diamond')
}
