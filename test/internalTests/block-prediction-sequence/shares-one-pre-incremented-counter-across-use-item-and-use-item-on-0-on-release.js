const assert = require('assert')
const vec3 = require('vec3')
const { once } = require('../../../lib/promise_utils')

module.exports = function (bot, server, done) {
  const Item = require('prismarine-item')(bot.registry)
  const useItemFields = bot.registry.protocol?.play?.toServer?.types?.packet_use_item?.[1]
  if (!useItemFields?.some(f => f.name === 'sequence')) {
    this.skip()
    return
  }
  server.on('playerJoin', async (client) => {
    await bot.test.pluginsLoaded
    const loggedIn = once(bot, 'login')
    await client.write('login', bot.test.generateLoginPacket())
    await loggedIn
    const writes = []
    bot._client.write = (name, params) => { writes.push([name, params.sequence]) }
    bot.quickBarSlot = 0
    bot.inventory.updateSlot(bot.QUICK_BAR_START, new Item(bot.registry.itemsByName.stone.id, 1))

    bot.activateItem()
    bot.deactivateItem()
    await bot._genericPlace({ position: vec3(1, 65, 1) }, vec3(0, 1, 0), { forceLook: 'ignore' })
    bot.activateItem()

    try {
      assert.deepStrictEqual(writes, [
        ['use_item', 1],
        ['block_dig', 0],
        ['block_place', 2],
        ['use_item', 3]
      ])
      done()
    } catch (err) {
      done(err)
    }
  })
}
