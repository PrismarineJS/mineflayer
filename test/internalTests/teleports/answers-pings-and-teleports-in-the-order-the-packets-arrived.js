const assert = require('assert')
const vec3 = require('vec3')
const { once } = require('../../../lib/promise_utils')

module.exports = function (bot, server, done) {
  if (bot.supportFeature('transactionPacketExists')) {
    this.skip()
    return
  }
  server.on('playerJoin', async (client) => {
    try {
      client.write('login', bot.test.generateLoginPacket())
      const chunk = bot.test.buildChunk()
      chunk.setBlockType(vec3(1, 65, 1), bot.registry.blocksByName.stone.id)
      client.write('map_chunk', bot.test.generateChunkPacket(chunk))
      await once(bot, 'chunkColumnLoad')
      const teleport = {
        x: 1.5,
        y: 80,
        z: 1.5,
        dx: 0,
        dy: 0,
        dz: 0,
        pitch: 0,
        yaw: 0,
        flags: bot.supportFeature('positionPacketHasBitflags') ? { x: false, y: false, z: false, yaw: false, pitch: false } : 0,
        teleportId: 0
      }
      client.write('position', teleport)
      await once(bot, 'forcedMove')

      const writes = []
      const write = bot._client.write.bind(bot._client)
      bot._client.write = (name, params) => { writes.push({ name, params }); return write(name, params) }
      try {
        await new Promise(resolve => bot.once('physicsTick', resolve))
        writes.length = 0
        // Between two ticks the server's ping, teleport and second ping arrive in that order.
        bot._client.emit('ping', { id: 1 })
        bot._client.emit('position', { ...teleport, y: 90, teleportId: 1 })
        bot._client.emit('ping', { id: 2 })
        assert.deepStrictEqual(writes, [], 'nothing is answered from inside the packet handlers')
        await once(bot, 'forcedMove')
        const replies = writes
          .filter(w => ['pong', 'teleport_confirm', 'position_look'].includes(w.name))
          .map(w => (w.name === 'pong' ? `pong ${w.params.id}` : w.name))
        assert.deepStrictEqual(replies, ['pong 1', 'teleport_confirm', 'position_look', 'pong 2'])
      } finally {
        bot._client.write = write
      }
      done()
    } catch (err) {
      done(err)
    }
  })
}
