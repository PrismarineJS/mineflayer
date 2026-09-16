const assert = require('assert')

module.exports = (bot, server, done) => {
  const Item = require('prismarine-item')(bot.version)
  const QUICK_BAR_SLOT = 0
  const stoneId = bot.registry.itemsByName.stone.id
  const stoneItem = new Item(stoneId, 1)

  server.on('playerJoin', (client) => {
    client.write('login', bot.test.generateLoginPacket())
    client.write('held_item_slot', { slot: QUICK_BAR_SLOT })

    setTimeout(() => {
      bot.once('heldItemChanged', (newItem) => {
        assert.ok(newItem, 'heldItemChanged should provide the new item')
        assert.strictEqual(newItem.type, stoneId)
        done()
      })
      // Directly call updateSlot on the inventory to simulate
      // the set_player_inventory code path
      bot.inventory.updateSlot(
        QUICK_BAR_SLOT + bot.inventory.hotbarStart,
        stoneItem
      )
    }, 100)
  })
}
