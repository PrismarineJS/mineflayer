const assert = require('assert')
const SLOT = 36

module.exports = () => (bot, done) => {
  const Item = require('prismarine-item')(bot.version)

  const item1 = new Item(1, 1, 0)
  const item2 = new Item(2, 1, 0)

  let firstCallbackFired = false

  bot.creative.setInventorySlot(SLOT, item2, (err) => {
    assert.ifError(err)
    assert.ok(bot.inventory.slots[SLOT] != null)
    assert.ok(bot.inventory.slots[SLOT].type === item2.type)
    assert.ok(firstCallbackFired)

    done()
  })

  bot.creative.setInventorySlot(SLOT, item1, (err) => {
    assert.ok(err instanceof Error, 'The error has not been passed')
    assert.ok(bot.inventory.slots[SLOT] == null)
    firstCallbackFired = true
  })
}
