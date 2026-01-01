const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  await bot.test.wait(3000) // Increased initial delay

  bot.test.sayEverywhere('/weather clear')
  await bot.test.wait(2000) // Increased from 1000ms
  bot.test.sayEverywhere('/weather rain')

  await once(bot, 'rain')
  assert.strictEqual(bot.isRaining, true)
  bot.test.sayEverywhere('/weather clear')

  await once(bot, 'rain')
  assert.strictEqual(bot.isRaining, false)
}
