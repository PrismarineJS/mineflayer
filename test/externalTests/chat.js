const assert = require('assert')

module.exports = () => (bot, done) => {
  setTimeout(() => {
    bot.chat('/tellraw @p {"translate":"language.name"}')
    bot.once('message', (json) => {
      const str = json.toString()
      console.log(str)
      assert.strictEqual(str, 'English')
      done()
    })
  }, 500)
}
