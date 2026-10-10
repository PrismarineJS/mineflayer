const assert = require('assert')
const { once } = require('../../../lib/promise_utils')

module.exports = (bot, server, done) => {
  const Item = require('prismarine-item')(bot.registry)
  server.on('playerJoin', async (client) => {
    await bot.test.pluginsLoaded
    const loggedIn = once(bot, 'login')
    await client.write('login', bot.test.generateLoginPacket())
    await loggedIn
    const writes = []
    bot._client.write = (name, params) => { writes.push(name) }
    bot.quickBarSlot = 0
    bot.activateItem()
    bot.activateItem(true)
    try {
      assert.deepStrictEqual(writes, [])
      assert.strictEqual(bot.usingHeldItem, false)
      bot.inventory.updateSlot(bot.QUICK_BAR_START, new Item(bot.registry.itemsByName.stone.id, 1))
      bot.activateItem()
      assert.deepStrictEqual(writes, [bot.supportFeature('useItemWithOwnPacket') ? 'use_item' : 'block_place'])
      assert.strictEqual(bot.usingHeldItem, true)
      done()
    } catch (err) {
      done(err)
    }
  })
}
