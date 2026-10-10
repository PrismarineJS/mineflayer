const assert = require('assert')
const { sleep, once } = require('../../../lib/promise_utils')

module.exports = (bot, server, done) => {
  server.on('playerJoin', (client) => {
    const clicks = []
    let closed = false
    client.on('packet', (data, meta) => {
      if (meta.name === 'close_window') closed = true
      if (meta.name !== 'window_click') return
      clicks.push(data)
      assert.ok(closed, 'the sync click must follow close_window')
      client.write('transaction', { windowId: data.windowId, action: data.action, accepted: true })
    })
    const loggedIn = once(bot, 'login')
    client.write('login', bot.test.generateLoginPacket())
    loggedIn
      .then(() => bot.closeWindow(bot.inventory))
      .then(() => sleep(100))
      .then(() => {
        if (bot.supportFeature('stateIdUsed')) {
          assert.strictEqual(clicks.length, 0)
        } else {
          assert.strictEqual(clicks.length, 1)
          assert.strictEqual(clicks[0].windowId, 0)
          assert.strictEqual(clicks[0].slot, -999)
          assert.strictEqual(clicks[0].mode, 0)
          assert.strictEqual(clicks[0].mouseButton, 0)
        }
      })
      .then(done, done)
  })
}
