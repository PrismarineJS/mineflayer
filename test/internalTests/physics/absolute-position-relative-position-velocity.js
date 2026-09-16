const assert = require('assert')
const vec3 = require('vec3')
const { once } = require('../../../lib/promise_utils')

module.exports = (bot, server, done) => {
  const pos = vec3(1, 65, 1)
  const goldId = 41

  server.on('playerJoin', async (client) => {
    await client.write('login', bot.test.generateLoginPacket())
    const chunk = bot.test.buildChunk()
    chunk.setBlockType(pos, goldId)
    await client.write('map_chunk', bot.test.generateChunkPacket(chunk))

    await once(bot, 'chunkColumnLoad')

    // --- Test 1: Absolute Position ---
    const absolutePositionPacket = {
      x: 1.5,
      y: 80,
      z: 1.5,
      pitch: 0,
      yaw: 0,
      teleportId: 1,
      flags: bot.supportFeature('positionPacketHasBitflags') ? { x: false, y: false, z: false, yaw: false, pitch: false } : 0
    }

    bot.entity.velocity.y = -1.0 // Give bot some velocity

    const p1 = once(bot, 'forcedMove')
    client.write('position', absolutePositionPacket)
    await p1

    // Assertions for absolute teleport
    assert.strictEqual(bot.entity.velocity.y, 0, 'Velocity should be reset to 0 after an absolute teleport')
    assert.deepStrictEqual(bot.entity.position, vec3(1.5, 80, 1.5), 'Position should be set absolutely')

    // --- Test 2: Relative Position ---
    const relativePositionPacket = {
      x: 1.0,
      y: -2.0,
      z: 0.5,
      pitch: 0,
      yaw: 0,
      teleportId: 2,
      flags: bot.supportFeature('positionPacketHasBitflags') ? { x: true, y: true, z: true, yaw: false, pitch: false } : 7
    }

    // Set a known velocity *before* the relative update
    bot.entity.velocity.y = -1.0
    const initialPosition = bot.entity.position.clone()
    const expectedPosition = initialPosition.plus(vec3(1.0, -2.0, 0.5))

    const p2 = once(bot, 'forcedMove')
    client.write('position', relativePositionPacket)
    await p2

    // Assertions for relative teleport
    assert.notStrictEqual(bot.entity.velocity.y, 0, 'Velocity should be preserved after a relative teleport')
    assert.deepStrictEqual(bot.entity.position, expectedPosition, 'Position should be updated relatively')

    done()
  })
}
