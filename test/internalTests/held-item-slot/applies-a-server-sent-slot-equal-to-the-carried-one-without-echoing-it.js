const assert = require('assert')
const { sleep } = require('../../../lib/promise_utils')

module.exports = (bot, server, done) => {
  function collectHeldItemSlots (client) {
    const sent = []
    client.on('packet', (data, meta) => {
      if (meta.name === 'held_item_slot') sent.push(data.slotId)
    })
    return sent
  }

  server.on('playerJoin', async (client) => {
    try {
      const sent = collectHeldItemSlots(client)
      client.write('login', bot.test.generateLoginPacket())
      client.write('held_item_slot', { slot: 0 })
      await sleep(300)
      assert.strictEqual(bot.quickBarSlot, 0)
      assert.deepStrictEqual(sent, [])
      bot.setQuickBarSlot(3)
      await sleep(300)
      assert.deepStrictEqual(sent, [3])
      done()
    } catch (err) {
      done(err)
    }
  })
}
