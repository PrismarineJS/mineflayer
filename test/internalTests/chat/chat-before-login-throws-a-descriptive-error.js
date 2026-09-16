const assert = require('assert')
const { once } = require('../../../lib/promise_utils')

module.exports = async (bot, server) => {
  await once(bot, 'inject_allowed')
  const early = /before the client entered the play state; wait for/
  assert.throws(() => bot.chat('hi'), early)
  assert.throws(() => bot.whisper('gary', 'hi'), early)
}
