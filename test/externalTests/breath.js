const assert = require('assert')

module.exports = () => async (bot) => {
  await new Promise((resolve, reject) => setTimeout(resolve, 5000))
  assert.strictEqual(bot.oxygenLevel, 20, 'Wrong oxygen level')
}
