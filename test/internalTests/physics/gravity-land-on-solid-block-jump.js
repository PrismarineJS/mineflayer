const assert = require('assert')
const vec3 = require('vec3')

module.exports = (bot, server, done) => {
  const pos = vec3(1, 65, 1)
  const goldId = 41

  let y = 80
  let landed = false
  bot.on('move', () => {
    if (landed) return
    assert.ok(bot.entity.position.y <= y)
    assert.ok(bot.entity.position.y >= pos.y)
    y = bot.entity.position.y
    if (bot.entity.position.y <= pos.y + 1) {
      assert.strictEqual(bot.entity.position.y, pos.y + 1)
      assert.strictEqual(bot.entity.onGround, true)
      landed = true
      done()
    } else {
      assert.strictEqual(bot.entity.onGround, false)
    }
  })
  server.on('playerJoin', (client) => {
    client.write('login', bot.test.generateLoginPacket())
    const chunk = bot.test.buildChunk()

    chunk.setBlockType(pos, goldId)
    client.write('map_chunk', bot.test.generateChunkPacket(chunk))
    client.write('position', {
      x: 1.5,
      y: 80,
      z: 1.5,
      pitch: 0,
      yaw: 0,
      flags: bot.supportFeature('positionPacketHasBitflags') ? { x: false, y: false, z: false, yaw: false, pitch: false } : 0,
      teleportId: 0
    })
  })
}
