/* eslint-env mocha */

const EventEmitter = require('events')
const assert = require('assert')
const { Vec3 } = require('vec3')
const inject = require('../lib/plugins/digging')

describe('digging plugin waitTime', () => {
  function createMockBot () {
    const bot = new EventEmitter()
    bot.targetDigBlock = null
    bot.targetDigFace = null
    bot.lastDigTime = null
    bot._client = { write: () => {} }
    bot.entity = {
      position: new Vec3(0, 0, 0),
      isInWater: false,
      onGround: true,
      eyeHeight: 1.62,
      effects: {}
    }
    bot.heldItem = null
    bot.game = { gameMode: 'survival' }
    bot.inventory = { slots: [] }
    bot.getEquipmentDestSlot = () => 5
    bot.swingArm = () => {}
    bot.world = { raycast: () => null }
    bot._updateBlockState = () => {}
    return bot
  }

  function createMockBlock () {
    return {
      name: 'stone',
      position: new Vec3(0, 64, 0),
      shapes: []
    }
  }

  it('throws when digTime returns Infinity', async () => {
    const bot = createMockBot()
    inject(bot)
    bot.digTime = () => Infinity
    bot.lookAt = () => Promise.resolve()

    await assert.rejects(
      bot.dig(createMockBlock()),
      /dig time for stone is Infinity/
    )
  })

  it('recomputes waitTime after lookAt resolves so the finishDigging timer reflects post-await state', async () => {
    const bot = createMockBot()
    inject(bot)

    const callOrder = []
    bot.digTime = function () {
      callOrder.push('digTime')
      return 100
    }
    bot.lookAt = function () {
      callOrder.push('lookAt-start')
      return new Promise((resolve) => {
        setImmediate(() => {
          callOrder.push('lookAt-resolve')
          resolve()
        })
      })
    }

    const block = createMockBlock()
    const digPromise = bot.dig(block)

    // Allow lookAt to resolve and dig() to reach `await diggingTask.promise`
    await new Promise((resolve) => setImmediate(resolve))
    await new Promise((resolve) => setImmediate(resolve))

    // Simulate the server-side block update that resolves the dig task cleanly
    bot.emit(`blockUpdate:${block.position}`, null, { type: 0 })
    await digPromise

    const lastLookAtResolve = callOrder.lastIndexOf('lookAt-resolve')
    const lastDigTime = callOrder.lastIndexOf('digTime')

    assert.ok(
      lastDigTime > lastLookAtResolve,
      `bot.digTime should be called after lookAt resolves so the timer reflects post-await state. Got call order: ${callOrder.join(' -> ')}`
    )
  })
})
