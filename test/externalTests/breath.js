const assert = require('assert')

module.exports = () => async (bot) => {
  await new Promise((resolve, reject) => setTimeout(resolve, 5000))
  // TODO: ** Fix in 1.17
  if (bot.oxygenLevel) assert.strictEqual(bot.oxygenLevel, 20, 'Wrong oxygen level')
}
