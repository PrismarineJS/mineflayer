const assert = require('assert')

module.exports = () => (bot, done) => {
  const player = bot.players[bot.username]
  assert.strictEqual(player.displayName.toString(), bot.username)
  done()
}
