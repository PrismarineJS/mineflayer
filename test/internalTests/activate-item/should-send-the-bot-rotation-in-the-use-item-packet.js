const assert = require('assert')
const { sleep } = require('../../../lib/promise_utils')

module.exports = function (bot, server, done) {
  // The rotation field in use_item was added in 1.21.1
  const useItemFields = bot.registry.protocol?.play?.toServer?.types?.packet_use_item?.[1]
  const hasRotation = useItemFields && useItemFields.some(f => f.name === 'rotation')
  if (!hasRotation) {
    this.skip()
    return
  }
  const { toNotchianYaw, toNotchianPitch } = require('../../../lib/conversions')
  const testYaw = 1.5
  const testPitch = -0.3
  server.on('playerJoin', async (client) => {
    await bot.test.pluginsLoaded
    await client.write('login', bot.test.generateLoginPacket())
    await client.write('position', {
      x: 0,
      y: 66,
      z: 0,
      dx: 0,
      dy: 0,
      dz: 0,
      yaw: 0,
      pitch: 0,
      flags: bot.registry.version['>=']('1.21.3') ? {} : 0,
      teleportId: 0
    })

    client.on('packet', (data, meta) => {
      if (meta.name === 'use_item') {
        const expectedYaw = toNotchianYaw(testYaw)
        const expectedPitch = toNotchianPitch(testPitch)
        assert.ok(data.rotation, 'use_item packet should have rotation field')
        assert.ok(Math.abs(data.rotation.x - expectedYaw) < 0.001,
          `Expected yaw ${expectedYaw}, got ${data.rotation.x}`)
        assert.ok(Math.abs(data.rotation.y - expectedPitch) < 0.001,
          `Expected pitch ${expectedPitch}, got ${data.rotation.y}`)
        done()
      }
    })

    await sleep(100)
    bot.entity.yaw = testYaw
    bot.entity.pitch = testPitch
    bot.activateItem()
  })
}
