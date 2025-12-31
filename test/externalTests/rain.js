const assert = require('assert')
const { once } = require('../../lib/promise_utils')
module.exports = () => async (bot) => {
  await bot.test.wait(3000) // Increased from 2000ms to 3000ms

  bot.test.sayEverywhere('/weather clear')
  await bot.test.wait(2000) // Increased from 1000ms to 2000ms

  bot.test.sayEverywhere('/weather rain')
  await once(bot, 'rain')
  assert.strictEqual(bot.isRaining, true)

  await bot.test.wait(1000) // Add delay between weather changes

  bot.test.sayEverywhere('/weather clear')
  await once(bot, 'rain')
  assert.strictEqual(bot.isRaining, false)
}
