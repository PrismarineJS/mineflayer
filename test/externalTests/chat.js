const assert = require('assert')

module.exports = (supportedVersion) => (bot, done) => {
  const version = parseFloat(supportedVersion.match(/\d+\.\d+/)[0])
  setTimeout(() => {
    console.log(version)
    if (version >= 1.12) {
      console.log('/advancement grant @p only minecraft:story/mine_stone')
      bot.chat('/advancement grant @p only minecraft:story/mine_stone')
      bot.once('message', (json) => {
        const str = json.toString()
        console.log(str)
        assert.strictEqual(str, bot.username + ' has made the advancement [Stone Age]')
        done()
      })
    } else {
      console.log('/achievement give achievement.openInventory @p')
      bot.chat('/achievement give achievement.openInventory @p')
      bot.once('message', (json) => {
        const str = json.toString()
        console.log(str)
        assert.strictEqual(str, bot.username + ' has just earned the achievement [Taking Inventoy]')
        done()
      })
    }
  }, 500)
}
