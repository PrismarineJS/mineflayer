const assert = require('assert')

module.exports = () => async (bot) => {
  const stats = await bot.requestStatistics()

  console.log(stats)

  assert.strictEqual(typeof stats, 'object')
}
