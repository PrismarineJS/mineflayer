const assert = require('assert')

module.exports = () => (bot, done) => {
  bot.chat('/advancement grant @p only minecraft:story/mine_stone')
  bot.on('message', (json) => {
    assert.strictEqual(json.toString(), bot.username + ' has made advancement [Stone Age]')
    done()
  })
}
