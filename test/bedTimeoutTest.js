/* global describe, it */
const assert = require('assert')
const { EventEmitter } = require('events')
const { Vec3 } = require('vec3')
const injectBed = require('../lib/plugins/bed')

function createBot () {
  const bot = new EventEmitter()
  bot._client = new EventEmitter()
  bot.isRaining = false
  bot.thunderState = 0
  bot.time = { timeOfDay: 13000 }
  bot.game = { gameMode: 'creative' }
  bot.entity = { position: new Vec3(0, 0, 0) }
  bot.entities = {}
  bot.supportFeature = feature => feature === 'blockMetadata'
  bot.canDigBlock = () => true
  bot.activateBlock = () => {}
  injectBed(bot)
  return bot
}

describe('bed', function () {
  it('removes the sleep listener when waiting times out', async function () {
    const bot = createBot()
    const bed = {
      name: 'bed',
      metadata: 8,
      position: new Vec3(0, 0, 0)
    }

    const originalSetTimeout = global.setTimeout
    const originalClearTimeout = global.clearTimeout
    let timeoutCallback

    global.setTimeout = (callback) => {
      timeoutCallback = callback
      return 1
    }
    global.clearTimeout = () => {}

    try {
      const sleepPromise = bot.sleep(bed)
      assert.strictEqual(bot.listenerCount('sleep'), 1)

      timeoutCallback()
      await assert.rejects(sleepPromise, /bot is not sleeping/)

      assert.strictEqual(bot.listenerCount('sleep'), 0)
    } finally {
      global.setTimeout = originalSetTimeout
      global.clearTimeout = originalClearTimeout
    }
  })
})
