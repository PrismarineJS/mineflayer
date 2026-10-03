const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  if (bot.isRaining) {
    bot.test.sayEverywhere('/weather clear')
    await once(bot, 'rain')
  }
  assert.strictEqual(bot.isRaining, false)
  bot.test.sayEverywhere('/weather rain')

  await once(bot, 'rain')
  assert.strictEqual(bot.isRaining, true)
  bot.test.sayEverywhere('/weather clear')

  await once(bot, 'rain')
  assert.strictEqual(bot.isRaining, false)
}
