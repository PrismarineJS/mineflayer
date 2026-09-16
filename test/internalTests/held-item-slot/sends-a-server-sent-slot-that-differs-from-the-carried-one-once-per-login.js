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
      const changes = []
      bot.on('heldItemChanged', () => changes.push(bot.quickBarSlot))
      client.write('login', bot.test.generateLoginPacket())
      client.write('held_item_slot', { slot: 3 })
      await sleep(300)
      assert.strictEqual(bot.quickBarSlot, 3)
      assert.deepStrictEqual(sent, [3])
      assert.deepStrictEqual(changes, [3])
      client.write('held_item_slot', { slot: 3 })
      bot.setQuickBarSlot(3)
      await sleep(300)
      assert.deepStrictEqual(sent, [3])
      assert.deepStrictEqual(changes, [3])
      client.write('login', bot.test.generateLoginPacket())
      client.write('held_item_slot', { slot: 3 })
      await sleep(300)
      assert.deepStrictEqual(sent, [3, 3])
      assert.deepStrictEqual(changes, [3])
      client.write('held_item_slot', { slot: 0 })
      await sleep(300)
      assert.strictEqual(bot.quickBarSlot, 0)
      assert.deepStrictEqual(sent, [3, 3, 0])
      assert.deepStrictEqual(changes, [3, 0])
      done()
    } catch (err) {
      done(err)
    }
  })
}
