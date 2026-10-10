const assert = require('assert')
const { EventEmitter } = require('events')
const { onceWithCleanup } = require('../../../lib/promise_utils')

module.exports = async (bot, server) => {
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
}
