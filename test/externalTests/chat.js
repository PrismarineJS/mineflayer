const assert = require('assert')

module.exports = () => (bot, done) => {
  if (1.12 <= parseFloat(bot.majorVersion)) {
    bot.chat('/advancement grant @p only minecraft:story/mine_stone')
    bot.on('message', (json) => {
      const str = json.toString()
      console.log(str)
      assert.strictEqual(str, bot.username + ' has made advancement [Stone Age]')
      done()
    })
  } else {
    bot.chat('/achievement give mminecraft:achievement.openInventory @p')
    bot.on('message', (json) => {
      const str = json.toString()
      console.log(str)
      assert.strictEqual(str, bot.username + ' has just earned achieviement [Taking Inventoy]')
      done()
    })
  }
}
