const assert = require('assert')
const vec3 = require('vec3')
const { sleep, once } = require('../../../lib/promise_utils')

module.exports = (bot, server, done) => {
  const pos = vec3(1, 65, 1)
  const goldId = 41

  // After a death the reply to the next teleport waits 1.5 s. A teleport that arrives inside
  // that window replaces it: the deferred reply must not go out with the older coordinates.
  const teleport = (teleportId, x, y, z) => ({
    x,
    y,
    z,
    dx: 0,
    dy: 0,
    dz: 0,
    pitch: 0,
    yaw: 0,
    flags: bot.supportFeature('positionPacketHasBitflags') ? {} : 0,
    teleportId
  })
  server.on('playerJoin', async (client) => {
    try {
      await client.write('login', bot.test.generateLoginPacket())
      const chunk = bot.test.buildChunk()
      chunk.setBlockType(pos, goldId)
      await client.write('map_chunk', bot.test.generateChunkPacket(chunk))
      await once(bot, 'chunkColumnLoad')
      const replies = []
      client.on('packet', (data, meta) => {
        if (meta.name === 'position_look') replies.push([data.x, data.y, data.z])
      })
      await client.write('position', teleport(0, 1.5, 80, 1.5))
      while (replies.length === 0) await once(client, 'packet')
      replies.length = 0

      bot.emit('death')
      await client.write('position', teleport(1, 3.5, 80, 3.5))
      await sleep(100)
      await client.write('position', teleport(2, 1.5, 66, 1.5))
      // Outlive the 1.5 s reply delay.
      await sleep(1700)

      assert.deepStrictEqual(replies, [[1.5, 66, 1.5]], `teleport replies: ${JSON.stringify(replies)}`)
      done()
    } catch (err) {
      done(err)
    }
  })
}
