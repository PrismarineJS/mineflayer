const assert = require('assert')

module.exports = () => async (bot) => {
  const player = bot.players[bot.username]
  assert.strictEqual(player.displayName.toString(), bot.username)
}
