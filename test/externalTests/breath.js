const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  bot.chat('/setblock ~ ~2 ~ water')
  bot.chat('/setblock ~1 ~1 ~ water')
  bot.chat('/setblock ~ ~1 ~1 water')
  bot.chat('/setblock ~1 ~1 ~1 water')
  bot.chat('/setblock ~ ~1 ~ water')
  await once(bot, 'breath')
  await new Promise((resolve, reject) => setTimeout(resolve, 5000))
  assert.strictEqual(bot.oxygenLevel, 20, 'Wrong oxygen level')
}
