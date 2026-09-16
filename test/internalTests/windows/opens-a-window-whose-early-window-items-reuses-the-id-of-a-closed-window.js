const assert = require('assert')

module.exports = (bot, server, done) => {
  const Item = require('prismarine-item')(bot.version)
  const pWindows = require('prismarine-windows')(bot.version)
  // legacy 'minecraft:chest' has a dynamic size resolved from the packet's
  // slotCount (container slots only); the modern equivalent is fixed
  const chestData = pWindows.windows['minecraft:generic_9x3'] ?? { type: 'minecraft:chest', slots: 63 }
  const merchantData = pWindows.windows['minecraft:merchant'] ?? pWindows.windows['minecraft:villager']
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

  const emeraldId = bot.registry.itemsByName.emerald.id

  server.on('playerJoin', (client) => {
    client.write('login', bot.test.generateLoginPacket())

    bot.once('windowOpen', () => {
      bot.closeWindow(bot.currentWindow)
    })
    client.on('close_window', () => {
      bot.once('windowOpen', (window) => {
        assert.strictEqual(window.type, merchantData.key)
        assert.strictEqual(window.slots[0]?.type, emeraldId)
        done()
      })
      // a villager window sends its contents before open_window, and
      // reuses the chest's id when a respawn reset the server's window
      // id counter in between
      const items = emptyItems(merchantData.slots)
      items[0] = Item.toNotch(new Item(emeraldId, 3))
      client.write('window_items', windowItemsPacket(1, items))
      client.write('open_window', openWindowPacket(1, merchantData))
    })

    client.write('open_window', openWindowPacket(1, chestData))
    client.write('window_items', windowItemsPacket(1, emptyItems(chestData.slots)))
  })
}
