const assert = require('assert')
const vec3 = require('vec3')
const { sleep, once } = require('../../../lib/promise_utils')

module.exports = function (bot, server, done) {
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
      bot._client.write = (name, params) => { writes.push(name); return write(name, params) }
      let forcedMoves = 0
      const onForcedMove = () => { forcedMoves++ }
      bot.on('forcedMove', onForcedMove)
      try {
        await new Promise(resolve => bot.once('physicsTick', resolve))
        writes.length = 0
        const pings = !bot.supportFeature('transactionPacketExists')
        if (pings) bot._client.emit('ping', { id: 1 })
        bot._client.emit('position', { ...teleport, y: 90, teleportId: 1 })
        bot.emit('respawn')
        await sleep(150)
        assert.ok(!writes.includes('teleport_confirm'), 'the old teleport is not confirmed')
        assert.ok(!writes.includes('position_look'), 'the old teleport is not answered')
        assert.strictEqual(forcedMoves, 0, 'physics is not re-enabled by the old teleport')
        if (pings) assert.ok(writes.includes('pong'), 'the ping is still answered')
      } finally {
        bot._client.write = write
        bot.off('forcedMove', onForcedMove)
      }
      done()
    } catch (err) {
      done(err)
    }
  })
}
