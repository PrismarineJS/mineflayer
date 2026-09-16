const assert = require('assert')
const { once } = require('../../../lib/promise_utils')

module.exports = async (bot, server) => {
  // Replaces the server's login handler so the client is rejected while still in the login state.
  server.on('connection', (client) => {
    client.removeAllListeners('login_start')
    client.once('login_start', () => client.end('kicked'))
  })
  const [reason] = await once(bot, 'end')
  const kicked = new RegExp(`disconnected before entering the play state \\(${reason}\\)`)
  assert.throws(() => bot.chat('hi'), kicked)
  assert.throws(() => bot.whisper('gary', 'hi'), kicked)
}
