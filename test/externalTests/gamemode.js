// test to see if bot retains creative gamemode in bot object on death

const assert = require('assert')

module.exports = async (bot) => {
  bot.test.becomeCreative()
  bot.chat(`/kill ${bot.username}`)
  await new Promise((resolve, reject) => setTimeout(resolve, 5000))
  assert.strictEqual(bot.game.gameMode, 'creative', 'Failed to parse respawn packet')
}
