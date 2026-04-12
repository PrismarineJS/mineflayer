/* eslint-env mocha */

const EventEmitter = require('events')
const assert = require('assert')
const inject = require('../lib/plugins/digging')

describe('digging plugin death handler', () => {
  function createMockBot () {
    const bot = new EventEmitter()
    // The digging plugin assigns these on the bot
    bot.targetDigBlock = null
    bot.targetDigFace = null
    bot.lastDigTime = null
    // stopDigging is set by the plugin, but starts as the noop at bottom of digging.js
    // We don't pre-set it so the plugin can assign it
    // Provide minimal _client stub for stopDigging path (write is called during cancel)
    bot._client = { write: () => {} }
    // entity stub needed if canDigBlock or digTime are called
    bot.entity = {
      position: { x: 0, y: 0, z: 0, offset: () => ({ x: 0, y: 0, z: 0, distanceTo: () => 0 }) },
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
    return bot
  }

  it('should not throw when death is emitted and no digging is in progress', () => {
    const bot = createMockBot()
    inject(bot)
    // Simply emitting death should not throw
    assert.doesNotThrow(() => {
      bot.emit('death')
    })
  })

  it('should not throw when death is emitted and stopDigging throws', () => {
    const bot = createMockBot()
    inject(bot)
    // Simulate a broken stopDigging that throws
    bot.stopDigging = () => {
      throw new Error('unexpected state error')
    }
    // The try/catch in the death handler should swallow this
    assert.doesNotThrow(() => {
      bot.emit('death')
    })
  })

  it('should not throw when death is emitted with problematic event listeners', () => {
    const bot = createMockBot()
    inject(bot)
    // Add a listener for diggingAborted that would be removed
    bot.on('diggingAborted', () => {})
    bot.on('diggingCompleted', () => {})
    // Override removeAllListeners to throw (simulating the crash scenario)
    const origRemoveAll = bot.removeAllListeners.bind(bot)
    bot.removeAllListeners = (event) => {
      if (event === 'diggingAborted') {
        throw new Error('Cannot read properties of undefined')
      }
      return origRemoveAll(event)
    }
    // The try/catch should protect against this
    assert.doesNotThrow(() => {
      bot.emit('death')
    })
  })

  it('should clean up digging listeners on death when digging is active', () => {
    const bot = createMockBot()
    inject(bot)
    // Simulate active listeners
    bot.on('diggingAborted', () => {})
    bot.on('diggingCompleted', () => {})
    assert.ok(bot.listenerCount('diggingAborted') > 0)
    assert.ok(bot.listenerCount('diggingCompleted') > 0)
    bot.emit('death')
    // After death, digging listeners should be removed
    assert.strictEqual(bot.listenerCount('diggingAborted'), 0)
    assert.strictEqual(bot.listenerCount('diggingCompleted'), 0)
  })
})
