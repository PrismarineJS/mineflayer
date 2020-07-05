const assert = require('assert')

module.exports = (supportedVersion) => (bot, done) => {
  setTimeout(() => {
    if (/^1.(8|9|10|11)/.test(supportedVersion)) {
      console.log('/achievement give achievement.openInventory @p')
      bot.chat('/achievement give achievement.openInventory @p')
    } else {
      console.log('/advancement grant @p only minecraft:story/mine_stone')
      bot.chat('/advancement grant @p only minecraft:story/mine_stone')
    }
    bot.once('message', (json) => {
      const str = json.toString()
      console.log(str)
      assert.ok(str.test(/[\w_]+ has (just earned|made) the (achievement|advancement) \[(Taking Inventoy|Stone Age)\]$/))
      done()
    })
  }, 500)
}
