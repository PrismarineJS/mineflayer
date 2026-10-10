const assert = require('assert')

// only on 1.17
module.exports = (bot, server, done) => {
  server.on('playerJoin', async (client) => {
    if (bot.supportFeature('transactionPacketExists')) {
      const transactionPacket = { windowId: 0, action: 42, accepted: false }
      client.once('transaction', (data, meta) => {
        assert.ok(meta.name === 'transaction')
        assert.ok(data.action === 42)
        assert.ok(data.accepted === true)
        done()
      })
      client.write('transaction', transactionPacket)
    } else {
      client.once('pong', (data) => {
        assert(data.id === 42)
        done()
      })
      client.write('ping', { id: 42 })
    }
  })
}
