const assert = require('assert')
const { EventEmitter } = require('events')
const { onceWithCleanup } = require('../../../lib/promise_utils')

module.exports = async (bot, server) => {
  const emitter = new EventEmitter()
  const abort = new AbortController()
  const reason = new Error('no longer interested')
  const promise = onceWithCleanup(emitter, 'thing', { signal: abort.signal })
  abort.abort(reason)
  await assert.rejects(promise, err => err === reason)
  assert.strictEqual(emitter.listenerCount('thing'), 0)
}
