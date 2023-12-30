const assert = require('assert')

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.registry)

  await bot.test.becomeCreative()
  await bot.test.clearInventory()
  assert.equal(bot.heldItem, null)

  const stoneId = bot.registry.itemsByName.stone.id
  await bot.test.setInventorySlot(36, new Item(stoneId, 1))
  assert.strictEqual(bot.heldItem.id, bot.stoneId)

  await bot.tossStack(bot.heldItem)
  assert.equal(bot.heldItem, null)
}
