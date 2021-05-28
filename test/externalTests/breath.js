const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  await once(bot, 'breath')
  assert.strictEqual(bot.oxygenLevel, 20)
  bot.test.sayEverywhere('im breathing')
}
