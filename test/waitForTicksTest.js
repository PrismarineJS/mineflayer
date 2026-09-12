/* eslint-env mocha */

const assert = require('assert')
const EventEmitter = require('events')
const Vec3 = require('vec3').Vec3
const registryLoader = require('prismarine-registry')

// The physics plugin injects against a stub, so waitForTicks can be exercised without a server.
function fakeBot () {
  const registry = registryLoader('1.21.4')
  const bot = new EventEmitter()
  bot.registry = registry
  bot.version = '1.21.4'
  bot.supportFeature = registry.supportFeature.bind(registry)
  bot.blockAt = () => null
  bot._client = new EventEmitter()
  bot._client.write = () => {}
  bot.entity = { position: new Vec3(0, 64, 0), velocity: new Vec3(0, 0, 0), yaw: 0, pitch: 0, onGround: true, height: 1.8, eyeHeight: 1.62 }
  bot.game = {}
  require('../lib/plugins/physics')(bot, {})
  return bot
}

describe('bot.waitForTicks', () => {
  it('resolves after that many physics ticks', async () => {
    const bot = fakeBot()
    const waited = bot.waitForTicks(3)
    for (let i = 0; i < 3; i++) bot.emit('physicsTick')
    await waited
  })

  it('says so instead of waiting out the timeout when physics is off', async () => {
    const bot = fakeBot()
    bot.physicsEnabled = false
    const started = Date.now()
    await assert.rejects(() => bot.waitForTicks(20), /bot\.physicsEnabled is false/)
    assert.ok(Date.now() - started < 1000, 'rejects straight away rather than after the timeout')
  })

  it('names the requested tick count, and the disabled physics, when it times out', async function () {
    this.timeout(9000)
    const bot = fakeBot()
    const waited = bot.waitForTicks(20)
    bot.emit('physicsTick')
    bot.emit('physicsTick') // partial progress: the message must still say 20
    bot.physicsEnabled = false
    await assert.rejects(() => waited, (err) => {
      assert.match(err.message, /Timeout waiting for 20 ticks/)
      assert.match(err.message, /physics was disabled while waiting/)
      return true
    })
  })
})
