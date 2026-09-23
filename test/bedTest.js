const assert = require('assert')
const { EventEmitter } = require('events')
const { Vec3 } = require('vec3')
const injectBed = require('../lib/plugins/bed')

describe('bed plugin', () => {
  it('removes the sleep listener when waiting times out', async () => {
    const bot = new EventEmitter()
    bot._client = new EventEmitter()
    bot._client.write = () => {}
    bot.registry = { blocksByStateId: {} }
    bot.supportFeature = () => false
    bot.isRaining = false
    bot.thunderState = 0
    bot.time = { timeOfDay: 18000 }
    bot.entity = { id: 1, position: new Vec3(0, 0, 0) }
    bot.entities = {}
    bot.game = { gameMode: 'creative' }
    bot.canDigBlock = () => true

    const bed = { name: 'bed', position: new Vec3(0, 0, 0), metadata: 0 }
    const head = { name: 'bed', position: new Vec3(0, 0, 1), metadata: 0 }
    bot.blockAt = (position) => position.equals(head.position) ? head : bed
    bot.activateBlock = () => {}

    injectBed(bot)

    const realSetTimeout = global.setTimeout
    const realClearTimeout = global.clearTimeout
    let timeoutCallback
    global.setTimeout = (callback) => {
      timeoutCallback = callback
      return 1
    }
    global.clearTimeout = () => {}

    try {
      const sleeping = bot.sleep(bed)
      assert.strictEqual(bot.listenerCount('sleep'), 1)

      timeoutCallback()

      await assert.rejects(sleeping, /bot is not sleeping/)
      assert.strictEqual(bot.listenerCount('sleep'), 0)
    } finally {
      global.setTimeout = realSetTimeout
      global.clearTimeout = realClearTimeout
    }
  })
})
