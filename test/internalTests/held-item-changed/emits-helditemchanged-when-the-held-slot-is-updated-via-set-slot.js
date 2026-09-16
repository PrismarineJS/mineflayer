const assert = require('assert')

module.exports = (bot, server, done) => {
  const Item = require('prismarine-item')(bot.version)
  const QUICK_BAR_SLOT = 0
  const HOTBAR_START = 36
  const stoneId = bot.registry.itemsByName.stone.id
  const stoneItem = new Item(stoneId, 1)
  const notchItem = Item.toNotch(stoneItem)

  server.on('playerJoin', (client) => {
    client.write('login', bot.test.generateLoginPacket())
    client.write('held_item_slot', { slot: QUICK_BAR_SLOT })

    // Wait for the held_item_slot to be processed, then listen for the
    // heldItemChanged triggered by the set_slot update to the held slot
    setTimeout(() => {
      bot.once('heldItemChanged', (newItem) => {
        assert.ok(newItem, 'heldItemChanged should provide the new item')
        assert.strictEqual(newItem.type, stoneId)
        done()
      })
      client.write('set_slot', {
        windowId: 0,
        slot: HOTBAR_START + QUICK_BAR_SLOT,
        item: notchItem
      })
    }, 100)
  })
}
