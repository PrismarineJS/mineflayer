const assert = require('assert')

module.exports = () => (bot, done) => {
  const version = parseFloat(bot.majorVersion)
  if (version >= 1.12) {
    bot.chat('/advancement grant @p only minecraft:story/mine_stone')
    bot.once('message', (json) => {
      const str = json.toString()
      console.log(str)
      assert.strictEqual(str, bot.username + ' has made advancement [Stone Age]')
      done()
    })
  } else {
    bot.chat('/achievement give mminecraft:achievement.openInventory @p')
    bot.once('message', (json) => {
      const str = json.toString()
      console.log(str)
      assert.strictEqual(str, bot.username + ' has just earned achieviement [Taking Inventoy]')
      done()
    })
  }
}
