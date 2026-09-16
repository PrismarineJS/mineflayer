const assert = require('assert')
const { sleep, once, onceWithCleanup } = require('../../../lib/promise_utils')

module.exports = function (bot, server, done) {
  if (bot.supportFeature('transactionPacketExists')) {
    this.skip()
    return
  }
  server.on('playerJoin', async (client) => {
    try {
      client.write('login', bot.test.generateLoginPacket())
      await once(bot, 'login')
      const pongs = []
      client.on('pong', (data) => pongs.push(data))
      const pingedAt = Date.now()
      client.write('ping', { id: 123 })
      const [pong] = await onceWithCleanup(client, 'pong', { timeout: 200 })
      const pongedAt = Date.now()
      assert.strictEqual(pong.id, 123)
      assert.ok(pongedAt - pingedAt <= 200, `pong took ${pongedAt - pingedAt} ms`)
      await sleep(100)
      assert.strictEqual(pongs.length, 1, 'each ping is answered exactly once')
      done()
    } catch (err) {
      done(err)
    }
  })
}
