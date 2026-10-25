const assert = require('assert')
const vec3 = require('vec3')
const { once, sleep } = require('../../lib/promise_utils')

module.exports = {
  'defaults the cursor to the centre of the clicked face and swings after use_item_on': (bot, server, done) => {
    server.on('playerJoin', async (client) => {
      await bot.test.pluginsLoaded
      const loggedIn = once(bot, 'login')
      await client.write('login', bot.test.generateLoginPacket())
      await loggedIn
      bot.lookAt = async () => {}
      const writes = []
      bot._client.write = (name, params) => { writes.push({ name, params }) }
      const block = { position: vec3(1, 65, 1) }
      await bot.activateBlock(block)
      await bot.activateBlock(block, vec3(-1, 0, 0))
      try {
        const scale = bot.supportFeature('blockPlaceHasHandAndFloatCursor') || bot.supportFeature('blockPlaceHasInsideBlock') ? 1 : 16
        assert.deepStrictEqual(writes.map(w => w.name), ['block_place', 'arm_animation', 'block_place', 'arm_animation'])
        const cursor = ({ params }) => [params.cursorX / scale, params.cursorY / scale, params.cursorZ / scale, params.direction]
        assert.deepStrictEqual(cursor(writes[0]), [0.5, 1, 0.5, 1])
        assert.deepStrictEqual(cursor(writes[2]), [0, 0.5, 0.5, 4])
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  'faces the point on the clicked face that the packet reports': async (bot, server) => {
    const blockPos = vec3(1, 65, 1)
    const stoneId = bot.registry.blocksByName.stone.id
    const chunk = bot.test.buildChunk()
    for (let x = 0; x < 16; x++) for (let z = 0; z < 16; z++) chunk.setBlockType(vec3(x, 64, z), stoneId)
    chunk.setBlockType(blockPos, stoneId)
    let sent = null
    await new Promise(resolve => {
      server.on('playerJoin', async (client) => {
        client.write('login', bot.test.generateLoginPacket())
        client.write('map_chunk', bot.test.generateChunkPacket(chunk))
        client.write('position', {
          x: 1.5,
          y: 65,
          z: 4.5,
          dx: 0,
          dy: 0,
          dz: 0,
          yaw: 0,
          pitch: 0,
          flags: bot.registry.version['>=']('1.21.3') ? {} : 0,
          teleportId: 0
        })
        client.on('packet', (data, meta) => { if (meta.name === 'block_place') sent = data })
        await sleep(400)
        resolve()
      })
    })

    // the south face, the one an eye at z = 4.5 can see
    await bot.activateBlock(bot.blockAt(blockPos), vec3(0, 0, 1))
    await sleep(200)
    assert.ok(sent, 'no block_place packet')

    const eye = bot.entity.position.offset(0, bot.entity.eyeHeight, 0)
    const aim = (point) => {
      const d = point.minus(eye)
      return { yaw: Math.atan2(-d.x, -d.z), pitch: Math.atan2(d.y, Math.sqrt(d.x * d.x + d.z * d.z)) }
    }
    const hit = aim(blockPos.offset(0.5, 0.5, 1))
    const middle = aim(blockPos.offset(0.5, 0.5, 0.5))
    assert.ok(Math.abs(hit.pitch - middle.pitch) > 0.05, 'the two aims must be far enough apart to tell apart')
    assert.ok(Math.abs(bot.entity.pitch - hit.pitch) < 0.02,
      `pitch ${bot.entity.pitch} should face the reported hit at ${hit.pitch}, the block's middle is ${middle.pitch}`)
    assert.ok(Math.abs(bot.entity.yaw - hit.yaw) < 0.02, `yaw ${bot.entity.yaw} should face the reported hit at ${hit.yaw}`)
  }
}
