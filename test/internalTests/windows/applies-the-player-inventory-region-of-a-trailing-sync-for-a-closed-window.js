const assert = require('assert')

module.exports = (bot, server, done) => {
  const Item = require('prismarine-item')(bot.version)
  const pWindows = require('prismarine-windows')(bot.version)
  // legacy 'minecraft:chest' has a dynamic size resolved from the packet's
  // slotCount (container slots only); the modern equivalent is fixed
  const chestData = pWindows.windows['minecraft:generic_9x3'] ?? { type: 'minecraft:chest', slots: 63 }
  const emptyItems = (n) => Array.from({ length: n }, () => Item.toNotch(null))
  const openWindowPacket = (windowId, winData) => ({
    windowId,
    inventoryType: winData.type,
    windowTitle: bot.test.chatText(''),
    slotCount: winData.slots - 36,
    entityId: 0
  })
  const windowItemsPacket = (windowId, items) => ({
    windowId,
    stateId: 1,
    items,
    carriedItem: Item.toNotch(null)
  })

  const stoneId = bot.registry.itemsByName.stone.id
  // chest slot 30 is in the window's player-inventory region and maps
  // back to inventory slot 12
  const chestSlot = 30
  const invSlot = 12

  server.on('playerJoin', (client) => {
    client.write('login', bot.test.generateLoginPacket())

    bot.once('windowOpen', () => {
      bot.closeWindow(bot.currentWindow)
    })
    client.on('close_window', () => {
      bot.inventory.once(`updateSlot:${invSlot}`, (oldItem, newItem) => {
        assert.strictEqual(newItem?.type, stoneId)
        done()
      })
      const items = emptyItems(chestData.slots)
      items[chestSlot] = Item.toNotch(new Item(stoneId, 5))
      client.write('window_items', windowItemsPacket(1, items))
    })

    client.write('open_window', openWindowPacket(1, chestData))
    client.write('window_items', windowItemsPacket(1, emptyItems(chestData.slots)))
  })
}
