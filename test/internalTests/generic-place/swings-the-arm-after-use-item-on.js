const assert = require('assert')
const vec3 = require('vec3')
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
    bot.inventory.updateSlot(bot.QUICK_BAR_START, new Item(bot.registry.itemsByName.stone.id, 1))
    await bot._genericPlace({ position: vec3(1, 65, 1) }, vec3(0, 1, 0), { forceLook: 'ignore', swingArm: 'right' })
    try {
      assert.deepStrictEqual(writes, ['block_place', 'arm_animation'])
      done()
    } catch (err) {
      done(err)
    }
  })
}
