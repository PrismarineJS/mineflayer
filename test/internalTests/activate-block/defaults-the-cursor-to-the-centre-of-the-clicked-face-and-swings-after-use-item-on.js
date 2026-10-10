const assert = require('assert')
const vec3 = require('vec3')
const { once } = require('../../../lib/promise_utils')

module.exports = (bot, server, done) => {
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
}
