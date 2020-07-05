const assert = require('assert')

module.exports = (supportedVersion) => (bot, done) => {
  setTimeout(() => {
    bot.chat('/tellraw flatbot {"translate":"commands.fill.failed"}')
    bot.once('message', (json) => {
      const str = json.toString()
      console.log(str)
      assert.strictEqual(str, 'No blocks filled')
      done()
    })
  }, 500)
}
