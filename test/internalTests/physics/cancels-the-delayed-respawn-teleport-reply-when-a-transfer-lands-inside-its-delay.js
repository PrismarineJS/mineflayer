const assert = require('assert')
const vec3 = require('vec3')
const { sleep, once } = require('../../../lib/promise_utils')

module.exports = function (bot, server, done) {
  const pos = vec3(1, 65, 1)
  const goldId = 41

  // After a death the reply to the respawn teleport is deferred 1.5 s. A proxy transfer that
  // starts inside that window must not make the timer write a play packet in the
  // configuration state.
  if (!bot.supportFeature('hasConfigurationState')) {
    this.skip()
    return
  }
  const positionPacket = {
    x: 1.5,
    y: 80,
    z: 1.5,
    dx: 0,
    dy: 0,
    dz: 0,
    pitch: 0,
    yaw: 0,
    flags: bot.supportFeature('positionPacketHasBitflags') ? {} : 0,
    teleportId: 0
  }
  const movementPackets = ['position', 'position_look', 'look', 'flying']
  const sent = []
  server.on('playerJoin', async (client) => {
    try {
      const originalWrite = bot._client.write.bind(bot._client)
      bot._client.write = (name, params) => {
        if (movementPackets.includes(name)) sent.push(`${name} in ${bot._client.state}`)
        return originalWrite(name, params)
      }

      await client.write('login', bot.test.generateLoginPacket())
      const chunk = bot.test.buildChunk()
      chunk.setBlockType(pos, goldId)
      await client.write('map_chunk', bot.test.generateChunkPacket(chunk))
      await once(bot, 'chunkColumnLoad')
      const p1 = once(bot, 'forcedMove')
      await client.write('position', positionPacket)
      await p1

      bot.emit('death')
      sent.length = 0
      await client.write('position', { ...positionPacket, teleportId: 1 })
      await sleep(100)
      await client.write('start_configuration', {})
      if (bot._client.state !== 'configuration') {
        await once(bot._client, 'state')
      }
      // Outlive the 1.5 s reply delay.
      await sleep(1700)

      assert.deepStrictEqual(sent, [], `movement packets written after the transfer began: ${sent.join(', ')}`)
      done()
    } catch (err) {
      done(err)
    }
  })
}
