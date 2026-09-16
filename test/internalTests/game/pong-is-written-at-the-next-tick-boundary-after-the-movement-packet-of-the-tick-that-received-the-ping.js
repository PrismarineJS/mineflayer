const assert = require('assert')
const vec3 = require('vec3')
const { sleep, once, onceWithCleanup } = require('../../../lib/promise_utils')

module.exports = function (bot, server, done) {
  if (bot.supportFeature('transactionPacketExists')) {
    this.skip()
    return
  }
  const movementPackets = ['position', 'position_look', 'look', 'flying']
  server.on('playerJoin', async (client) => {
    try {
      client.write('login', bot.test.generateLoginPacket())
      const chunk = bot.test.buildChunk()
      chunk.setBlockType(vec3(1, 65, 1), 41)
      client.write('map_chunk', bot.test.generateChunkPacket(chunk))
      await once(bot, 'chunkColumnLoad')
      client.write('position', {
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
      })
      await once(bot, 'forcedMove')

      // Falling takes a few ticks to leave the teleport height.
      await bot.waitForTicks(4)

      const seen = []
      client.on('packet', (data, meta) => seen.push({ name: meta.name, data }))

      // The ping is processed inside a tick: after the simulation, before
      // the movement packet carrying this tick's position.
      const { tickY, pingedAt } = await new Promise(resolve => {
        bot.once('physicsTick', () => {
          bot._client.emit('ping', { id: 123 })
          resolve({ tickY: bot.entity.position.y, pingedAt: Date.now() })
        })
      })
      assert.ok(tickY < 80, 'bot must be falling so every tick writes a movement packet')

      const [pong] = await onceWithCleanup(client, 'pong', { timeout: 200 })
      const pongedAt = Date.now()
      assert.strictEqual(pong.id, 123)
      assert.ok(pongedAt - pingedAt <= 200, `pong took ${pongedAt - pingedAt} ms`)

      await sleep(100)
      const pongs = seen.filter(p => p.name === 'pong')
      assert.strictEqual(pongs.length, 1, 'each ping is answered exactly once')
      const pongIndex = seen.indexOf(pongs[0])
      const before = seen.slice(0, pongIndex)
      // The pong is written at the tick boundary, after that tick's movement packet. On 1.21.2+ the tick also ends
      // with a tick_end packet, so tick_end (not the movement packet) is what immediately precedes the pong; only
      // tick_end may sit between the movement packet and the pong.
      const lastMovement = [...before].reverse().find(p => movementPackets.includes(p.name))
      assert.ok(lastMovement !== undefined, 'a movement packet precedes the pong')
      assert.strictEqual(lastMovement.data.y, tickY, 'the pong follows the movement packet of the tick that received the ping')
      const between = before.slice(before.lastIndexOf(lastMovement) + 1)
      assert.ok(between.every(p => p.name === 'tick_end'), `only tick_end may separate the movement packet from the pong, saw ${between.map(p => p.name).join(', ')}`)
      done()
    } catch (err) {
      done(err)
    }
  })
}
