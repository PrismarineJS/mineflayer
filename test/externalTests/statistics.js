const assert = require('assert')

module.exports = () => async (bot) => {
  const stats = await bot.requestStatistics()

  assert.strictEqual(typeof stats, 'object')
}
