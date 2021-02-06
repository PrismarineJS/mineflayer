const assert = require('assert')
const SLOT = 36

module.exports = () => async (bot) => {
  const Item = require('prismarine-item')(bot.version)

  const item1 = new Item(1, 1, 0)
  const item2 = new Item(2, 1, 0)

  const cb = bot.creative.setInventorySlot(SLOT, item2)
  await assert.rejects(async () => {
    await bot.creative.setInventorySlot(SLOT, item1)
  }, (err) => {
    assert.ok(err instanceof Error, 'The error has not been passed')
    assert.ok(bot.inventory.slots[SLOT] == null)
    return true
  })
  await cb
  assert.ok(bot.inventory.slots[SLOT] != null)
  assert.ok(bot.inventory.slots[SLOT].type === item2.type)
}
