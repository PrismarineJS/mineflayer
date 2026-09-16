const assert = require('assert')
const nbt = require('prismarine-nbt')
const { once } = require('../../../lib/promise_utils')

module.exports = async (bot, server) => {
  const Item = require('prismarine-item')(bot.registry)
  // A component title plus the bare-string form third-party servers send.
  const titles = bot.registry.supportFeature('chatPacketsUseNbtComponents')
    ? [nbt.comp({ text: nbt.string('Test Chest') }), nbt.string('Test Chest')]
    : [JSON.stringify({ text: 'Test Chest' }), 'Test Chest']
  const chest = bot.registry.supportFeature('village&pillageInventoryWindows')
    ? { inventoryType: 2 }
    : { inventoryType: 'minecraft:chest', slotCount: 27 }
  const [client] = await once(server, 'playerJoin')
  client.write('login', bot.test.generateLoginPacket())
  for (const [i, windowTitle] of titles.entries()) {
    const windowId = i + 1
    client.write('open_window', { windowId, windowTitle, ...chest })
    client.write('window_items', { windowId, stateId: 0, items: [], carriedItem: Item.toNotch(null) })
    const [window] = await once(bot, 'windowOpen')
    assert.strictEqual(window.id, windowId)
    assert.strictEqual(window.title.constructor.name, 'ChatMessage')
    assert.strictEqual(window.title.toString(), 'Test Chest')
  }
}
