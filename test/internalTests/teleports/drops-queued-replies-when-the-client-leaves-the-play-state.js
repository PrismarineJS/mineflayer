const assert = require('assert')
const vec3 = require('vec3')
const { sleep, once } = require('../../../lib/promise_utils')

module.exports = (bot, server, done) => {
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
      try {
        await new Promise(resolve => bot.once('physicsTick', resolve))
        writes.length = 0
        bot._client.emit('position', { ...teleport, y: 90, teleportId: 1 })
        // Only the transition is simulated; the connection itself stays in play.
        bot._client.emit('state', 'configuration', 'play')
        await sleep(150)
        assert.ok(!writes.includes('position_look'), 'the teleport from the previous play session is not answered')
      } finally {
        bot._client.write = write
      }
      done()
    } catch (err) {
      done(err)
    }
  })
}
