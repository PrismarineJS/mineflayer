const assert = require('assert')
const vec3 = require('vec3')
const { sleep, once } = require('../../../lib/promise_utils')

module.exports = (bot, server, done) => {
  const pos = vec3(1, 65, 1)
  const goldId = 41

  server.on('playerJoin', async (client) => {
    client.write('login', bot.test.generateLoginPacket())
    const chunk = bot.test.buildChunk()
    chunk.setBlockType(pos, goldId)
    await client.write('map_chunk', bot.test.generateChunkPacket(chunk))
    await client.write('position', {
      x: 1.5,
      y: 66,
      z: 1.5,
      dx: 0,
      dy: 0,
      dz: 0,
      pitch: 0,
      yaw: 0,
      teleportId: 1,
      flags: bot.supportFeature('positionPacketHasBitflags') ? { x: false, y: false, z: false, yaw: false, pitch: false } : 0
    })
    await once(bot, 'physicsTick')
    await sleep(300)
    // No physics tick can run during the stall (30 ticks' worth).
    const stallUntil = Date.now() + 1500
    while (Date.now() < stallUntil) { /* busy wait */ }
    let ticks = 0
    const count = () => ticks++
    bot.on('physicsTick', count)
    await sleep(500)
    bot.off('physicsTick', count)
    // 10 ticks at 20 tps plus one burst of at most maxCatchupTicks (4).
    assert.ok(ticks <= 18, `${ticks} physics ticks in the 500 ms after a 1.5 s stall`)
    assert.ok(ticks >= 8, `only ${ticks} physics ticks in 500 ms`)
    done()
  })
}
