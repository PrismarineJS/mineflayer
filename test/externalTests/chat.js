const assert = require('assert')
const { once } = require('events')

module.exports = () => async (bot) => {
  await bot.test.wait(500)
  bot.chat('/tellraw @p {"translate":"language.name"}')
  const [json] = await once(bot, 'message')
  const str = json.toString()
  console.log(str)
  assert.strictEqual(str, 'English')
}
