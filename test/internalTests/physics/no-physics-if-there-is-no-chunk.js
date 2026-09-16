const assert = require('assert')
const { sleep } = require('../../../lib/promise_utils')

module.exports = (bot, server, done) => {
  let fail = 0
  const basePosition = {
    x: 1.5,
    y: 66,
    z: 1.5,
    dx: 0, // 1.21.3
    dy: 0, // 1.21.3
    dz: 0, // 1.21.3
    pitch: 0,
    yaw: 0,
    flags: bot.registry.version['>=']('1.21.3') ? {} : 0,
    teleportId: 0
  }
  server.on('playerJoin', async (client) => {
    await client.write('login', bot.test.generateLoginPacket())
    await client.write('position', basePosition)
    client.on('packet', (data, meta) => {
      const packetName = meta.name
      switch (packetName) {
        case 'position':
          fail++
          break
        case 'position_look':
          fail++
          break
        case 'look':
          fail++
          break
      }
      if (fail > 1) assert.fail('position packet sent')
    })
    await sleep(2000)
    done()
  })
}
