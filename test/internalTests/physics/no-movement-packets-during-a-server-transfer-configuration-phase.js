const assert = require('assert')
const vec3 = require('vec3')
const { sleep, once } = require('../../../lib/promise_utils')

module.exports = function (bot, server, done) {
  const pos = vec3(1, 65, 1)
  const goldId = 41

  // Regression test for https://github.com/PrismarineJS/mineflayer/issues/3776
  // While the client is in the configuration phase (Velocity/BungeeCord server
  // transfer), sending play-state movement packets gets the bot kicked.
  // NOTE: the mock server's client.on('packet') cannot be used here, because
  // the server-side mock connection stays in the play state while only the
  // bot's client transitions to configuration — outbound movement packets then
  // fail to deserialize on the mock server and are silently dropped. Intercept
  // the bot's own client.write() instead, which directly captures what the bot
  // attempts to send, whatever the state.
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
    flags: bot.registry.version['>=']('1.21.3') ? {} : 0,
    teleportId: 0
  }
  const movementPackets = ['position', 'position_look', 'look', 'flying']
  let phase = 'play'
  let movementDuringConfig = 0
  server.on('playerJoin', async (client) => {
    const originalWrite = bot._client.write.bind(bot._client)
    bot._client.write = (name, params) => {
      if (phase === 'configuration' && movementPackets.includes(name)) {
        movementDuringConfig++
      }
      return originalWrite(name, params)
    }

    await client.write('login', bot.test.generateLoginPacket())
    const chunk = bot.test.buildChunk()
    chunk.setBlockType(pos, goldId)
    await client.write('map_chunk', bot.test.generateChunkPacket(chunk))
    await once(bot, 'chunkColumnLoad')
    // The initial position enables physics and movement packets
    const p1 = once(bot, 'forcedMove')
    await client.write('position', positionPacket)
    await p1

    // Wait until the in-flight teleport response has been sent so it is
    // not miscounted, then have the proxy pull the client back into the
    // configuration phase.
    await sleep(100)
    await client.write('start_configuration', {})
    // Confirm the client state actually flipped before observing.
    if (bot._client.state !== 'configuration') {
      await once(bot._client, 'state')
    }
    phase = 'configuration'
    await sleep(500)
    phase = 'play'

    assert.strictEqual(movementDuringConfig, 0,
      `physics loop sent ${movementDuringConfig} movement packet(s) during configuration phase`)
    done()
  })
}
