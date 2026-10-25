const assert = require('assert')
const { EventEmitter } = require('events')
const { onceWithCleanup } = require('../../lib/promise_utils')

module.exports = {
  'rejects instead of throwing out of emit when checkCondition throws': async (bot, server) => {
    // A condition that throws used to unwind whatever was emitting. For a
    // client event that is the socket read path, which then stops delivering
    // packets entirely and the bot dies on the next keepalive.
    const emitter = new EventEmitter()
    const boom = new Error('condition blew up')
    const promise = onceWithCleanup(emitter, 'thing', {
      checkCondition: () => { throw boom }
    })
    assert.doesNotThrow(() => emitter.emit('thing'))
    await assert.rejects(promise, err => err === boom)
    assert.strictEqual(emitter.listenerCount('thing'), 0)
  },

  'rejects and removes the listener when the signal is aborted': async (bot, server) => {
    const emitter = new EventEmitter()
    const abort = new AbortController()
    const reason = new Error('no longer interested')
    const promise = onceWithCleanup(emitter, 'thing', { signal: abort.signal })
    abort.abort(reason)
    await assert.rejects(promise, err => err === reason)
    assert.strictEqual(emitter.listenerCount('thing'), 0)
  }
}
