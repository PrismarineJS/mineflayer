const assert = require('assert')

module.exports = (supportedVersion) => (bot, done) => {
  setTimeout(() => {
    console.log('/advancement grant @p only minecraft:story/mine_stone')
    bot.chat('/advancement grant @p only minecraft:story/mine_stone')
    bot.once('message', (json) => {
      const str = json.toString()
      console.log(str)
      
      if (/\/help/.test(str)) {
        // Before 1.12
        console.log('/achievement give achievement.openInventory @p')
        bot.chat('/achievement give achievement.openInventory @p')
        bot.once('message', (json) => {
          const str = json.toString()
          console.log(str)
          
          assert.ok(str.test(/has (just earned|made) the (achievement|advancement) \[(Taking Inventoy|Stone Age)\]/))
          done()
        })
      } else {
        assert.ok(str.test(/has (just earned|made) the (achievement|advancement) \[(Taking Inventoy|Stone Age)\]/))
        done()
      }
    })
  }, 500)
}
