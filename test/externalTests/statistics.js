const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  const stats = await bot.requestStatistics()

  assert.strictEqual(typeof stats, 'object')
}
