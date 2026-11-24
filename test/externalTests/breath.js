const assert = require('assert')

module.exports = () => async (bot) => {
  await bot.waitForChunksToLoad()
  assert.strictEqual(bot.oxygenLevel, 20, 'Wrong oxygen level')
}
